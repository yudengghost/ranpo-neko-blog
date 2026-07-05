<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { hexToNumber } from '@/utils/color'
import { siteConfig } from '@/config'

const emit = defineEmits<{ done: [] }>()

const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
const nameRef = ref<HTMLDivElement>()

let app: Application | null = null
let ctx: gsap.Context | null = null

const DIAMOND_R = 80
const LINE_WIDTH = 2
const TOTAL_EDGES = 4
const HOLD_TIME = 0.7
const SHATTER_DURATION = 0.6

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

onMounted(async () => {
  if (!containerRef.value) return

  app = new Application()
  await app.init({
    canvas: document.createElement('canvas'),
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    autoStart: false,
  })

  containerRef.value.appendChild(app.canvas)

  const cx = app.screen.width / 2
  const cy = app.screen.height / 2
  const color = hexToNumber(colors.value.cursorColor)

  // === Diamond vertices ===
  const top = { x: cx, y: cy - DIAMOND_R }
  const right = { x: cx + DIAMOND_R, y: cy }
  const bottom = { x: cx, y: cy + DIAMOND_R }
  const left = { x: cx - DIAMOND_R, y: cy }
  const vertices = [top, right, bottom, left]
  const sides = vertices.map((v, i) => [v, vertices[(i + 1) % TOTAL_EDGES]!] as const)

  // Single Graphics for the diamond — drawn progressively
  const diamondGfx = new Graphics()
  app.stage.addChild(diamondGfx)

  // Draw diamond path
  function drawDiamond(progress: number) {
    diamondGfx.clear()
    const totalProgress = Math.min(progress * TOTAL_EDGES, TOTAL_EDGES)
    const currentEdge = Math.floor(totalProgress)
    const edgeFrac = totalProgress - currentEdge

    const start = vertices[0]!
    diamondGfx.moveTo(start.x, start.y)

    for (let i = 0; i < currentEdge; i++) {
      const next = vertices[(i + 1) % TOTAL_EDGES]!
      diamondGfx.lineTo(next.x, next.y)
    }

    if (currentEdge < TOTAL_EDGES && edgeFrac > 0) {
      const s = vertices[currentEdge]!
      const e = vertices[(currentEdge + 1) % TOTAL_EDGES]!
      diamondGfx.lineTo(s.x + (e.x - s.x) * edgeFrac, s.y + (e.y - s.y) * edgeFrac)
    }

    diamondGfx.stroke({ width: LINE_WIDTH, color, alpha: 1 })
  }

  // Particles container for shatter phase
  const particles: Particle[] = []

  function drawParticles(g: Graphics, pts: Particle[]) {
    g.clear()
    for (const p of pts) {
      g.circle(p.x, p.y, p.size)
      g.fill({ color, alpha: p.alpha })
    }
  }

  // Initial render to show empty canvas
  app.render()

  // Wrap all GSAP animations in context for auto-cleanup on unmount
  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      onUpdate() { if (app) app.render() },
      onComplete() {
        if (containerRef.value) {
          gsap.to(containerRef.value, { opacity: 0, duration: 0.35, ease: 'power2.in' })
        }
        setTimeout(() => emit('done'), 350)
      },
    })

    // Phase 1: single-stroke diamond drawing
    const drawObj = { progress: 0 }
    tl.to(drawObj, {
      progress: 1,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate() { drawDiamond(drawObj.progress) },
    })

  // Phase 2: Site name fades in
  if (nameRef.value) {
    tl.to(nameRef.value, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, '-=0.1')
  }

  // Phase 3: Hold
  tl.to({}, { duration: HOLD_TIME })

  // Phase 4: Shatter — break diamond into particles
  tl.call(() => {
    nameRef.value!.style.opacity = '0'
    // Generate particle fragments from the diamond perimeter
    const perimeterPoints = 40
    for (let i = 0; i < perimeterPoints; i++) {
      const t = i / perimeterPoints
      const sideIdx = Math.floor(t * 4) % 4
      const localT = (t * 4) % 1
      const s = vertices[sideIdx]!
      const e = vertices[(sideIdx + 1) % TOTAL_EDGES]!
      const px = s.x + (e.x - s.x) * localT
      const py = s.y + (e.y - s.y) * localT
      const angle = Math.atan2(py - cy, px - cx)
      const speed = 80 + Math.random() * 160
      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        alpha: 0.8 + Math.random() * 0.2,
      })
    }

    // Hide and remove diamond
    diamondGfx.destroy()

    // Create particle graphics
    const particleGfx = new Graphics()
    app!.stage.addChild(particleGfx)
    drawParticles(particleGfx, particles)

    // Animate particles outward
    const obj = { t: 0 }
    gsap.to(obj, {
      t: 1,
      duration: SHATTER_DURATION,
      ease: 'power3.out',
      onUpdate() {
        for (const p of particles) {
          p.x += p.vx * 0.016
          p.y += p.vy * 0.016
          p.alpha *= 0.985
        }
        drawParticles(particleGfx, particles)
        app!.render()
      },
      onComplete() {
        particleGfx.destroy()
      },
    })
  })
  }) // end gsap.context
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
  if (app) {
    app.destroy(true, { children: true })
    app = null
  }
})
</script>

<template>
  <div ref="containerRef" class="loading-screen">
    <div ref="nameRef" class="loading-name">{{ siteConfig.name }}</div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: var(--color-bg);
  transition: background-color 0.6s ease;
}

.loading-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.04em;
  color: var(--color-primary);
  opacity: 0;
  transition: color 0.6s ease;
}
</style>

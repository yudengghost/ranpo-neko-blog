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

  // === Preload resources ===
  const preloads: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    preloadImage('/images/hero-bg.jpg'),
  ]

  // Preload all article cover images found by glob
  try {
    const { useArticles } = await import('@/composables/useArticles')
    const articles = useArticles().getAll()
    for (const a of articles) {
      if (a.coverImage) preloads.push(preloadImage(a.coverImage))
    }
  } catch {}

  const resourcesReady = Promise.all(preloads)

  function preloadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = src
    })
  }

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
    if (diamondGfx.destroyed) return
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
  let particleGfx: Graphics | null = null

  function drawParticles(g: Graphics, pts: Particle[]) {
    if (g.destroyed) return
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
      // Phase 5: Dissolve — grid of cells randomly fades to reveal content
      const COLS = 24
      const ROWS = 16
      const cellW = app!.screen.width / COLS
      const cellH = app!.screen.height / ROWS
      const bgColor = hexToNumber(colors.value.bg)

      const dissolveGfx = new Graphics()
      const cells: { alpha: number; x: number; y: number }[] = []

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells.push({ alpha: 1, x: c * cellW, y: r * cellH })
        }
      }

      function drawDissolve(g: Graphics) {
        g.clear()
        for (const cell of cells) {
          if (cell.alpha < 0.01) continue
          g.rect(cell.x, cell.y, cellW + 1, cellH + 1)
          g.fill({ color: bgColor, alpha: cell.alpha })
        }
      }

      const dissolved = gsap.context(() => {
        drawDissolve(dissolveGfx)
        app!.stage.addChild(dissolveGfx)

        // Random order for natural dissolve
        const shuffled = cells.map((_, i) => i).sort(() => Math.random() - 0.5)
        const tl2 = gsap.timeline({
          onUpdate() { drawDissolve(dissolveGfx); if (app) app.render() },
          onComplete() {
            dissolveGfx.destroy()
            emit('done')
          },
        })

        for (const idx of shuffled) {
          const cell = cells[idx]!
          tl2.to(cell, { alpha: 0, duration: 0.3, ease: 'power2.in' }, Math.random() * 0.5)
        }
      })
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

  // Phase 3: Hold until resources ready (min HOLD_TIME, then wait)
  tl.add(async () => {
    const minHold = Date.now() + HOLD_TIME * 1000
    await resourcesReady
    const remaining = minHold - Date.now()
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
  })

  // Phase 4: Shatter — break diamond into particles
  tl.call(() => {
    nameRef.value!.style.opacity = '0'
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

    diamondGfx.destroy()

    particleGfx = new Graphics()
    app!.stage.addChild(particleGfx)
    drawParticles(particleGfx, particles)
  })

  // Particle animation on the timeline (not a standalone tween)
  const shatterObj = { val: 0 }
  tl.to(shatterObj, {
    val: 1,
    duration: SHATTER_DURATION,
    ease: 'power3.out',
    onUpdate() {
      for (const p of particles) {
        p.x += p.vx * 0.016
        p.y += p.vy * 0.016
        p.alpha *= 0.985
      }
      if (particleGfx) drawParticles(particleGfx, particles)
      if (app) app.render()
    },
    onComplete() {
      if (particleGfx) {
        particleGfx.destroy()
        particleGfx = null
      }
    },
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

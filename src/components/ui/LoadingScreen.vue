<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useVisualStyle } from '@/composables/useVisualStyle'
import { hexToNumber } from '@/utils/color'
import { siteConfig } from '@/config'

const emit = defineEmits<{ done: [] }>()

const { colors, currentStyle } = useVisualStyle()
const containerRef = ref<HTMLDivElement>()
const nameRef = ref<HTMLDivElement>()

let app: Application | null = null
let ctx: gsap.Context | null = null

const HOLD_TIME = 0.7

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  rot?: number
}

function drawGeometricLoader(cx: number, cy: number, color: number, tl: gsap.core.Timeline, resourcesReady: Promise<void>) {
  const DIAMOND_R = 80
  const LINE_WIDTH = 2
  const TOTAL_EDGES = 4
  const SHATTER_DURATION = 0.6

  const top = { x: cx, y: cy - DIAMOND_R }
  const right = { x: cx + DIAMOND_R, y: cy }
  const bottom = { x: cx, y: cy + DIAMOND_R }
  const left = { x: cx - DIAMOND_R, y: cy }
  const vertices = [top, right, bottom, left]

  const diamondGfx = new Graphics()
  app!.stage.addChild(diamondGfx)

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

  const drawObj = { progress: 0 }
  tl.to(drawObj, {
    progress: 1,
    duration: 1.0,
    ease: 'power3.inOut',
    onUpdate() { drawDiamond(drawObj.progress) },
  })

  if (nameRef.value) {
    tl.to(nameRef.value, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, '-=0.1')
  }

  tl.add(async () => {
    const minHold = Date.now() + HOLD_TIME * 1000
    await resourcesReady
    const remaining = minHold - Date.now()
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
  })

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
      if (particleGfx) { particleGfx.destroy(); particleGfx = null }
    },
  })
}

function drawBrutalistLoader(cx: number, cy: number, color: number, tl: gsap.core.Timeline, resourcesReady: Promise<void>) {
  const SIZE = 100
  const THICK = 6
  const STAMP_DURATION = 0.35

  const stampGfx = new Graphics()
  app!.stage.addChild(stampGfx)
  stampGfx.alpha = 0

  function drawStamp(scale: number) {
    if (stampGfx.destroyed) return
    stampGfx.clear()
    const s = SIZE * scale
    stampGfx.rect(-s / 2, -s / 2, s, s)
    stampGfx.stroke({ width: THICK, color, alpha: 1 })
    stampGfx.rect(-s / 2 + 12, -s / 2 + 12, s - 24, s - 24)
    stampGfx.stroke({ width: THICK * 0.6, color, alpha: 0.5 })
    stampGfx.moveTo(-s / 2, -s / 2)
    stampGfx.lineTo(s / 2, s / 2)
    stampGfx.stroke({ width: THICK * 0.8, color, alpha: 0.3 })
  }

  const scaleObj = { s: 0 }
  tl.fromTo(scaleObj, { s: 0 }, {
    s: 1,
    duration: STAMP_DURATION,
    ease: 'back.out(2.5)',
    onStart() { stampGfx.alpha = 1; stampGfx.position.set(cx, cy) },
    onUpdate() { drawStamp(scaleObj.s) },
  })

  if (nameRef.value) {
    tl.to(nameRef.value, {
      opacity: 1,
      duration: 0.4,
      ease: 'power4.out',
    }, '-=0.15')
  }

  tl.add(async () => {
    const minHold = Date.now() + HOLD_TIME * 1000
    await resourcesReady
    const remaining = minHold - Date.now()
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
  })

  tl.call(() => {
    nameRef.value!.style.opacity = '0'
  })

  const slamObj = { y: 0, rot: 0 }
  tl.to(slamObj, {
    y: 8,
    rot: 0.02,
    duration: 0.15,
    ease: 'power2.in',
    onUpdate() {
      stampGfx.position.set(cx, cy + slamObj.y)
      stampGfx.rotation = slamObj.rot
    },
  })

  const shards: Particle[] = []
  let shardGfx: Graphics | null = null
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const dist = 20 + Math.random() * 40
    shards.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * (120 + Math.random() * 200),
      vy: Math.sin(angle) * (120 + Math.random() * 200),
      size: 3 + Math.random() * 6,
      alpha: 1,
      rot: Math.random() * Math.PI,
    })
  }

  tl.call(() => {
    stampGfx.destroy()
    shardGfx = new Graphics()
    app!.stage.addChild(shardGfx)
  })

  const breakObj = { t: 0 }
  tl.to(breakObj, {
    t: 1,
    duration: 0.5,
    ease: 'power3.out',
    onUpdate() {
      if (!shardGfx) return
      shardGfx.clear()
      for (const p of shards) {
        p.x += p.vx * 0.016
        p.y += p.vy * 0.016
        p.vy += 400 * 0.016
        p.alpha *= 0.97
        p.rot = (p.rot || 0) + 0.1
        shardGfx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
        shardGfx.fill({ color, alpha: p.alpha })
      }
    },
    onComplete() {
      if (shardGfx) { shardGfx.destroy(); shardGfx = null }
    },
  })
}

function drawRetroLoader(cx: number, cy: number, color: number, tl: gsap.core.Timeline, resourcesReady: Promise<void>) {
  const R = 70
  const BOOT_DURATION = 0.9

  const reticleGfx = new Graphics()
  const scanGfx = new Graphics()
  app!.stage.addChild(reticleGfx)
  app!.stage.addChild(scanGfx)
  reticleGfx.position.set(cx, cy)

  function drawReticle(progress: number) {
    if (reticleGfx.destroyed) return
    reticleGfx.clear()
    if (progress <= 0) return

    const r = R * Math.min(progress * 1.3, 1)
    reticleGfx.circle(0, 0, r)
    reticleGfx.stroke({ width: 1, color, alpha: 0.8 })

    if (progress > 0.3) {
      const innerR = r * 0.5
      reticleGfx.circle(0, 0, innerR)
      reticleGfx.stroke({ width: 1, color, alpha: 0.4 })
    }

    if (progress > 0.5) {
      const arm = r + 12
      reticleGfx.moveTo(-arm, 0); reticleGfx.lineTo(-r - 3, 0)
      reticleGfx.moveTo(r + 3, 0); reticleGfx.lineTo(arm, 0)
      reticleGfx.moveTo(0, -arm); reticleGfx.lineTo(0, -r - 3)
      reticleGfx.moveTo(0, r + 3); reticleGfx.lineTo(0, arm)
      reticleGfx.stroke({ width: 2, color, alpha: 0.9 })
    }

    if (progress > 0.7) {
      reticleGfx.circle(0, 0, 3)
      reticleGfx.fill({ color, alpha: 1 })
    }
  }

  function drawScan(y: number) {
    if (scanGfx.destroyed) return
    scanGfx.clear()
    const w = app!.screen.width
    scanGfx.rect(0, y - 1, w, 2)
    scanGfx.fill({ color, alpha: 0.15 })
    scanGfx.rect(0, y - 40, w, 80)
    scanGfx.fill({ color, alpha: 0.03 })
  }

  const bootObj = { p: 0 }
  tl.to(bootObj, {
    p: 1,
    duration: BOOT_DURATION,
    ease: 'power2.out',
    onUpdate() { drawReticle(bootObj.p) },
  })

  const scanObj = { y: 0 }
  tl.fromTo(scanObj, { y: 0 }, {
    y: app!.screen.height,
    duration: 0.8,
    ease: 'none',
    onUpdate() { drawScan(scanObj.y) },
  }, 0)

  if (nameRef.value) {
    tl.to(nameRef.value, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.4')
  }

  tl.add(async () => {
    const minHold = Date.now() + HOLD_TIME * 1000
    await resourcesReady
    const remaining = minHold - Date.now()
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
  })

  tl.call(() => {
    nameRef.value!.style.opacity = '0'
  })

  const glitchObj = { x: 0, alpha: 1 }
  tl.to(glitchObj, {
    x: 20,
    duration: 0.08,
    ease: 'none',
    onUpdate() {
      reticleGfx.position.set(cx + glitchObj.x, cy)
    },
  })
  tl.to(glitchObj, {
    x: -15,
    duration: 0.06,
    ease: 'none',
    onUpdate() {
      reticleGfx.position.set(cx + glitchObj.x, cy)
    },
  })
  tl.to(glitchObj, {
    x: 0,
    alpha: 0,
    duration: 0.3,
    ease: 'power2.in',
    onUpdate() {
      reticleGfx.position.set(cx + glitchObj.x, cy)
      reticleGfx.alpha = glitchObj.alpha
      scanGfx.alpha = glitchObj.alpha
    },
  })
  tl.call(() => {
    reticleGfx.destroy()
    scanGfx.destroy()
  })
}

onMounted(async () => {
  if (!containerRef.value) return
  const style = currentStyle.value

  const preloads: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    preloadImage('/images/hero-bg.jpg'),
  ]

  try {
    const { useArticles } = await import('@/composables/useArticles')
    const articles = useArticles().getAll()
    for (const a of articles) {
      if (a.coverImage) preloads.push(preloadImage(a.coverImage))
    }
  } catch {}

  const resourcesReady = Promise.all(preloads).then(() => {})

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

  app.render()

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

    if (style === 'brutalist') {
      drawBrutalistLoader(cx, cy, color, tl, resourcesReady)
    } else if (style === 'retro-futurism') {
      drawRetroLoader(cx, cy, color, tl, resourcesReady)
    } else {
      drawGeometricLoader(cx, cy, color, tl, resourcesReady)
    }
  })
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
  <div ref="containerRef" class="loading-screen" :data-loading-style="currentStyle">
    <div ref="nameRef" class="loading-name">{{ siteConfig.name }}</div>
    <div class="scanlines" v-if="currentStyle === 'retro-futurism'"></div>
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
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: var(--heading-weight, 300);
  font-style: italic;
  letter-spacing: 0.04em;
  color: var(--color-primary);
  opacity: 0;
  transition: color 0.6s ease;
  margin-top: 100px;
}

[data-loading-style='brutalist'] .loading-name {
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-mono);
}

[data-loading-style='retro-futurism'] .loading-name {
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px var(--color-glow), 0 0 20px var(--color-glowSecondary);
}

.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
}
</style>

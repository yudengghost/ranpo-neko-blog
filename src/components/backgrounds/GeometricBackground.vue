<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics, Container } from 'pixi.js'
import { useVisualStyle } from '@/composables/useVisualStyle'
import { hexToNumber } from '@/utils/color'

const { colors } = useVisualStyle()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null
let destroyed = false
let tickerCb: (() => void) | null = null
let onMouseMove: ((e: MouseEvent) => void) | null = null
let onResize: (() => void) | null = null
let stopWatch: (() => void) | null = null

function getColors() {
  return {
    primary: hexToNumber(colors.value.primary),
    accent: hexToNumber(colors.value.accent),
  }
}

onMounted(async () => {
  if (!containerRef.value) return
  destroyed = false
  app = new Application()
  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    width: window.innerWidth,
    height: window.innerHeight,
  })
  if (destroyed) {
    app.destroy(true)
    app = null
    return
  }
  containerRef.value.appendChild(app.canvas)

  const gridG = new Graphics()
  const accentG = new Graphics()
  const ornamentG = new Graphics()
  const particlesLayer = new Container()
  app.stage.addChild(gridG, accentG, ornamentG, particlesLayer)

  function drawAll() {
    const { primary, accent } = getColors()
    const w = window.innerWidth
    const h = window.innerHeight

    gridG.clear()
    for (let x = 0; x <= w; x += 80) {
      gridG.moveTo(x, 0); gridG.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += 80) {
      gridG.moveTo(0, y); gridG.lineTo(w, y)
    }
    gridG.stroke({ width: 0.5, color: primary, alpha: 0.06 })

    accentG.clear()
    const padding = 120
    accentG.moveTo(padding, 0); accentG.lineTo(w, h - padding)
    accentG.moveTo(w - padding, 0); accentG.lineTo(0, h - padding)
    const gr = 1.618
    accentG.moveTo(0, h / gr); accentG.lineTo(w, h / gr)
    accentG.moveTo(0, h - h / gr); accentG.lineTo(w, h - h / gr)
    accentG.moveTo(w / gr, 0); accentG.lineTo(w / gr, h)
    accentG.moveTo(w - w / gr, 0); accentG.lineTo(w - w / gr, h)
    accentG.stroke({ width: 0.3, color: accent, alpha: 0.08 })
    accentG.position.set(w / 2, h / 2)
    accentG.pivot.set(w / 2, h / 2)

    ornamentG.clear()
    const cx = w / 2
    const cy = h / 2
    const pad = 120
    const sizes = [Math.min(w, h) * 0.25, Math.min(w, h) * 0.35, Math.min(w, h) * 0.5]
    for (const r of sizes) {
      ornamentG.circle(cx, cy, r)
    }
    const cornerR = 60
    ornamentG.circle(pad, pad, cornerR)
    ornamentG.circle(w - pad, pad, cornerR)
    ornamentG.circle(pad, h - pad, cornerR)
    ornamentG.circle(w - pad, h - pad, cornerR)
    ornamentG.stroke({ width: 0.3, color: primary, alpha: 0.05 })
  }

  drawAll()

  interface Particle {
    vx: number; vy: number
  }
  const particles: { p: Particle; gfx: Graphics }[] = []
  const PARTICLE_COUNT = 24
  const { primary: initP, accent: initA } = getColors()
  const { innerWidth: iw, innerHeight: ih } = window

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const gfx = new Graphics()
    const types = ['circle', 'diamond', 'triangle'] as const
    const type = types[i % types.length]!
    const size = Math.random() * 4 + 2
    const color = type === 'circle' ? initP : initA

    if (type === 'circle') {
      gfx.circle(0, 0, size)
      gfx.fill({ color, alpha: 1 })
    } else if (type === 'diamond') {
      gfx.moveTo(0, -size)
      gfx.lineTo(size, 0)
      gfx.lineTo(0, size)
      gfx.lineTo(-size, 0)
      gfx.closePath()
      gfx.stroke({ width: 0.5, color, alpha: 1 })
    } else {
      const r = size * 1.2
      gfx.moveTo(0, -r)
      gfx.lineTo(r * 0.866, r * 0.5)
      gfx.lineTo(-r * 0.866, r * 0.5)
      gfx.closePath()
      gfx.stroke({ width: 0.5, color, alpha: 1 })
    }

    gfx.alpha = 0.12
    gfx.position.set(Math.random() * iw, Math.random() * ih)
    particlesLayer.addChild(gfx)
    particles.push({
      p: {
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      },
      gfx,
    })
  }

  let mouseX = iw / 2
  let mouseY = ih / 2
  let targetMouseX = mouseX
  let targetMouseY = mouseY

  onMouseMove = (e: MouseEvent) => {
    targetMouseX = e.clientX
    targetMouseY = e.clientY
  }
  window.addEventListener('mousemove', onMouseMove)

  onResize = () => {
    if (!app) return
    app.renderer.resize(window.innerWidth, window.innerHeight)
    drawAll()
  }
  window.addEventListener('resize', onResize)

  tickerCb = () => {
    if (destroyed || !app) return
    mouseX += (targetMouseX - mouseX) * 0.03
    mouseY += (targetMouseY - mouseY) * 0.03

    accentG.rotation += 0.00008

    for (const { p, gfx } of particles) {
      gfx.position.x += p.vx
      gfx.position.y += p.vy
      gfx.rotation += 0.002
      if (gfx.position.x < -20) gfx.position.x = window.innerWidth + 20
      if (gfx.position.x > window.innerWidth + 20) gfx.position.x = -20
      if (gfx.position.y < -20) gfx.position.y = window.innerHeight + 20
      if (gfx.position.y > window.innerHeight + 20) gfx.position.y = -20

      const dx = mouseX - gfx.position.x
      const dy = mouseY - gfx.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180) {
        const force = (1 - dist / 180) * 0.3
        gfx.position.x -= dx * force * 0.01
        gfx.position.y -= dy * force * 0.01
        p.vx += dx * force * 0.0005
        p.vy += dy * force * 0.0005
        gfx.alpha = 0.25
      } else {
        gfx.alpha = 0.12
      }
      p.vx *= 0.999
      p.vy *= 0.999
    }
  }
  app.ticker.add(tickerCb)

  stopWatch = watch(() => colors.value, () => { drawAll() }, { deep: true })
})

onUnmounted(() => {
  destroyed = true
  if (onMouseMove) window.removeEventListener('mousemove', onMouseMove)
  if (onResize) window.removeEventListener('resize', onResize)
  if (stopWatch) stopWatch()
  if (app) {
    if (tickerCb) app.ticker.remove(tickerCb)
    try { app.destroy(true) } catch {}
    app = null
  }
  tickerCb = null
  onMouseMove = null
  onResize = null
  stopWatch = null
})
</script>

<template>
  <div ref="containerRef" class="bg-canvas"></div>
</template>

<style scoped>
.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
</style>

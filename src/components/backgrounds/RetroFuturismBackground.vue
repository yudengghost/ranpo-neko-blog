<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics, Container } from 'pixi.js'
import { useVisualStyle } from '@/composables/useVisualStyle'
import { hexToNumber } from '@/utils/color'

const { colors } = useVisualStyle()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null
let destroyed = false
let tickerCb: (() => void) | null = null
let onResize: (() => void) | null = null

onMounted(async () => {
  if (!containerRef.value) return
  destroyed = false
  app = new Application()
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  if (destroyed) {
    app.destroy(true, { children: true })
    app = null
    return
  }
  containerRef.value.appendChild(app.canvas)

  const sunG = new Graphics()
  const gridG = new Graphics()
  const shapesLayer = new Container()
  const starsLayer = new Container()
  const scanlinesG = new Graphics()
  app.stage.addChild(sunG, gridG, shapesLayer, starsLayer, scanlinesG)

  const shapeGfxs: Graphics[] = []
  for (let i = 0; i < 6; i++) {
    const g = new Graphics()
    shapesLayer.addChild(g)
    shapeGfxs.push(g)
  }

  function drawSun(w: number, h: number, primary: number, _accent: number) {
    sunG.clear()
    const cx = w / 2
    const cy = h * 0.55
    const r = Math.min(w, h) * 0.18
    const segCount = 8
    const segH = (r * 2) / (segCount * 2 + 1)

    for (let i = 0; i < segCount; i++) {
      const y = cy - r + segH + i * segH * 2
      sunG.rect(cx - r, y, r * 2, segH)
      sunG.fill({ color: 0x0D0221, alpha: 1 })
    }

    sunG.circle(cx, cy, r)
    sunG.fill({ color: primary, alpha: 0.9 })
    for (let i = 0; i < segCount; i++) {
      const y = cy - r + segH + i * segH * 2
      sunG.rect(cx - r - 2, y, r * 2 + 4, segH + 1)
      sunG.fill({ color: 0x0D0221, alpha: 1 })
    }
  }

  function drawGrid(w: number, h: number, primary: number, accent: number) {
    gridG.clear()
    const vx = w / 2
    const vy = h * 0.55
    const horizon = h * 0.55

    const lineCount = 20
    for (let i = 1; i <= lineCount; i++) {
      const t = i / lineCount
      const y = horizon + Math.pow(t, 1.8) * (h - horizon)
      const alpha = 0.1 + t * 0.5
      gridG.moveTo(0, y)
      gridG.lineTo(w, y)
      gridG.stroke({ width: 1 + t * 0.8, color: i % 2 === 0 ? primary : accent, alpha })
    }

    const vanishLines = 30
    for (let i = -vanishLines; i <= vanishLines; i++) {
      const spread = Math.sign(i) * Math.pow(Math.abs(i) / vanishLines, 1.5) * w * 0.7
      const bottomX = vx + spread
      gridG.moveTo(vx, vy)
      gridG.lineTo(bottomX, h)
      gridG.stroke({ width: 1, color: i % 3 === 0 ? primary : accent, alpha: 0.25 })
    }
  }

  function drawShapes(w: number, h: number, primary: number, accent: number) {
    const t = Date.now() * 0.0005
    const shapeCount = 6
    for (let i = 0; i < shapeCount; i++) {
      const g = shapeGfxs[i]!
      const cx = (w / shapeCount) * i + w / (shapeCount * 2) + Math.sin(t + i) * 30
      const cy = h * 0.25 + Math.cos(t * 0.7 + i * 1.3) * 40
      const size = 15 + (i % 3) * 8
      const rot = t * (0.3 + i * 0.1)
      const col = i % 2 === 0 ? primary : accent

      g.position.set(cx, cy)
      g.rotation = rot
      g.clear()

      if (i % 3 === 0) {
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2
          const px = Math.cos(ang) * size
          const py = Math.sin(ang) * size
          if (a === 0) g.moveTo(px, py); else g.lineTo(px, py)
        }
        g.closePath()
        g.stroke({ width: 1.5, color: col, alpha: 0.5 })
      } else if (i % 3 === 1) {
        g.circle(0, 0, size)
        g.stroke({ width: 1.5, color: col, alpha: 0.4 })
        g.circle(0, 0, size * 0.5)
        g.stroke({ width: 1, color: col, alpha: 0.3 })
      } else {
        for (let a = 0; a < 3; a++) {
          const ang = (a / 3) * Math.PI * 2 - Math.PI / 2
          const px = Math.cos(ang) * size
          const py = Math.sin(ang) * size
          if (a === 0) g.moveTo(px, py); else g.lineTo(px, py)
        }
        g.closePath()
        g.stroke({ width: 1.5, color: col, alpha: 0.45 })
      }
    }
  }

  interface Star { size: number; alpha: number; twinkleSpeed: number; phase: number; gfx: Graphics }
  const stars: Star[] = []
  for (let i = 0; i < 80; i++) {
    const gfx = new Graphics()
    gfx.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.5)
    starsLayer.addChild(gfx)
    starGfxs.push(gfx)
    stars.push({
      size: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.02 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
      gfx,
    })
  }

  function drawScanlines(w: number, h: number) {
    scanlinesG.clear()
    for (let y = 0; y < h; y += 3) {
      scanlinesG.rect(0, y, w, 1)
      scanlinesG.fill({ color: 0x000000, alpha: 0.04 })
    }
  }

  function drawAll() {
    const w = window.innerWidth
    const h = window.innerHeight
    const primary = hexToNumber(colors.value.primary)
    const accent = hexToNumber(colors.value.accent)
    drawSun(w, h, primary, accent)
    drawGrid(w, h, primary, accent)
    drawShapes(w, h, primary, accent)
    drawScanlines(w, h)
  }

  drawAll()

  tickerCb = () => {
    if (destroyed || !app) return
    const w = window.innerWidth
    const h = window.innerHeight
    const primary = hexToNumber(colors.value.primary)
    const accent = hexToNumber(colors.value.accent)
    drawGrid(w, h, primary, accent)
    drawShapes(w, h, primary, accent)
    for (const s of stars) {
      const g = s.gfx
      g.clear()
      const t = Date.now() * s.twinkleSpeed * 0.01 + s.phase
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t))
      g.rect(-s.size / 2, -s.size / 2, s.size, s.size)
      g.fill({ color: 0xFFFFFF, alpha: a })
    }
  }
  app.ticker.add(tickerCb)

  onResize = () => drawAll()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  destroyed = true
  if (onResize) window.removeEventListener('resize', onResize)
  if (app) {
    if (tickerCb) app.ticker.remove(tickerCb)
    app.destroy(true, { children: true })
    app = null
  }
  tickerCb = null
  onResize = null
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

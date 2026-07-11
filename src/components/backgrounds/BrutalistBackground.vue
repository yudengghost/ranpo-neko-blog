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
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  if (destroyed) {
    app.destroy(true, { children: true })
    app = null
    return
  }
  containerRef.value.appendChild(app.canvas)

  const gridG = new Graphics()
  const blocksG = new Graphics()
  const stripesG = new Graphics()
  const particlesLayer = new Container()
  app.stage.addChild(gridG, blocksG, stripesG, particlesLayer)

  function drawAll() {
    const w = window.innerWidth
    const h = window.innerHeight
    const primary = hexToNumber(colors.value.primary)
    const accent = hexToNumber(colors.value.accent)
    const border = hexToNumber(colors.value.border)

    gridG.clear()
    for (let x = 0; x <= w; x += 40) {
      gridG.moveTo(x, 0); gridG.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += 40) {
      gridG.moveTo(0, y); gridG.lineTo(w, y)
    }
    gridG.stroke({ width: 1, color: border, alpha: 0.06 })

    blocksG.clear()
    const blockCount = 12
    for (let i = 0; i < blockCount; i++) {
      const bx = (i * 173) % w
      const by = (i * 257) % h
      const bw = 40 + ((i * 37) % 120)
      const bh = 40 + ((i * 53) % 120)
      const c = i % 3 === 0 ? primary : i % 3 === 1 ? accent : border
      blocksG.rect(bx, by, bw, bh)
      blocksG.fill({ color: c, alpha: 0.06 })
      blocksG.stroke({ width: 2, color: c, alpha: 0.1 })
    }

    stripesG.clear()
    stripesG.moveTo(0, 0); stripesG.lineTo(w * 0.3, 0)
    stripesG.lineTo(0, h * 0.3); stripesG.closePath()
    stripesG.fill({ color: primary, alpha: 0.04 })
    stripesG.moveTo(w, h); stripesG.lineTo(w * 0.7, h)
    stripesG.lineTo(w, h * 0.7); stripesG.closePath()
    stripesG.fill({ color: accent, alpha: 0.04 })
  }

  drawAll()

  interface Particle {
    size: number; color: number; gfx: Graphics
    timer: number
  }
  const particles: Particle[] = []
  const PCOUNT = 40
  for (let i = 0; i < PCOUNT; i++) {
    const gfx = new Graphics()
    gfx.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
    const palette = [hexToNumber(colors.value.primary), hexToNumber(colors.value.accent), hexToNumber(colors.value.border)]
    particles.push({
      size: 3 + Math.random() * 6,
      color: palette[i % palette.length]!,
      gfx,
      timer: Math.random() * 200,
    })
    particlesLayer.addChild(gfx)
  }

  let frame = 0
  tickerCb = () => {
    if (destroyed || !app) return
    frame++
    for (const p of particles) {
      p.timer--
      if (p.timer <= 0) {
        p.gfx.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
        p.timer = 100 + Math.random() * 300
      }
      const g = p.gfx
      g.clear()
      g.rect(-p.size / 2, -p.size / 2, p.size, p.size)
      g.fill({ color: p.color, alpha: 0.5 + Math.sin(frame * 0.05 + p.gfx.position.x) * 0.3 })
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

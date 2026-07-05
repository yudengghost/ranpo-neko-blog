<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { hexToNumber } from '@/utils/color'

const emit = defineEmits<{ done: [] }>()
const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()

let app: Application | null = null
let ctx: gsap.Context | null = null

const DIAMOND_SIZE = 70
const COLORS = () => ({
  primary: hexToNumber(colors.value.primary),
  text: hexToNumber(colors.value.text),
})

onMounted(async () => {
  if (!containerRef.value) return

  ctx = gsap.context(() => {})

  app = new Application()
  await app.init({
    canvas: document.createElement('canvas'),
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  containerRef.value.appendChild(app.canvas)

  const { innerWidth: W, innerHeight: H } = window
  const cx = W / 2
  const cy = H / 2
  const c = COLORS()
  const timeline = gsap.timeline()

  // ── Phase A: Diamond construction ──────────────────────────────────
  const diamond = new Graphics()
  app.stage.addChild(diamond)

  // 4 sides of the diamond
  const top = { x: cx, y: cy - DIAMOND_SIZE }
  const right = { x: cx + DIAMOND_SIZE, y: cy }
  const bottom = { x: cx, y: cy + DIAMOND_SIZE }
  const left = { x: cx - DIAMOND_SIZE, y: cy }

  const sides = [
    { from: top, to: right },
    { from: right, to: bottom },
    { from: bottom, to: left },
    { from: left, to: top },
  ]

  const sideProxies = sides.map(() => ({ t: 0 }))

  function drawDiamond() {
    diamond.clear()
    for (let i = 0; i < sides.length; i++) {
      const { from, to } = sides[i]!
      const t = sideProxies[i]!.t
      if (t < 0.001) continue
      const ex = from.x + (to.x - from.x) * t
      const ey = from.y + (to.y - from.y) * t
      diamond.moveTo(from.x, from.y)
      diamond.lineTo(ex, ey)
    }
    diamond.stroke({ width: 1.5, color: c.primary, alpha: 0.8 })
  }

  // Site name text
  const textStyle = new TextStyle({
    fontFamily: 'Playfair Display, serif',
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '300',
    fill: c.primary,
  })
  const siteText = new Text({ text: 'RanpoNeko', style: textStyle })
  siteText.anchor.set(0.5)
  siteText.position.set(cx, cy)
  siteText.alpha = 0
  app.stage.addChild(siteText)

  // Phase A: Draw diamond sides in sequence
  for (let i = 0; i < 4; i++) {
    timeline.to(sideProxies[i]!, {
      t: 1,
      duration: 0.35,
      ease: 'power2.inOut',
      onUpdate: drawDiamond,
    }, i === 0 ? '=0' : '-=0.1')
  }

  // Fade in site name
  timeline.to(siteText, { alpha: 0.7, duration: 0.5, ease: 'power2.in' }, '-=0.2')
  timeline.to(siteText, { alpha: 1, duration: 0.3 }, '+=0.4')

  // ── Phase A→C transition: Diamond shatters ─────────────────────────
  const particles: Graphics[] = []
  for (let i = 0; i < 16; i++) {
    const p = new Graphics()
    const size = 3 + Math.random() * 4
    const shape = Math.random()
    if (shape < 0.33) {
      p.circle(0, 0, size / 2)
    } else if (shape < 0.66) {
      p.moveTo(-size / 2, -size / 2)
      p.lineTo(size / 2, 0)
      p.lineTo(-size / 2, size / 2)
      p.closePath()
    } else {
      p.moveTo(0, -size / 2)
      p.lineTo(size / 2, size / 2)
      p.lineTo(-size / 2, size / 2)
      p.closePath()
    }
    p.fill({ color: c.primary, alpha: 0.6 })
    p.position.set(cx, cy)
    p.alpha = 0
    app.stage.addChild(p)
    particles.push(p)
  }

  // Shatter particles outward
  for (const p of particles) {
    const angle = Math.random() * Math.PI * 2
    const dist = 60 + Math.random() * 120
    timeline.to(p, {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      alpha: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.5')
  }

  // Diamond and text fade out
  timeline.to([diamond, siteText], { alpha: 0, duration: 0.3 }, '-=0.5')

  // ── Phase C: Curved descent lines ──────────────────────────────────
  const LINE_COUNT = 8
  const descentLines: { gfx: Graphics; x: number; y: number; curve: number }[] = []

  for (let i = 0; i < LINE_COUNT; i++) {
    const gfx = new Graphics()
    gfx.alpha = 0
    app.stage.addChild(gfx)

    const x = W * (0.1 + (i / (LINE_COUNT - 1)) * 0.8)
    const curve = (Math.random() - 0.5) * 80 // lateral curve amount
    descentLines.push({ gfx, x, y: -20, curve })
  }

  // Animate lines descending with cubic-bezier-like curved paths
  const lineProxies = descentLines.map(() => ({ t: 0 }))
  const LINE_Y_START = -30
  const LINE_Y_END = H + 30

  function drawCurvedLines() {
    for (let i = 0; i < descentLines.length; i++) {
      const { gfx, x, curve } = descentLines[i]!
      const t = lineProxies[i]!.t
      if (t < 0.001) { gfx.clear(); continue }

      // Parametric curved path: x sways left/right as y descends
      const y = LINE_Y_START + (LINE_Y_END - LINE_Y_START) * t
      const cp = curve * Math.sin(t * Math.PI * 2.5) // multi-sway curve
      gfx.clear()
      // Draw the visible portion as a trailing line
      const trailLen = 80
      const steps = 10
      for (let s = 0; s < steps; s++) {
        const st = Math.max(0, t - (s / steps) * 0.15)
        const sy = LINE_Y_START + (LINE_Y_END - LINE_Y_START) * st
        const sx = x + curve * Math.sin(st * Math.PI * 2.5)
        if (s === 0) gfx.moveTo(sx, sy)
        else gfx.lineTo(sx, sy)
      }
      gfx.stroke({ width: 1, color: COLORS().primary, alpha: 0.5 })
    }
  }

  for (let i = 0; i < LINE_COUNT; i++) {
    const delay = 0.08
    timeline.fromTo(descentLines[i]!.gfx, { alpha: 0 }, { alpha: 1, duration: 0.15 }, `-=${delay * (i + 1)}`)
    timeline.to(lineProxies[i]!, {
      t: 1,
      duration: 0.7,
      ease: 'power3.in',
      onUpdate: drawCurvedLines,
    }, `-=${0.05}`)
  }

  // Lines morph into page structure (briefly form a grid then dissolve)
  timeline.to(descentLines.map(l => l.gfx), {
    alpha: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: 'power2.in',
  }, '+=0.2')

  // ── Done ───────────────────────────────────────────────────────────
  timeline.call(() => {
    emit('done')
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
  <div ref="containerRef" class="loading-screen"></div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: var(--color-bg);
  transition: background-color 0.6s ease;
}
</style>

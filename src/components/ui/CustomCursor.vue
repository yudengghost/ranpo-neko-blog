<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'

const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null
let cursorGfx: Graphics | null = null
let cursorX = -100
let cursorY = -100

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

function drawCursor(alpha = 1) {
  if (!cursorGfx) return
  const color = hexToNumber(colors.value.primary)
  cursorGfx.clear()
  // Outer ring
  cursorGfx.circle(0, 0, 11)
  cursorGfx.stroke({ width: 1.5, color, alpha: alpha * 0.7 })
  // Inner ring
  cursorGfx.circle(0, 0, 4.5)
  cursorGfx.stroke({ width: 1, color, alpha: alpha * 0.4 })
}

function playClickAnim(x: number, y: number) {
  if (!app) return
  const color = hexToNumber(colors.value.primary)
  const radius = 22
  const startAngle = -Math.PI / 2 // 12 o'clock
  const ring = new Graphics()
  ring.position.set(x, y)
  app.stage.addChild(ring)

  // Small starting dot at 12 o'clock
  const obj = { sweep: 0 }

  function redraw() {
    ring.clear()
    if (obj.sweep < 0.005) return
    // CCW from 12 o'clock: angle decreases, arc from startAngle down
    const endAngle = startAngle - Math.PI * 2 * obj.sweep
    ring.arc(0, 0, radius, startAngle, endAngle, true)
    ring.stroke({ width: 1.5, color, alpha: 0.75 })
  }

  // Phase 1: line grows CCW around the circle (0 → 1)
  const tl = gsap.timeline()
  tl.to(obj, {
    sweep: 1,
    duration: 0.55,
    ease: 'power2.inOut',
    onUpdate: redraw,
  })
  // Phase 2: line reverses and shrinks back (1 → 0)
  tl.to(obj, {
    sweep: 0,
    duration: 0.35,
    ease: 'power3.in',
    onUpdate: redraw,
    onComplete() {
      ring.destroy()
    },
  })
}

function onMouseMove(e: MouseEvent) {
  cursorX = e.clientX
  cursorY = e.clientY
  if (cursorGfx) {
    cursorGfx.position.set(cursorX, cursorY)
  }
}

function onMouseDown(e: MouseEvent) {
  playClickAnim(e.clientX, e.clientY)
  if (cursorGfx) {
    gsap.to(cursorGfx, { alpha: 0.5, duration: 0.15, yoyo: true, repeat: 1 })
  }
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
  })

  containerRef.value.appendChild(app.canvas)

  cursorGfx = new Graphics()
  cursorGfx.alpha = 0
  app.stage.addChild(cursorGfx)
  drawCursor()

  // Fade cursor in on first mouse move
  const fadeIn = () => {
    if (cursorGfx) {
      gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
      drawCursor()
    }
    window.removeEventListener('mousemove', fadeIn)
  }
  window.addEventListener('mousemove', fadeIn, { once: true })

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mouseleave', () => { if (cursorGfx) gsap.to(cursorGfx, { alpha: 0, duration: 0.3 }) })
  document.addEventListener('mouseenter', () => {
    if (cursorGfx) {
      cursorGfx.position.set(cursorX, cursorY)
      gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
    }
  })
})

watch(() => colors.value.primary, () => { drawCursor() })

onUnmounted(() => {
  if (app) {
    app.destroy(true, { children: true })
    app = null
  }
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
})
</script>

<template>
  <div ref="containerRef" class="custom-cursor"></div>
</template>

<style scoped>
.custom-cursor {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>

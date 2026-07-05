<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics, Container } from 'pixi.js'
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
  const lineCount = 6
  const maxRadius = 36

  // Container for the burst lines
  const burst = new Container()
  burst.position.set(x, y)
  const ring = new Graphics()

  // Draw arcs that will grow into a full circle
  for (let i = 0; i < lineCount; i++) {
    const baseAngle = (i / lineCount) * Math.PI * 2
    const r1 = 6
    const r2 = 18
    const x1 = Math.cos(baseAngle) * r1
    const y1 = Math.sin(baseAngle) * r1
    const x2 = Math.cos(baseAngle) * r2
    const y2 = Math.sin(baseAngle) * r2
    ring.moveTo(x1, y1)
    ring.lineTo(x2, y2)
  }
  ring.stroke({ width: 1.2, color, alpha: 0.7 })
  burst.addChild(ring)

  app.stage.addChild(burst)

  // Animate: lines grow out, rotate, then shrink back
  gsap.to(burst.scale, {
    x: 2.2,
    y: 2.2,
    duration: 0.4,
    ease: 'power2.out',
  })

  gsap.to(burst, {
    rotation: Math.PI / 3,
    duration: 0.4,
    ease: 'power2.out',
  })

  gsap.to(ring, {
    alpha: 0,
    duration: 0.55,
    delay: 0.15,
    ease: 'power2.in',
    onComplete() {
      burst.destroy({ children: true })
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

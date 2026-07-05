<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { hexToNumber } from '@/utils/color'

const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
const OUTER_R = 11
const INNER_R = 4.5
const CLICK_RADIUS = 22
const TWO_PI = Math.PI * 2
const START_ANGLE = -Math.PI / 2

type CursorMode = 'default' | 'text' | 'pointer' | 'select'

let app: Application | null = null
let cursorGfx: Graphics | null = null
let ctx: gsap.Context | null = null
let cursorX = -100
let cursorY = -100
let currentMode: CursorMode = 'default'

const ELEM_TEXT = new Set(['INPUT', 'TEXTAREA'])
const ELEM_CLICKABLE = new Set(['A', 'BUTTON'])
const ELEM_SELECT = new Set(['SELECT'])

function detectMode(x: number, y: number): CursorMode {
  const el = document.elementFromPoint(x, y)
  if (!el) return 'default'
  const tag = el.tagName
  if (ELEM_TEXT.has(tag) || el.getAttribute('contenteditable') === 'true') return 'text'
  if (ELEM_SELECT.has(tag)) return 'select'
  if (ELEM_CLICKABLE.has(tag) || el.closest('a, button')) return 'pointer'
  return 'default'
}

function drawCursor() {
  if (!cursorGfx) return
  const color = hexToNumber(colors.value.primary)
  cursorGfx.clear()

  // Outer ring — always present
  cursorGfx.circle(0, 0, OUTER_R)
  cursorGfx.stroke({ width: 1.5, color, alpha: currentMode === 'text' ? 0.4 : 0.7 })

  // Inner element varies by context
  switch (currentMode) {
    case 'text': {
      // Thin vertical I-beam line
      cursorGfx.moveTo(0, -9)
      cursorGfx.lineTo(0, 9)
      cursorGfx.stroke({ width: 1.5, color, alpha: 0.6 })
      break
    }
    case 'pointer': {
      // Expanded inner ring
      cursorGfx.circle(0, 0, 6.5)
      cursorGfx.stroke({ width: 1, color, alpha: 0.55 })
      break
    }
    case 'select': {
      // Downward V chevron
      cursorGfx.moveTo(-3.5, -1.5)
      cursorGfx.lineTo(0, 3)
      cursorGfx.lineTo(3.5, -1.5)
      cursorGfx.stroke({ width: 1.2, color, alpha: 0.55 })
      break
    }
    default: {
      // Default inner ring
      cursorGfx.circle(0, 0, INNER_R)
      cursorGfx.stroke({ width: 1, color, alpha: 0.4 })
    }
  }
}

// Shared arc drawing for click animation phases
function drawArcRing(ring: Graphics, sweep: number, phase: 1 | 2) {
  ring.clear()
  if (sweep < 0.005) return
  const color = hexToNumber(colors.value.primary)
  let arcStart: number
  let arcEnd: number
  if (phase === 1) {
    arcStart = START_ANGLE
    arcEnd = START_ANGLE - TWO_PI * sweep
  } else {
    arcStart = START_ANGLE - TWO_PI * (1 - sweep)
    arcEnd = START_ANGLE - TWO_PI
  }
  ring.arc(0, 0, CLICK_RADIUS, arcStart, arcEnd, true)
  ring.stroke({ width: 1.5, color, alpha: 0.75 })
  if (app) app.render()
}

function onMouseMove(e: MouseEvent) {
  cursorX = e.clientX
  cursorY = e.clientY
  if (cursorGfx) {
    cursorGfx.position.set(cursorX, cursorY)
    const mode = detectMode(cursorX, cursorY)
    if (mode !== currentMode) {
      currentMode = mode
      drawCursor()
    }
    if (app) app.render()
  }
}

function onMouseDown(e: MouseEvent) {
  if (!app) return
  const ring = new Graphics()
  ring.position.set(e.clientX, e.clientY)
  app.stage.addChild(ring)

  const obj = { sweep: 0 }
  ctx?.add(() => {
    const tl = gsap.timeline()
    tl.to(obj, { sweep: 1, duration: 0.55, ease: 'power2.inOut', onUpdate() { drawArcRing(ring, obj.sweep, 1) } })
    tl.to(obj, { sweep: 0, duration: 0.35, ease: 'power2.in',  onUpdate() { drawArcRing(ring, obj.sweep, 2) }, onComplete() { ring.destroy() } })
  })

  if (cursorGfx) {
    gsap.to(cursorGfx, { alpha: 0.5, duration: 0.15, yoyo: true, repeat: 1 })
  }
}

function onMouseLeave() {
  if (cursorGfx) gsap.to(cursorGfx, { alpha: 0, duration: 0.3 })
}

function onMouseEnter() {
  if (cursorGfx) {
    cursorGfx.position.set(cursorX, cursorY)
    gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
  }
}

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
    autoStart: false,
  })

  containerRef.value.appendChild(app.canvas)

  cursorGfx = new Graphics()
  cursorGfx.alpha = 0
  app.stage.addChild(cursorGfx)
  drawCursor()
  app.render()

  const fadeIn = () => {
    if (cursorGfx) {
      if (app) app.render()
      gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
      drawCursor()
    }
  }
  window.addEventListener('mousemove', fadeIn, { once: true })

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mouseleave', onMouseLeave)
  document.addEventListener('mouseenter', onMouseEnter)
})

watch(() => colors.value.primary, () => { drawCursor(); if (app) app.render() })

onUnmounted(() => {
  ctx?.revert()
  ctx = null
  if (app) {
    app.destroy(true, { children: true })
    app = null
  }
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('mouseleave', onMouseLeave)
  document.removeEventListener('mouseenter', onMouseEnter)
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

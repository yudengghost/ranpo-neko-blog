<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useVisualStyle } from '@/composables/useVisualStyle'
import { hexToNumber } from '@/utils/color'
import type { VisualStyleId } from '@/types'

const { colors, currentStyle } = useVisualStyle()
const containerRef = ref<HTMLDivElement>()
const TWO_PI = Math.PI * 2
const START_ANGLE = -Math.PI / 2

type CursorMode = 'default' | 'text' | 'pointer' | 'select'

let app: Application | null = null
let cursorGfx: Graphics | null = null
let glowGfx: Graphics | null = null
let ctx: gsap.Context | null = null
let cursorX = -100
let cursorY = -100
let currentMode: CursorMode = 'default'
let activeStyle: VisualStyleId = currentStyle.value

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

function drawGeometricCursor(color: number) {
  const OUTER_R = 11
  const INNER_R = 4.5
  cursorGfx!.circle(0, 0, OUTER_R)
  cursorGfx!.stroke({ width: 1.5, color, alpha: currentMode === 'text' ? 0.4 : 0.7 })

  switch (currentMode) {
    case 'text':
      cursorGfx!.moveTo(0, -9)
      cursorGfx!.lineTo(0, 9)
      cursorGfx!.stroke({ width: 1.5, color, alpha: 0.6 })
      break
    case 'pointer':
      cursorGfx!.circle(0, 0, 6.5)
      cursorGfx!.stroke({ width: 1, color, alpha: 0.55 })
      break
    case 'select':
      cursorGfx!.moveTo(-3.5, -1.5)
      cursorGfx!.lineTo(0, 3)
      cursorGfx!.lineTo(3.5, -1.5)
      cursorGfx!.stroke({ width: 1.2, color, alpha: 0.55 })
      break
    default:
      cursorGfx!.circle(0, 0, INNER_R)
      cursorGfx!.stroke({ width: 1, color, alpha: 0.4 })
  }
}

function drawBrutalistCursor(color: number) {
  const SIZE = 13
  const THICK = currentMode === 'text' ? 2 : 3

  if (currentMode === 'pointer') {
    const S = 18
    cursorGfx!.rect(-S / 2, -S / 2, S, S)
    cursorGfx!.stroke({ width: 3, color, alpha: 0.8 })
    cursorGfx!.rect(-S / 2 + 5, -S / 2 + 5, S - 10, S - 10)
    cursorGfx!.stroke({ width: 2, color, alpha: 0.4 })
    return
  }

  cursorGfx!.rect(-SIZE / 2, -SIZE / 2, SIZE, SIZE)
  cursorGfx!.stroke({ width: THICK, color, alpha: currentMode === 'text' ? 0.5 : 0.9 })

  switch (currentMode) {
    case 'text':
      cursorGfx!.moveTo(0, -6)
      cursorGfx!.lineTo(0, 6)
      cursorGfx!.stroke({ width: 2, color, alpha: 0.7 })
      break
    case 'select':
      cursorGfx!.moveTo(-4, -2)
      cursorGfx!.lineTo(0, 3)
      cursorGfx!.lineTo(4, -2)
      cursorGfx!.stroke({ width: 2.5, color, alpha: 0.7 })
      break
    default:
      cursorGfx!.rect(-2, -2, 4, 4)
      cursorGfx!.fill({ color, alpha: 0.6 })
  }
}

function drawRetroCursor(color: number) {
  const R = 14
  const ARM = 18

  if (glowGfx) {
    glowGfx.clear()
    glowGfx.circle(0, 0, R + 6)
    glowGfx.stroke({ width: 8, color, alpha: 0.12 })
  }

  cursorGfx!.circle(0, 0, R)
  cursorGfx!.stroke({ width: 1, color, alpha: currentMode === 'text' ? 0.3 : 0.5 })

  cursorGfx!.moveTo(-ARM, 0)
  cursorGfx!.lineTo(-R - 2, 0)
  cursorGfx!.moveTo(R + 2, 0)
  cursorGfx!.lineTo(ARM, 0)
  cursorGfx!.moveTo(0, -ARM)
  cursorGfx!.lineTo(0, -R - 2)
  cursorGfx!.moveTo(0, R + 2)
  cursorGfx!.lineTo(0, ARM)
  cursorGfx!.stroke({ width: 1.5, color, alpha: 0.8 })

  cursorGfx!.circle(0, 0, 2.5)
  cursorGfx!.fill({ color, alpha: 0.9 })

  switch (currentMode) {
    case 'pointer': {
      const pR = 8
      cursorGfx!.circle(0, 0, pR)
      cursorGfx!.stroke({ width: 1, color, alpha: 0.6 })
      break
    }
    case 'text':
      cursorGfx!.moveTo(0, -10)
      cursorGfx!.lineTo(0, 10)
      cursorGfx!.stroke({ width: 1.5, color, alpha: 0.5 })
      break
    case 'select':
      cursorGfx!.moveTo(-4, -2)
      cursorGfx!.lineTo(0, 3)
      cursorGfx!.lineTo(4, -2)
      cursorGfx!.stroke({ width: 1.2, color, alpha: 0.5 })
      break
  }
}

function drawCursor() {
  if (!cursorGfx) return
  const color = hexToNumber(colors.value.cursorColor)
  cursorGfx.clear()
  if (glowGfx) glowGfx.clear()

  switch (activeStyle) {
    case 'brutalist':
      drawBrutalistCursor(color)
      break
    case 'retro-futurism':
      drawRetroCursor(color)
      break
    default:
      drawGeometricCursor(color)
  }
}

function drawClickAnimation(ring: Graphics, sweep: number, phase: 1 | 2) {
  ring.clear()
  const color = hexToNumber(colors.value.cursorColor)
  const style = activeStyle

  if (style === 'brutalist') {
    const size = 20 + sweep * 28
    const alpha = phase === 1 ? 0.8 : 0.8 * (1 - sweep)
    const lw = phase === 1 ? 3 : 3 * (1 - sweep)
    ring.rect(-size / 2, -size / 2, size, size)
    ring.stroke({ width: lw, color, alpha })
    if (phase === 2 && sweep > 0.5) {
      ring.rect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8)
      ring.stroke({ width: lw * 0.6, color, alpha: alpha * 0.5 })
    }
  } else if (style === 'retro-futurism') {
    const radius = 16 + sweep * 20
    const alpha = phase === 1 ? 0.7 : 0.7 * (1 - sweep)
    ring.circle(0, 0, radius)
    ring.stroke({ width: 2, color, alpha })
    if (phase === 1) {
      const armLen = radius + 6
      ring.moveTo(-armLen, 0); ring.lineTo(-radius - 3, 0)
      ring.moveTo(radius + 3, 0); ring.lineTo(armLen, 0)
      ring.moveTo(0, -armLen); ring.lineTo(0, -radius - 3)
      ring.moveTo(0, radius + 3); ring.lineTo(0, armLen)
      ring.stroke({ width: 1.5, color, alpha: alpha * 0.5 })
    }
  } else {
    const CLICK_RADIUS = 22
    let arcStart: number, arcEnd: number
    if (phase === 1) {
      arcStart = START_ANGLE
      arcEnd = START_ANGLE - TWO_PI * sweep
    } else {
      arcStart = START_ANGLE - TWO_PI * (1 - sweep)
      arcEnd = START_ANGLE - TWO_PI
    }
    ring.arc(0, 0, CLICK_RADIUS, arcStart, arcEnd, true)
    ring.stroke({ width: 1.5, color, alpha: 0.75 })
  }
  if (app) app.render()
}

function onMouseMove(e: MouseEvent) {
  cursorX = e.clientX
  cursorY = e.clientY
  if (cursorGfx) {
    cursorGfx.position.set(cursorX, cursorY)
    if (glowGfx) glowGfx.position.set(cursorX, cursorY)
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
    tl.to(obj, { sweep: 1, duration: 0.4, ease: 'power2.inOut', onUpdate() { drawClickAnimation(ring, obj.sweep, 1) } })
    tl.to(obj, { sweep: 0, duration: 0.25, ease: 'power2.in', onUpdate() { drawClickAnimation(ring, obj.sweep, 2) }, onComplete() { ring.destroy() } })
  })

  if (cursorGfx) {
    gsap.to(cursorGfx, { alpha: 0.5, duration: 0.15, yoyo: true, repeat: 1 })
  }
}

function onMouseLeave() {
  if (cursorGfx) gsap.to(cursorGfx, { alpha: 0, duration: 0.3 })
  if (glowGfx) gsap.to(glowGfx, { alpha: 0, duration: 0.3 })
}

function onMouseEnter() {
  if (cursorGfx) {
    cursorGfx.position.set(cursorX, cursorY)
    if (glowGfx) glowGfx.position.set(cursorX, cursorY)
    gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
    if (glowGfx) gsap.to(glowGfx, { alpha: 1, duration: 0.3 })
  }
}

onMounted(async () => {
  if (!containerRef.value) return
  activeStyle = currentStyle.value

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

  if (activeStyle === 'retro-futurism') {
    glowGfx = new Graphics()
    glowGfx.alpha = 0
    app.stage.addChild(glowGfx)
  }

  cursorGfx = new Graphics()
  cursorGfx.alpha = 0
  app.stage.addChild(cursorGfx)
  drawCursor()
  app.render()

  const fadeIn = () => {
    if (cursorGfx) {
      if (app) app.render()
      gsap.to(cursorGfx, { alpha: 1, duration: 0.3 })
      if (glowGfx) gsap.to(glowGfx, { alpha: 1, duration: 0.3 })
      drawCursor()
    }
  }
  window.addEventListener('mousemove', fadeIn, { once: true })

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mouseleave', onMouseLeave)
  document.addEventListener('mouseenter', onMouseEnter)
})

watch(() => colors.value.cursorColor, () => { drawCursor(); if (app) app.render() })
watch(currentStyle, (newId) => {
  activeStyle = newId
  if (newId === 'retro-futurism' && !glowGfx && app) {
    glowGfx = new Graphics()
    glowGfx.alpha = 0
    app.stage.addChildAt(glowGfx, 0)
  } else if (newId !== 'retro-futurism' && glowGfx) {
    glowGfx.destroy()
    glowGfx = null
  }
  drawCursor()
  if (app) app.render()
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
  if (glowGfx) { glowGfx.destroy(); glowGfx = null }
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

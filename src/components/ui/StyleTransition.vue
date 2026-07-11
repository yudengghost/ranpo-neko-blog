<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import type { VisualStyleId } from '@/types'
import { useVisualStyle } from '@/composables/useVisualStyle'
import { colorSchemes } from '@/theme/colors'

const { currentStyle, currentVariant, onStyleChange } = useVisualStyle()

const overlayRef = ref<HTMLDivElement>()
const visible = ref(false)
let ctx: gsap.Context | null = null

function getTargetColors() {
  const scheme = colorSchemes[currentVariant.value]
  return {
    primary: scheme.colors.primary,
    accent: scheme.colors.accent,
    bg: scheme.colors.bg,
    text: scheme.colors.text,
  }
}

function playGeometricEnter() {
  if (!overlayRef.value) return
  const c = getTargetColors()
  const el = overlayRef.value
  el.innerHTML = ''

  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.position = 'absolute'
  svg.style.inset = '0'
  svg.style.width = '100%'
  svg.style.height = '100%'
  el.appendChild(svg)

  const w = window.innerWidth
  const h = window.innerHeight
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

  const lines: SVGPathElement[] = []
  const corners = [
    [0, 0, w, h],
    [w, 0, 0, h],
    [0, h, w, 0],
    [w, h, 0, 0],
  ]
  for (const [x1, y1, x2, y2] of corners) {
    const path = document.createElementNS(svgNS, 'line')
    path.setAttribute('x1', String(x1))
    path.setAttribute('y1', String(y1))
    path.setAttribute('x2', String(x1))
    path.setAttribute('y2', String(y1))
    path.setAttribute('stroke', c.primary)
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-linecap', 'round')
    svg.appendChild(path)
    lines.push(path)
  }

  const tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
      el.innerHTML = ''
    },
  })

  for (const [i, [, , x2, y2]] of corners.entries()) {
    const target = lines[i]!
    tl.to(target as unknown as SVGLineElement, {
      attr: { x2: x2 as number, y2: y2 as number },
      duration: 0.35,
      ease: 'power2.inOut',
    }, i * 0.08)
  }

  const centerDot = document.createElementNS(svgNS, 'circle')
  centerDot.setAttribute('cx', String(w / 2))
  centerDot.setAttribute('cy', String(h / 2))
  centerDot.setAttribute('r', '0')
  centerDot.setAttribute('fill', c.primary)
  svg.appendChild(centerDot)

  const burstCircle = document.createElementNS(svgNS, 'circle')
  burstCircle.setAttribute('cx', String(w / 2))
  burstCircle.setAttribute('cy', String(h / 2))
  burstCircle.setAttribute('r', '0')
  burstCircle.setAttribute('fill', 'none')
  burstCircle.setAttribute('stroke', c.primary)
  burstCircle.setAttribute('stroke-width', '1.5')
  burstCircle.setAttribute('opacity', '0.6')
  svg.appendChild(burstCircle)

  tl.call(() => {
    el.style.background = c.bg
  })
  tl.to(centerDot as unknown as SVGCircleElement, { attr: { r: 8 }, duration: 0.15, ease: 'power2.out' }, '-=0.1')
  tl.to(svg, { opacity: 0, duration: 0.3 }, '-=0.05')
  tl.to(burstCircle as unknown as SVGCircleElement, {
    attr: { r: Math.max(w, h) },
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, '<')
  tl.to(el, { opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2')
}

function playBrutalistEnter() {
  if (!overlayRef.value) return
  const c = getTargetColors()
  const el = overlayRef.value
  el.innerHTML = ''
  el.style.background = '#000000'

  const BLOCK = 48
  const cols = Math.ceil(window.innerWidth / BLOCK) + 1
  const rows = Math.ceil(window.innerHeight / BLOCK) + 1
  const total = cols * rows

  const blocks: HTMLDivElement[] = []
  const grid = document.createElement('div')
  grid.style.display = 'grid'
  grid.style.gridTemplateColumns = `repeat(${cols}, ${BLOCK}px)`
  grid.style.position = 'absolute'
  grid.style.inset = '0'
  grid.style.width = '100%'
  grid.style.height = '100%'
  el.appendChild(grid)

  const palettes: string[] = [c.primary, c.accent, '#FFFFFF']
  for (let i = 0; i < total; i++) {
    const block = document.createElement('div')
    block.style.width = `${BLOCK}px`
    block.style.height = `${BLOCK}px`
    block.style.background = palettes[i % palettes.length]!
    block.style.opacity = '0'
    grid.appendChild(block)
    blocks.push(block)
  }

  const tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
      el.innerHTML = ''
    },
  })

  tl.to(el, { background: '#000000', duration: 0.01 })
  tl.to(blocks, {
    opacity: 1,
    duration: 0.01,
    stagger: { amount: 0.25, from: 'start', grid: 'auto' },
    ease: 'none',
  })

  const stamp = document.createElement('div')
  stamp.style.position = 'absolute'
  stamp.style.left = '50%'
  stamp.style.top = '50%'
  stamp.style.width = '200px'
  stamp.style.height = '80px'
  stamp.style.marginLeft = '-100px'
  stamp.style.marginTop = '-40px'
  stamp.style.background = c.primary
  stamp.style.border = '4px solid #000'
  stamp.style.display = 'flex'
  stamp.style.alignItems = 'center'
  stamp.style.justifyContent = 'center'
  stamp.style.fontFamily = "'Space Mono', monospace"
  stamp.style.fontWeight = '700'
  stamp.style.fontSize = '1.4rem'
  stamp.style.color = '#FFFFFF'
  stamp.style.textTransform = 'uppercase'
  stamp.style.letterSpacing = '0.1em'
  stamp.style.transform = 'scale(0) rotate(-5deg)'
  stamp.textContent = 'BRUTAL'
  el.appendChild(stamp)

  tl.to(stamp, { scale: 1.1, rotate: 0, duration: 0.15, ease: 'power2.out' }, '+=0.05')
  tl.to(stamp, { scale: 1, duration: 0.08, ease: 'power2.in' })
  tl.to(el, {
    clipPath: 'inset(50% 50% 50% 50%)',
    duration: 0.25,
    ease: 'power3.in',
  }, '+=0.1')
  tl.set(el, { clipPath: 'none', opacity: 0 })
}

function playRetroFuturismEnter() {
  if (!overlayRef.value) return
  const c = getTargetColors()
  const el = overlayRef.value
  el.innerHTML = ''

  const flash = document.createElement('div')
  flash.style.position = 'absolute'
  flash.style.inset = '0'
  flash.style.background = '#FFFFFF'
  flash.style.opacity = '0'
  el.appendChild(flash)

  const squeeze = document.createElement('div')
  squeeze.style.position = 'absolute'
  squeeze.style.inset = '0'
  squeeze.style.background = c.bg
  squeeze.style.transformOrigin = 'center center'
  squeeze.style.transform = 'scaleY(1)'
  el.appendChild(squeeze)

  const rgbSplit = document.createElement('div')
  rgbSplit.style.position = 'absolute'
  rgbSplit.style.inset = '0'
  rgbSplit.style.background = c.bg
  rgbSplit.style.opacity = '0'
  el.appendChild(rgbSplit)

  const scanlines = document.createElement('div')
  scanlines.style.position = 'absolute'
  scanlines.style.inset = '0'
  scanlines.style.background = `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)`
  scanlines.style.opacity = '0'
  el.appendChild(scanlines)

  const noise = document.createElement('div')
  noise.style.position = 'absolute'
  noise.style.inset = '0'
  noise.style.background = c.primary
  noise.style.opacity = '0'
  noise.style.mixBlendMode = 'screen'
  el.appendChild(noise)

  const tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
      el.innerHTML = ''
    },
  })

  tl.set(squeeze, { scaleY: 1, filter: 'none' }, 0)
  tl.to(flash, { opacity: 1, duration: 0.04, ease: 'none' }, 0)
  tl.to(flash, { opacity: 0, duration: 0.08, ease: 'none' }, 0.04)
  tl.to(squeeze, { scaleY: 0.002, duration: 0.18, ease: 'power4.in' }, 0)
  tl.set(rgbSplit, { opacity: 1 }, 0.18)
  tl.to(squeeze, { scaleY: 1, duration: 0.25, ease: 'power2.out' }, 0.2)
  tl.to(rgbSplit, {
    opacity: 0.6,
    duration: 0.1,
    ease: 'none',
    onStart() {
      rgbSplit.style.boxShadow = `inset 4px 0 ${c.primary}, inset -4px 0 ${c.accent}`
    },
  }, 0.2)
  tl.to(scanlines, { opacity: 1, duration: 0.1 }, 0.25)
  tl.to(noise, {
    opacity: 0.08,
    duration: 0.05,
    yoyo: true,
    repeat: 3,
    ease: 'none',
  }, 0.25)
  tl.to(rgbSplit, { opacity: 0, duration: 0.2 }, 0.4)
  tl.to(scanlines, { opacity: 0, duration: 0.25 }, '-=0.15')
  tl.to(el, { opacity: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
}

function playTransition(to: VisualStyleId) {
  if (!overlayRef.value) return
  visible.value = true
  overlayRef.value.style.opacity = '1'
  overlayRef.value.style.clipPath = 'none'
  overlayRef.value.style.background = 'transparent'
  overlayRef.value.innerHTML = ''

  if (to === 'geometric') {
    playGeometricEnter()
  } else if (to === 'brutalist') {
    playBrutalistEnter()
  } else {
    playRetroFuturismEnter()
  }
}

onMounted(() => {
  ctx = gsap.context(() => {})
  onStyleChange((_from, to) => {
    playTransition(to)
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div
    v-show="visible"
    ref="overlayRef"
    class="style-transition"
    aria-hidden="true"
  ></div>
</template>

<style scoped>
.style-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: all;
  overflow: hidden;
}
</style>

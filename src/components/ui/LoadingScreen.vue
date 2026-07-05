<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics, Container } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { hexToNumber } from '@/utils/color'

const emit = defineEmits<{ done: [] }>()
const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null

const TWO_PI = Math.PI * 2
const HEX_R = 60
const OUTER_R = 180

function hexVertices(r: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return pts
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

  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const color = hexToNumber(colors.value.primary)
  const stage = new Container()
  app.stage.addChild(stage)

  // ---- Layer 1: thin grid fading in ----
  const grid = new Graphics()
  for (let x = 0; x <= window.innerWidth; x += 60) {
    grid.moveTo(x, 0); grid.lineTo(x, window.innerHeight)
  }
  for (let y = 0; y <= window.innerHeight; y += 60) {
    grid.moveTo(0, y); grid.lineTo(window.innerWidth, y)
  }
  grid.stroke({ width: 0.3, color, alpha: 0 })
  stage.addChild(grid)

  // ---- Layer 2: concentric rings ----
  const rings = new Graphics()
  for (const r of [100, 150, 220, 300]) {
    rings.circle(0, 0, r)
  }
  rings.stroke({ width: 0.5, color, alpha: 0 })
  stage.addChild(rings)

  // ---- Layer 3: hexagon ----
  const hex = new Graphics()
  const v = hexVertices(HEX_R)
  hex.moveTo(v[0]![0], v[0]![1])
  for (let i = 1; i < v.length; i++) hex.lineTo(v[i]![0], v[i]![1])
  hex.closePath()
  hex.stroke({ width: 1.5, color, alpha: 0 })
  stage.addChild(hex)

  // ---- Layer 4: diamond accent ----
  const diamond = new Graphics()
  diamond.moveTo(0, -22); diamond.lineTo(22, 0)
  diamond.lineTo(0, 22); diamond.lineTo(-22, 0)
  diamond.closePath()
  diamond.stroke({ width: 1.2, color, alpha: 0 })
  stage.addChild(diamond)

  // Center everything
  stage.position.set(cx, cy)
  hex.position.set(0, 0)
  diamond.position.set(0, 0)
  rings.position.set(0, 0)

  // ---- Animation sequence ----
  const tl = gsap.timeline({ paused: true })
  const gridAlpha = { v: 0 }
  const hexAlpha = { v: 0 }
  const hexRot = { v: 0 }
  const diamondScale = { v: 0 }
  const ringsAlpha = { v: 0 }

  // Phase 1: grid fades in
  tl.to(gridAlpha, { v: 0.04, duration: 0.6, ease: 'power2.inOut',
    onUpdate() { grid.clear(); for (let x = 0; x <= window.innerWidth; x += 60) { grid.moveTo(x, 0); grid.lineTo(x, window.innerHeight) } for (let y = 0; y <= window.innerHeight; y += 60) { grid.moveTo(0, y); grid.lineTo(window.innerWidth, y) } grid.stroke({ width: 0.3, color, alpha: gridAlpha.v }) }
  })

  // Phase 2: hexagon draws
  tl.to(hexAlpha, { v: 0.5, duration: 0.7, ease: 'power3.out',
    onUpdate() { hex.clear(); const verts = hexVertices(HEX_R); hex.moveTo(verts[0]![0], verts[0]![1]); for (let i = 1; i < verts.length; i++) hex.lineTo(verts[i]![0], verts[i]![1]); hex.closePath(); hex.stroke({ width: 1.5, color, alpha: hexAlpha.v }) }
  }, '-=0.2')

  // Phase 3: diamond expands + rings appear
  tl.to(diamondScale, { v: 1, duration: 0.5, ease: 'back.out(1.5)',
    onUpdate() { diamond.scale.set(diamondScale.v); diamond.alpha = diamondScale.v; diamond.clear(); diamond.moveTo(0, -22); diamond.lineTo(22, 0); diamond.lineTo(0, 22); diamond.lineTo(-22, 0); diamond.closePath(); diamond.stroke({ width: 1.2, color, alpha: 0.4 }) }
  }, '-=0.3')
  tl.to(ringsAlpha, { v: 0.15, duration: 0.5, ease: 'power2.out',
    onUpdate() { rings.clear(); for (const r of [100, 150, 220, 300]) { rings.circle(0, 0, r) } rings.stroke({ width: 0.5, color, alpha: ringsAlpha.v }) }
  }, '<')

  // Phase 4: subtle hex rotation hold
  tl.to(hexRot, { v: 0.03, duration: 0.8, ease: 'none',
    onUpdate() { hex.rotation = hexRot.v }
  }, '-=0.1')

  // Start animation
  tl.play()

  // Signal ready after animation settles
  await new Promise((r) => setTimeout(r, 1800))

  // Exit: fade everything out + scale up
  gsap.to(stage, {
    alpha: 0,
    duration: 0.5,
    ease: 'power2.in',
  })
  gsap.to(stage.scale, {
    x: 1.3,
    y: 1.3,
    duration: 0.5,
    ease: 'power2.in',
    onComplete() {
      emit('done')
    },
  })
})

onUnmounted(() => {
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
  z-index: 9999;
  background: var(--color-bg);
  transition: background-color 0.6s ease;
}
</style>

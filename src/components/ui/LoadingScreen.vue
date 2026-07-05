<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { hexToNumber } from '@/utils/color'

const emit = defineEmits<{ done: [] }>()
const { colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null

const TWO_PI = Math.PI * 2
const HEX_R = 55
const DIAMOND_R = 20
const CIRCLE_R = 85
const CIRCLE_SEGMENTS = 60
const TRAIL_LENGTH = 30 // how many segments in the glow tail

function hexVertices(r: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return pts
}

function buildWaypoints(): [number, number][] {
  const wp: [number, number][] = []

  // Start from center
  wp.push([0, 0])
  // Jump to first hex vertex, trace all 6
  const hexV = hexVertices(HEX_R)
  wp.push(...hexV)
  wp.push([hexV[0]![0], hexV[0]![1]]) // close hex

  // Diamond
  wp.push([0, -DIAMOND_R])
  wp.push([DIAMOND_R, 0])
  wp.push([0, DIAMOND_R])
  wp.push([-DIAMOND_R, 0])
  wp.push([0, -DIAMOND_R])

  // Circle (approximate)
  for (let i = 0; i <= CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * TWO_PI - Math.PI / 2
    wp.push([Math.cos(a) * CIRCLE_R, Math.sin(a) * CIRCLE_R])
  }

  // Crossing lines
  wp.push([-CIRCLE_R, 0])
  wp.push([CIRCLE_R, 0])
  wp.push([0, 0])
  wp.push([0, -CIRCLE_R])
  wp.push([0, CIRCLE_R])

  // Return to center
  wp.push([0, 0])
  return wp
}

// Pre-compute cumulative distances along the path
function buildDistances(pts: [number, number][]): number[] {
  const dists = [0]
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]![0] - pts[i - 1]![0]
    const dy = pts[i]![1] - pts[i - 1]![1]
    dists.push(dists[i - 1]! + Math.sqrt(dx * dx + dy * dy))
  }
  return dists
}

// Draw the trail up to a given progress and with a given alpha multiplier
function drawTrail(gfx: Graphics, pts: [number, number][], dists: number[], progress: number, color: number, alphaMul = 1) {
  gfx.clear()
  if (progress <= 0) return
  const totalDist = dists[dists.length - 1]!
  const targetDist = totalDist * progress

  // Find the last point index
  let endIdx = 0
  while (endIdx < dists.length && dists[endIdx]! <= targetDist) endIdx++
  if (endIdx >= pts.length) endIdx = pts.length - 1

  // Glow layer: draw wider, lower-alpha segments for the trail
  for (let layer = 0; layer < 2; layer++) {
    const width = layer === 0 ? 1.2 : 2.5
    const alpha = layer === 0 ? 0.8 * alphaMul : 0.15 * alphaMul

    gfx.moveTo(pts[0]![0], pts[0]![1])

    // Draw full segments
    for (let i = 1; i < endIdx; i++) {
      gfx.lineTo(pts[i]![0], pts[i]![1])
    }

    // Draw partial final segment
    if (endIdx < pts.length && endIdx > 0) {
      const segStart = dists[endIdx - 1]!
      const segLen = dists[endIdx]! - segStart
      const frac = segLen > 0 ? Math.min(1, (targetDist - segStart) / segLen) : 1
      if (frac > 0) {
        const px = pts[endIdx - 1]![0] + (pts[endIdx]![0] - pts[endIdx - 1]![0]) * frac
        const py = pts[endIdx - 1]![1] + (pts[endIdx]![1] - pts[endIdx - 1]![1]) * frac
        gfx.lineTo(px, py)
      }
    }

    gfx.stroke({ width, color, alpha, cap: 'round' as any, join: 'round' as any })
    if (layer === 0) break // skip glow in reverse mode for performance
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

  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const color = hexToNumber(colors.value.primary)
  const trail = new Graphics()
  trail.position.set(cx, cy)
  app.stage.addChild(trail)

  const waypoints = buildWaypoints()
  const distances = buildDistances(waypoints)
  const progress = { v: 0 }

  // Phase 1: draw the path (0 → 1)
  const tl = gsap.timeline()
  tl.to(progress, {
    v: 1,
    duration: 2.0,
    ease: 'power2.inOut',
    onUpdate() { drawTrail(trail, waypoints, distances, progress.v, color, 1) },
  })

  // Phase 2: pulse — brighten flash with brief hold before retract
  tl.to(trail, { alpha: 1.4, duration: 0.12, yoyo: true, repeat: 1 })

  // Phase 3: erase after brief pause — retract from endpoint back (1 → 0)
  tl.to(progress, {
    v: 0,
    duration: 0.7,
    ease: 'power3.in',
    onUpdate() { drawTrail(trail, waypoints, distances, progress.v, color, 0.6) },
    onComplete() {
      gsap.to(trail, {
        alpha: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete() { emit('done') },
      })
    },
  }, '+=0.35')
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

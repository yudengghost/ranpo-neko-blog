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

type PathPt = [number, number, number] // [x, y, width]
type OrnDef = [number, number, number]  // [x, y, radius]

function buildPath(scale: number): PathPt[] {
  const s = scale
  const result: PathPt[] = []

  // Open: emerge from center upward, thin→thick
  for (let t = 0; t <= 1; t += 0.06)
    result.push([0, -18 * (1 - t), 0.5 + t * 1.5])

  // Crescent arc sweeping right
  const arcR = 85 * s
  for (let t = 0; t <= 1; t += 0.035)
    result.push([Math.cos(-Math.PI / 2 + t * Math.PI * 0.65) * arcR, Math.sin(-Math.PI / 2 + t * Math.PI * 0.65) * arcR - 8, 2.2])

  // Hexagon — thick confident strokes
  const hexR = 56 * s
  const hexV: [number, number][] = []
  for (let i = 0; i < 6; i++)
    hexV.push([Math.cos(TWO_PI / 6 * i - Math.PI / 6) * hexR, Math.sin(TWO_PI / 6 * i - Math.PI / 6) * hexR])
  for (let i = 0; i <= 6; i++)
    result.push([hexV[i % 6]![0], hexV[i % 6]![1], 2.6])

  // Delicate inner loop — thin, elegant
  const lr = 28 * s
  for (let t = 0; t <= 1; t += 0.045) {
    const a = Math.PI * 0.7 + t * Math.PI * 1.6
    const r = lr * (1 + Math.sin(t * Math.PI * 2) * 0.3)
    result.push([Math.cos(a) * r + 12, Math.sin(a) * r, 0.45])
  }

  // Diamond — precise accent strokes
  const dR = 22 * s
  const dim = 40 * s
  for (const pt of [[-dim, -dim + dR], [-dim + dR, -dim], [-dim + 2 * dR, -dim]]) {
    result.push([pt[0]!, pt[1]!, 1.0])
  }
  result.push([-dim + dR, -dim + 2 * dR, 1.0])
  result.push([-dim, -dim + dR, 1.0])

  // Grand circle with oscillating width
  const circleR = 72 * s
  for (let t = 0; t <= 1; t += 0.022) {
    const a = -Math.PI / 2 + t * TWO_PI
    result.push([Math.cos(a) * circleR, Math.sin(a) * circleR, 1.8 + Math.sin(t * TWO_PI * 4) * 0.7])
  }

  // Return — smooth descent to center, thinning
  for (let t = 0; t <= 1; t += 0.07) {
    const a = -Math.PI / 2 + (1 - t) * TWO_PI * 0.3
    const r = circleR * (1 - t)
    result.push([Math.cos(a) * r, Math.sin(a) * r, 1.5 * (1 - t) + 0.2])
  }
  result.push([0, 0, 0.3])

  return result
}

function ornDefs(): OrnDef[] {
  return [
    [0, -18, 3],           // top start
    [0, 0, 5],             // center — large
    [-85, -8, 2.5], [85, -8, 2.5], // crescent ends
    [56, 0, 3], [0, -56, 3], [-56, 0, 3], [0, 56, 3], // hex key vertices
    [0, -22, 2], [22, 0, 2], [0, 22, 2], [-22, 0, 2], // diamond corners
    [0, -72, 3.5], [0, 72, 3.5], [72, 0, 3.5], [-72, 0, 3.5], // circle quarters
    [0, 0, 6],             // final center — largest
  ]
}

function buildDists(pts: PathPt[]): number[] {
  const dists = [0]
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]![0] - pts[i - 1]![0]
    const dy = pts[i]![1] - pts[i - 1]![1]
    dists.push(dists[i - 1]! + Math.sqrt(dx * dx + dy * dy))
  }
  return dists
}

function drawTrail(gfx: Graphics, pts: PathPt[], dists: number[], targetDist: number, color: number) {
  gfx.clear()
  if (targetDist <= 0.5) return

  let endIdx = 0
  const maxDist = dists[dists.length - 1]!
  const clamped = Math.min(targetDist, maxDist)
  while (endIdx < dists.length && dists[endIdx]! <= clamped) endIdx++
  if (endIdx >= pts.length) endIdx = pts.length - 1

  // Partial last segment fraction
  let frac = 1
  if (endIdx < pts.length && endIdx > 0) {
    const segStart = dists[endIdx - 1]!
    const segLen = dists[endIdx]! - segStart
    frac = segLen > 0 ? Math.min(1, (clamped - segStart) / segLen) : 0
  }

  // Wide ambient glow
  gfx.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < endIdx; i++) gfx.lineTo(pts[i]![0], pts[i]![1])
  if (endIdx < pts.length && endIdx > 0 && frac > 0) {
    gfx.lineTo(
      pts[endIdx - 1]![0] + (pts[endIdx]![0] - pts[endIdx - 1]![0]) * frac,
      pts[endIdx - 1]![1] + (pts[endIdx]![1] - pts[endIdx - 1]![1]) * frac,
    )
  }
  gfx.stroke({ width: 5, color, alpha: 0.06, cap: 'round', join: 'round' })

  // Mid glow
  gfx.clear()
  gfx.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < endIdx; i++) gfx.lineTo(pts[i]![0], pts[i]![1])
  if (endIdx < pts.length && endIdx > 0 && frac > 0) {
    gfx.lineTo(
      pts[endIdx - 1]![0] + (pts[endIdx]![0] - pts[endIdx - 1]![0]) * frac,
      pts[endIdx - 1]![1] + (pts[endIdx]![1] - pts[endIdx - 1]![1]) * frac,
    )
  }
  gfx.stroke({ width: 2.2, color, alpha: 0.18, cap: 'round', join: 'round' })

  // Main line
  gfx.clear()
  gfx.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < endIdx; i++) gfx.lineTo(pts[i]![0], pts[i]![1])
  if (endIdx < pts.length && endIdx > 0 && frac > 0) {
    gfx.lineTo(
      pts[endIdx - 1]![0] + (pts[endIdx]![0] - pts[endIdx - 1]![0]) * frac,
      pts[endIdx - 1]![1] + (pts[endIdx]![1] - pts[endIdx - 1]![1]) * frac,
    )
  }
  gfx.stroke({ width: 1.3, color, alpha: 0.78, cap: 'round', join: 'round' })
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
  const scale = Math.max(0.5, Math.min(window.innerWidth, window.innerHeight) / 650)

  const stage = new Container()
  stage.position.set(cx, cy)
  app.stage.addChild(stage)

  // Faint background grid
  const bg = new Graphics()
  for (let x = -cx; x <= cx; x += 50) { bg.moveTo(x, -cy); bg.lineTo(x, cy) }
  for (let y = -cy; y <= cy; y += 50) { bg.moveTo(-cx, y); bg.lineTo(cx, y) }
  bg.stroke({ width: 0.3, color, alpha: 0.025 })
  stage.addChild(bg)

  // Radial rings
  const rings = new Graphics()
  for (const r of [100, 180, 280]) { rings.circle(0, 0, r) }
  rings.stroke({ width: 0.4, color, alpha: 0.035 })
  stage.addChild(rings)

  // Ornaments — sparkle diamonds at key positions
  const ornContainer = new Container()
  stage.addChild(ornContainer)

  const ornDefList = ornDefs()
  const ornGraphics: { gfx: Graphics; alpha: number }[] = []

  for (const [ox, oy, or] of ornDefList) {
    const g = new Graphics()
    const h = or * 0.6
    g.moveTo(0, -or); g.lineTo(h, 0); g.lineTo(0, or); g.lineTo(-h, 0)
    g.closePath()
    g.stroke({ width: 0.7, color, alpha: 0 })
    g.position.set(ox, oy)
    g.alpha = 0
    ornContainer.addChild(g)
    ornGraphics.push({ gfx: g, alpha: 0 })
  }

  // Precompute ornament distances along path
  const pathPts = buildPath(scale)
  const dists = buildDists(pathPts)
  const ornDists: number[] = []
  for (const [ox, oy] of ornDefList) {
    let bestIdx = 0
    let minD = Infinity
    for (let i = 0; i < pathPts.length; i++) {
      const d = (pathPts[i]![0] - ox) ** 2 + (pathPts[i]![1] - oy) ** 2
      if (d < minD) { minD = d; bestIdx = i }
    }
    ornDists.push(dists[bestIdx]!)
  }

  const totalDist = dists[dists.length - 1]!
  const trail = new Graphics()
  stage.addChild(trail)
  const progress = { v: 0 }

  let lastOrnRevealed = -1

  // Phase 1: Draw
  const tl = gsap.timeline()
  tl.to(progress, {
    v: 1,
    duration: 2.5,
    ease: 'power3.inOut',
    onUpdate() {
      const curDist = totalDist * progress.v
      drawTrail(trail, pathPts, dists, curDist, color)

      // Reveal ornaments as line passes
      while (lastOrnRevealed + 1 < ornDists.length && ornDists[lastOrnRevealed + 1]! <= curDist) {
        lastOrnRevealed++
        const o = ornGraphics[lastOrnRevealed]!
        gsap.to(o.gfx, { alpha: 0.5, duration: 0.35, ease: 'power2.out' })
      }

      if (app) app.render()
    },
  })

  // Phase 2: Composition breathes + ornaments brighten
  tl.to(stage.scale, { x: 1.03, y: 1.03, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 1 })
  // Flash ornaments brighter
  for (const o of ornGraphics) {
    tl.to(o.gfx, { alpha: 0.9, duration: 0.3, yoyo: true, repeat: 1, delay: Math.random() * 0.3 }, '<')
  }

  // Phase 3: Retract from endpoint
  tl.to(progress, {
    v: 0,
    duration: 0.85,
    ease: 'power4.in',
    onUpdate() {
      drawTrail(trail, pathPts, dists, totalDist * progress.v, color)
      if (app) app.render()
    },
    onComplete() {
      // Exit: dissolve outward
      gsap.to(stage, { alpha: 0, duration: 0.4, ease: 'power2.in', onComplete() { emit('done') } })
      gsap.to(stage.scale, { x: 1.25, y: 1.25, duration: 0.4, ease: 'power2.in' })
    },
  }, '+=0.5')
})

onUnmounted(() => {
  if (app) { app.destroy(true, { children: true }); app = null }
})
</script>

<template>
  <div ref="containerRef" class="loading-screen"></div>
</template>

<style scoped>
.loading-screen {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--color-bg);
  transition: background-color 0.6s ease;
}
</style>

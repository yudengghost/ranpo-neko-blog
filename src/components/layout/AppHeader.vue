<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Application, Graphics } from 'pixi.js'
import ColorSwitcher from '@/components/ui/ColorSwitcher.vue'
import { siteConfig } from '@/config'
import { useArticles } from '@/composables/useArticles'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { colors } = useTheme()
const { getCategories } = useArticles()
const categories = getCategories()
const mobileOpen = ref(false)

// ---- PixiJS wave line system ----
const navRef = ref<HTMLElement>()
let app: Application | null = null
let linkPositions: { x: number; y: number }[] = []
let nodeActivity: number[] = [] // energy level per node, decays over time
const hoveredIndex = ref(-1)
const activeIndex = ref(-1)

interface Pulse {
  x: number
  y: number
  amplitude: number
  speed: number
  dir: 1 | -1
  segment: number // which line segment this pulse is traveling on
  pos: number // 0-1 position along the segment
}

const pulses: Pulse[] = []

// All nav link labels in order (dynamic + static)
const linkRoutes = ['/', ...categories.map((c) => `/category/${c.slug}`), '/about']
function linksMatch(a: string, b: string) {
  if (a === '/') return b === '/'
  return a.startsWith(b) || b.startsWith(a)
}

function updateLinkPositions() {
  if (!navRef.value) return
  const links = navRef.value.querySelectorAll<HTMLElement>('.nav-link')
  const navRect = navRef.value.getBoundingClientRect()
  linkPositions = Array.from(links).map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - navRect.left + r.width / 2, y: r.top - navRect.top + r.height / 2 }
  })
  // Init node activity array
  if (nodeActivity.length !== linkPositions.length) {
    nodeActivity = linkPositions.map(() => 0)
  }
}

function findActiveIndex(): number {
  const idx = linkRoutes.findIndex((r) => linksMatch(route.path, r))
  return idx >= 0 ? idx : 0
}

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

// Draw helpers
function bezierPoint(ax: number, ay: number, bx: number, by: number, t: number, sag: number) {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2 + sag
  return {
    x: (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx,
    y: (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by,
  }
}

function emitFromNode(nodeIdx: number, strength: number) {
  const np = linkPositions[nodeIdx]
  if (!np) return
  // Left direction
  if (nodeIdx > 0) {
    pulses.push({
      x: np.x,
      y: np.y,
      amplitude: strength,
      speed: 0.004 + strength * 0.006,
      dir: -1,
      segment: nodeIdx - 1,
      pos: 1,
    })
  }
  // Right direction
  if (nodeIdx < linkPositions.length - 1) {
    pulses.push({
      x: np.x,
      y: np.y,
      amplitude: strength,
      speed: 0.004 + strength * 0.006,
      dir: 1,
      segment: nodeIdx,
      pos: 0,
    })
  }
}

function onNavHover(idx: number) {
  hoveredIndex.value = idx
}

function onNavLeave() {
  hoveredIndex.value = -1
}

onMounted(async () => {
  await nextTick()
  if (!navRef.value) return

  updateLinkPositions()
  activeIndex.value = findActiveIndex()

  app = new Application()
  const w = navRef.value.offsetWidth
  const h = navRef.value.offsetHeight
  await app.init({
    canvas: document.createElement('canvas'),
    width: w,
    height: h,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  const canvas = app.canvas as HTMLCanvasElement
  canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:0;'
  navRef.value.style.position = 'relative'
  navRef.value.appendChild(canvas)

  const lineGfx = new Graphics()
  const spotGfx = new Graphics()
  const nodeGfx = new Graphics()
  app.stage.addChild(lineGfx, spotGfx, nodeGfx)
  const SAG = 3

  // Resize observer to track position changes
  const ro = new ResizeObserver(() => {
    if (!navRef.value || !app) return
    updateLinkPositions()
    app.renderer.resize(navRef.value.offsetWidth, navRef.value.offsetHeight)
  })
  ro.observe(navRef.value)

  // Route change watcher
  watch(() => route.path, () => {
    activeIndex.value = findActiveIndex()
  })

  // Emission timer: active node emits gentle pulses; hover emits strong ones
  let emitTimer = 0

  app.ticker.add(() => {
    const dt = Math.min(app!.ticker.deltaTime, 3) // cap for tab-switch safety
    const primaryColor = hexToNum(colors.value.primary)
    const n = linkPositions.length

    // ---- Update node activity ----
    const ACTIVE_STRENGTH = 0.25
    const DECAY = 0.96

    for (let i = 0; i < n; i++) {
      // Apply decay
      nodeActivity[i]! *= DECAY

      // Active route gives constant gentle energy
      if (i === activeIndex.value) {
        nodeActivity[i] = Math.max(nodeActivity[i]!, ACTIVE_STRENGTH)
      }
      // Hover spikes energy up
      if (i === hoveredIndex.value) {
        nodeActivity[i] = 1.0
      }
    }

    // Emit pulses from nodes with enough activity
    emitTimer += dt
    const EMIT_INTERVAL = 8 // frames between possible emissions
    if (emitTimer >= EMIT_INTERVAL) {
      emitTimer = 0
      for (let i = 0; i < n; i++) {
        if (nodeActivity[i]! > 0.05) {
          emitFromNode(i, nodeActivity[i]! * 0.7)
        }
      }
    }

    // ---- Update pulses ----
    for (let j = pulses.length - 1; j >= 0; j--) {
      const p = pulses[j]!
      p.pos += p.dir * p.speed * dt
      p.amplitude *= 0.985

      // Did it reach the end of this segment?
      if (p.pos > 1) {
        // Hop to next segment on the right
        if (p.segment + 1 < n - 1) {
          p.segment += 1
          p.pos = 0
        } else {
          pulses.splice(j, 1)
          continue
        }
      } else if (p.pos < 0) {
        // Hop to next segment on the left
        if (p.segment - 1 >= 0) {
          p.segment -= 1
          p.pos = 1
        } else {
          pulses.splice(j, 1)
          continue
        }
      }

      // Kill dead pulses
      if (p.amplitude < 0.02) {
        pulses.splice(j, 1)
        continue
      }

      // Update world position
      if (p.segment >= 0 && p.segment < n - 1) {
        const a = linkPositions[p.segment]
        const b = linkPositions[p.segment + 1]
        if (a && b) {
          const pt = bezierPoint(a.x, a.y, b.x, b.y, p.pos, SAG)
          p.x = pt.x
          p.y = pt.y
        }
      }
    }

    // ---- Draw ----
    lineGfx.clear()
    spotGfx.clear()
    nodeGfx.clear()

    // Draw base lines (bezier curves)
    for (let i = 0; i < n - 1; i++) {
      const a = linkPositions[i]
      const b = linkPositions[i + 1]
      if (!a || !b) continue
      // Draw catenary wire with 8 segments
      const STEPS = 12
      for (let t = 0; t < STEPS; t++) {
        const p0 = bezierPoint(a.x, a.y, b.x, b.y, t / STEPS, SAG)
        const p1 = bezierPoint(a.x, a.y, b.x, b.y, (t + 1) / STEPS, SAG)
        lineGfx.moveTo(p0.x, p0.y)
        lineGfx.lineTo(p1.x, p1.y)
      }
    }
    lineGfx.stroke({ width: 0.5, color: primaryColor, alpha: 0.08 })

    // Draw pulse spots
    for (const p of pulses) {
      const alpha = p.amplitude * 0.55
      const size = 1.5 + p.amplitude * 2
      spotGfx.circle(p.x, p.y, size)
      spotGfx.fill({ color: primaryColor, alpha })
      // Glow halo
      spotGfx.circle(p.x, p.y, size * 2.5)
      spotGfx.fill({ color: 0xffffff, alpha: alpha * 0.3 })
    }

    // Draw node diamonds
    for (let i = 0; i < n; i++) {
      const p = linkPositions[i]
      if (!p) continue
      const isActive = i === activeIndex.value
      const isHovered = i === hoveredIndex.value
      const sz = isHovered ? 5 : isActive ? 4 : 2.5
      const alpha = isHovered ? 0.7 : isActive ? 0.5 : 0.2

      // Diamond shape
      nodeGfx.moveTo(p.x, p.y - sz)
      nodeGfx.lineTo(p.x + sz * 0.7, p.y)
      nodeGfx.lineTo(p.x, p.y + sz)
      nodeGfx.lineTo(p.x - sz * 0.7, p.y)
      nodeGfx.closePath()
      nodeGfx.stroke({ width: 0.6, color: primaryColor, alpha })

      // Inner fill
      nodeGfx.moveTo(p.x, p.y - sz * 0.5)
      nodeGfx.lineTo(p.x + sz * 0.35, p.y)
      nodeGfx.lineTo(p.x, p.y + sz * 0.5)
      nodeGfx.lineTo(p.x - sz * 0.35, p.y)
      nodeGfx.closePath()
      nodeGfx.fill({ color: primaryColor, alpha: alpha * 0.4 })
    }

    // Active node: pulsing glow ring
    if (activeIndex.value >= 0 && activeIndex.value < n) {
      const ap = linkPositions[activeIndex.value]
      if (ap) {
        const ringPhase = performance.now() * 0.002
        const ringRadius = 6 + Math.sin(ringPhase) * 2.5
        nodeGfx.circle(ap.x, ap.y, ringRadius)
        nodeGfx.stroke({ width: 0.4, color: primaryColor, alpha: 0.25 + Math.sin(ringPhase * 2) * 0.1 })
      }
    }
  })

  onUnmounted(() => {
    ro.disconnect()
    if (app) {
      app.destroy(true, { children: true })
      app = null
    }
  })
})

// Re-draw on theme change
watch(colors, () => {
  updateLinkPositions()
}, { deep: true })
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo">
        <span class="logo-text">{{ siteConfig.name }}</span>
      </RouterLink>

      <nav ref="navRef" class="header-nav" :class="{ open: mobileOpen }">
        <RouterLink
          to="/"
          class="nav-link"
          @click="mobileOpen = false"
          @mouseenter="onNavHover(0)"
          @mouseleave="onNavLeave"
        >Home</RouterLink>
        <RouterLink
          v-for="(cat, ci) in categories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="nav-link"
          @click="mobileOpen = false"
          @mouseenter="onNavHover(ci + 1)"
          @mouseleave="onNavLeave"
        >
          {{ cat.name }}
        </RouterLink>
        <RouterLink
          to="/about"
          class="nav-link"
          @click="mobileOpen = false"
          @mouseenter="onNavHover(categories.length + 1)"
          @mouseleave="onNavLeave"
        >About</RouterLink>
      </nav>

      <div class="header-actions">
        <ColorSwitcher />
        <button
          class="mobile-toggle"
          @click="mobileOpen = !mobileOpen"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        >
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  border-bottom: 1px solid var(--color-borderLight);
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  text-decoration: none;
  color: var(--color-text);
  z-index: 2;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.header-logo:hover .logo-text {
  color: var(--color-primaryHover);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-textSecondary);
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.3s ease;
  z-index: 2;
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: var(--color-text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.mobile-toggle span {
  display: block;
  width: 20px;
  height: 1px;
  background: var(--color-text);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-toggle span.open:first-child {
  transform: rotate(45deg) translate(4px, 4px);
}

.mobile-toggle span.open:last-child {
  transform: rotate(-45deg) translate(4px, -4px);
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .header-nav {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    flex-direction: column;
    gap: 0;
    padding: 16px 0;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .header-nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-link {
    padding: 12px 24px;
    width: 100%;
  }
}
</style>

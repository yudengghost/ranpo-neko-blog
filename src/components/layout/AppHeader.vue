<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ColorSwitcher from '@/components/ui/ColorSwitcher.vue'
import SearchModal from '@/components/blog/SearchModal.vue'
import { siteConfig } from '@/config'
import { useArticles } from '@/composables/useArticles'
import { useTheme } from '@/composables/useTheme'

const { getCategories } = useArticles()
const { colors } = useTheme()
const categories = getCategories()
const mobileOpen = ref(false)
const catOpen = ref(false)
const searchOpen = ref(false)

// ── Canvas water effect ──
const canvasRef = ref<HTMLCanvasElement>()
const headerRef = ref<HTMLElement>()
let ctx: CanvasRenderingContext2D | null = null
let animId = 0
let W = 0
let H = 0
let time = 0

interface Ripple {
  x: number; y: number; r: number; maxR: number; opacity: number; speed: number
}
const ripples: Ripple[] = []
let lastRippleAt = 0

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function addRipple(x: number, y: number) {
  if (ripples.length > 22) ripples.shift()
  ripples.push({ x, y, r: 0, maxR: 24 + Math.random() * 44, opacity: 0.28, speed: 1.2 + Math.random() * 1.8 })
}

function onMouseMove(e: MouseEvent) {
  const now = performance.now()
  if (now - lastRippleAt < 90) return
  lastRippleAt = now
  const rect = canvasRef.value!.getBoundingClientRect()
  addRipple(e.clientX - rect.left, e.clientY - rect.top)
}

function waveY(x: number, t: number): number {
  return (
    7 * Math.sin(0.0035 * x + 0.35 * t) +
    4 * Math.sin(0.008 * x + 0.55 * t + 1.2) +
    2.5 * Math.sin(0.015 * x + 0.75 * t + 2.5) +
    1.5 * Math.sin(0.025 * x + 1.0 * t + 4)
  )
}

function draw(ts: number) {
  if (!ctx || !canvasRef.value) return
  time = ts * 0.001

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cw = W
  const ch = H
  const extend = 18
  const totalH = ch + extend

  canvasRef.value.width = cw * dpr
  canvasRef.value.height = totalH * dpr
  canvasRef.value.style.width = cw + 'px'
  canvasRef.value.style.height = totalH + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, cw, totalH)

  const primary = colors.value.primary
  const bg = colors.value.bg
  const waterFill = hexToRgba(bg, 0.92)

  // Draw header body with wavy bottom
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(cw, 0)
  ctx.lineTo(cw, ch)
  const step = 4
  for (let x = cw; x >= 0; x -= step) {
    ctx.lineTo(x, ch + waveY(x, time))
  }
  ctx.closePath()
  ctx.fillStyle = waterFill
  ctx.fill()

  // Wave stroke line
  ctx.beginPath()
  ctx.moveTo(0, ch + waveY(0, time))
  for (let x = step; x <= cw; x += step) {
    ctx.lineTo(x, ch + waveY(x, time))
  }
  ctx.strokeStyle = hexToRgba(primary, 0.2)
  ctx.lineWidth = 1
  ctx.stroke()

  // Second subtle wave line (offset)
  ctx.beginPath()
  ctx.moveTo(0, ch + waveY(0, time + 0.8))
  for (let x = step; x <= cw; x += step) {
    ctx.lineTo(x, ch + waveY(x, time + 0.8) - 3)
  }
  ctx.strokeStyle = hexToRgba(primary, 0.08)
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]!
    r.r += r.speed
    r.opacity -= 0.0035
    if (r.opacity <= 0 || r.r > r.maxR) { ripples.splice(i, 1); continue }
    const progress = r.r / r.maxR
    ctx.beginPath()
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(primary, r.opacity * (1 - progress))
    ctx.lineWidth = 1
    ctx.stroke()
  }

  animId = requestAnimationFrame(draw)
}

function resize() {
  if (!headerRef.value) return
  W = headerRef.value.offsetWidth
  H = headerRef.value.offsetHeight
}

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  resize()
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    animId = requestAnimationFrame(draw)
  }
  if (headerRef.value) {
    resizeObs = new ResizeObserver(resize)
    resizeObs.observe(headerRef.value)
    headerRef.value.addEventListener('mousemove', onMouseMove)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  resizeObs?.disconnect()
  headerRef.value?.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <header ref="headerRef" class="app-header">
    <canvas ref="canvasRef" class="water-canvas"></canvas>

    <div class="header-inner">
      <RouterLink to="/" class="header-logo" @click="mobileOpen = false; catOpen = false">
        <span class="logo-text">{{ siteConfig.name }}</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="header-nav" :class="{ open: mobileOpen }">
        <RouterLink to="/" class="nav-link" @click="mobileOpen = false; catOpen = false">Home</RouterLink>

        <div class="nav-dropdown-host" @mouseenter="catOpen = true" @mouseleave="catOpen = false">
          <button class="nav-link nav-link--btn" @click="catOpen = !catOpen">
            Categories
            <span class="nav-arrow" :class="{ up: catOpen }">&#9662;</span>
          </button>
          <Transition name="drop">
            <div v-if="catOpen" class="cat-dropdown">
              <RouterLink
                v-for="cat in categories"
                :key="cat.slug"
                :to="`/category/${cat.slug}`"
                class="cat-dropdown-link"
                @click="catOpen = false; mobileOpen = false"
              >
                {{ cat.name }}
              </RouterLink>
            </div>
          </Transition>
        </div>

        <button class="nav-link nav-link--btn" @click="searchOpen = true; mobileOpen = false">Search</button>
      </nav>

      <div class="header-actions">
        <ColorSwitcher />
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" :aria-label="mobileOpen ? 'Close menu' : 'Open menu'">
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 72px;
  transition: background-color 0.6s ease;
}

.water-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.header-inner {
  position: relative;
  z-index: 2;
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

/* ── Nav ── */
.header-nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-textSecondary);
  text-decoration: none;
  position: relative;
  padding: 4px 0;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: var(--color-text);
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
}

.nav-link--btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-textSecondary);
  padding: 4px 0;
}

.nav-link--btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-link--btn:hover,
.nav-link--btn:focus-visible {
  color: var(--color-text);
}

.nav-link--btn:hover::after,
.nav-link--btn:focus-visible::after {
  width: 100%;
}

.nav-arrow {
  font-size: 0.6rem;
  margin-left: 4px;
  display: inline-block;
  transition: transform 0.25s ease;
}

.nav-arrow.up {
  transform: rotate(180deg);
}

/* ── Categories dropdown ── */
.nav-dropdown-host {
  position: relative;
}

.cat-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-borderLight);
  border-radius: 12px;
  padding: 8px;
  min-width: 140px;
  box-shadow: 0 8px 32px var(--color-glow);
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.cat-dropdown-link {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 300;
  color: var(--color-textSecondary);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.cat-dropdown-link:hover {
  background: var(--color-surfaceHover);
  color: var(--color-primary);
}

/* Dropdown transition */
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* ── Actions ── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* ── Mobile ── */
@media (max-width: 768px) {
  .mobile-toggle { display: flex; }

  .header-nav {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    flex-direction: column;
    gap: 0;
    padding: 12px 0;
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

  .nav-link,
  .nav-link--btn {
    padding: 14px 24px;
    width: 100%;
    text-align: left;
  }

  .nav-link::after,
  .nav-link--btn::after { display: none; }

  .cat-dropdown {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    background: var(--color-bgAlt);
    border-radius: 0;
    margin: 0 12px;
  }
}
</style>

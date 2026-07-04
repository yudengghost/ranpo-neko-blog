<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import ColorSwitcher from '@/components/ui/ColorSwitcher.vue'
import SearchModal from '@/components/blog/SearchModal.vue'
import { siteConfig } from '@/config'
import { useArticles } from '@/composables/useArticles'

const { getCategories } = useArticles()
const categories = getCategories()
const mobileOpen = ref(false)
const catDropdownOpen = ref(false)
const searchOpen = ref(false)
const navRef = ref<HTMLElement>()

// ---- Spring physics for nav links ----
interface SpringLink {
  el: HTMLElement
  ox: number
  oy: number
  vx: number
  vy: number
  scale: number
  scaleV: number
}

let springLinks: SpringLink[] = []
let rafId = 0
let mouseX = -500
let mouseY = -500

const STIFFNESS = 0.12
const DAMPING = 0.25
const SCALE_STIFFNESS = 0.15
const SCALE_DAMPING = 0.3
const MAX_PULL = 18
const SCALE_AMOUNT = 1.06
const ATTRACT_RADIUS = 80

function springStep() {
  for (const link of springLinks) {
    const rect = link.el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    // Attraction toward mouse
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const influence = Math.max(0, 1 - dist / ATTRACT_RADIUS)

    // Target offset pulled toward cursor
    const tx = dx * influence * 0.15
    const ty = dy * influence * 0.15

    // Spring force
    const fx = (tx - link.ox) * STIFFNESS
    const fy = (ty - link.oy) * STIFFNESS

    // Integrate velocity
    link.vx += fx
    link.vy += fy
    link.vx *= 1 - DAMPING
    link.vy *= 1 - DAMPING

    // Integrate position
    link.ox += link.vx
    link.oy += link.vy

    // Clamp pull distance
    const pull = Math.sqrt(link.ox * link.ox + link.oy * link.oy)
    if (pull > MAX_PULL) {
      const ratio = MAX_PULL / pull
      link.ox *= ratio
      link.oy *= ratio
      link.vx *= 0.3
      link.vy *= 0.3
    }

    // Scale spring
    const targetScale = 1 + (SCALE_AMOUNT - 1) * influence
    const scaleForce = (targetScale - link.scale) * SCALE_STIFFNESS
    link.scaleV += scaleForce
    link.scaleV *= 1 - SCALE_DAMPING
    link.scale += link.scaleV

    // Apply transform
    link.el.style.transform = `translate3d(${link.ox}px, ${link.oy}px, 0) scale(${link.scale})`
  }

  rafId = requestAnimationFrame(springStep)
}

function initSprings() {
  if (!navRef.value) return
  const links = navRef.value.querySelectorAll<HTMLElement>('.nav-link, .header-logo')
  springLinks = Array.from(links).map((el) => ({
    el,
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
    scale: 1,
    scaleV: 0,
  }))
  rafId = requestAnimationFrame(springStep)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function onMouseLeave() {
  mouseX = -9999
  mouseY = -9999
}

function handleClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const springLink = springLinks.find((s) => s.el === target)
  if (!springLink) return

  // Inject scale impulse — press down, negative velocity creates overshoot bounce
  springLink.scale = 0.8
  springLink.scaleV = -0.14

  // Create geometric click indicator (diamond)
  const dot = document.createElement('span')
  dot.className = 'click-dot'
  target.appendChild(dot)

  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  dot.style.left = `${x}px`
  dot.style.top = `${y}px`

  gsap.to(dot, {
    scale: 3,
    opacity: 0,
    duration: 0.55,
    ease: 'power3.out',
    onComplete: () => dot.remove(),
  })
}

onMounted(() => {
  initSprings()
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseleave', onMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo" @mousedown="handleClick">
        <span class="logo-text">{{ siteConfig.name }}</span>
      </RouterLink>

      <nav ref="navRef" class="header-nav" :class="{ open: mobileOpen }">
        <RouterLink to="/" class="nav-link" @mousedown="handleClick" @click="mobileOpen = false">Home</RouterLink>

        <!-- Categories dropdown — click to toggle -->
        <div class="nav-dropdown">
          <span class="nav-link cat-trigger" @mousedown="handleClick" @click="catDropdownOpen = !catDropdownOpen">
            Categories
            <span class="cat-arrow" :class="{ open: catDropdownOpen }">&#9662;</span>
          </span>
          <div class="dropdown-panel" v-show="catDropdownOpen">
            <RouterLink
              v-for="cat in categories"
              :key="cat.slug"
              :to="`/category/${cat.slug}`"
              class="dropdown-link"
              @mousedown="handleClick"
              @click="mobileOpen = false"
            >
              {{ cat.name }}
              <span class="dropdown-count">{{ cat.articleCount }}</span>
            </RouterLink>
            <div v-if="categories.length === 0" class="dropdown-empty">
              No categories yet
            </div>
          </div>
        </div>

        <span class="nav-link" @mousedown="handleClick" @click="searchOpen = true">Search</span>
        <RouterLink to="/about" class="nav-link" @mousedown="handleClick" @click="mobileOpen = false">About</RouterLink>
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
    <SearchModal :open="searchOpen" @close="searchOpen = false" />
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
  background: color-mix(in srgb, var(--color-bg) 80%, transparent);
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

/* ===== Logo ===== */
.header-logo {
  text-decoration: none;
  color: var(--color-text);
  will-change: transform;
}

.logo-text {
  display: inline-block;
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

/* ===== Nav ===== */
.header-nav {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-link {
  display: inline-block;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-textSecondary);
  text-decoration: none;
  padding: 6px 0;
  position: relative;
  will-change: transform;
  transition: color 0.25s ease;
}

/* Active indicator — thin geometric line that slides in */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--color-primary);
  transition: width 0.3s ease, left 0.3s ease;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
  left: 0;
}

.nav-link.router-link-exact-active {
  color: var(--color-text);
  font-weight: 400;
}

/* Categories trigger arrow */
.cat-trigger {
  cursor: pointer;
  user-select: none;
}

.cat-arrow {
  display: inline-block;
  margin-left: 4px;
  font-size: 0.6rem;
  vertical-align: middle;
  transition: transform 0.25s ease;
  color: var(--color-textMuted);
}

.cat-arrow.open {
  transform: rotate(180deg);
}

/* Click indicator — expanding diamond */
.click-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  margin-top: -4px;
  background: var(--color-primary);
  transform: rotate(45deg) scale(1);
  border-radius: 1px;
  pointer-events: none;
  z-index: 10;
  opacity: 1;
}

/* ===== Categories Dropdown ===== */
.nav-dropdown {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 12px 36px var(--color-glow);
  z-index: 150;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  letter-spacing: 0.03em;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.dropdown-link:hover {
  background: var(--color-surfaceHover);
}

.dropdown-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--color-textMuted);
}

.dropdown-empty {
  padding: 10px 14px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
}

/* ===== Actions ===== */
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

  .nav-link::after {
    display: none;
  }
}
</style>

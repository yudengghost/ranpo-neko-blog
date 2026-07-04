<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ColorSwitcher from '@/components/ui/ColorSwitcher.vue'
import { siteConfig } from '@/config'
import { useArticles } from '@/composables/useArticles'

const { getCategories } = useArticles()
const categories = getCategories()
const mobileOpen = ref(false)
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo">
        <span class="logo-text">{{ siteConfig.name }}</span>
      </RouterLink>

      <nav class="header-nav" :class="{ open: mobileOpen }">
        <RouterLink to="/" class="nav-link" @click="mobileOpen = false">Home</RouterLink>
        <RouterLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="nav-link"
          @click="mobileOpen = false"
        >
          {{ cat.name }}
        </RouterLink>
        <RouterLink to="/about" class="nav-link" @click="mobileOpen = false">About</RouterLink>
      </nav>

      <div class="header-actions">
        <ColorSwitcher />
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" :aria-label="mobileOpen ? 'Close menu' : 'Open menu'">
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

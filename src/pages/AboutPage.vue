<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import { siteConfig } from '@/config'
import { useStats } from '@/composables/useStats'

const { getTotalVisits } = useStats()
const totalVisits = getTotalVisits()

onMounted(() => {
  gsap.from('.about-title', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
  gsap.from('.about-line', {
    scaleX: 0,
    transformOrigin: 'center',
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.inOut',
  })
  gsap.from('.about-text', { y: 30, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' })
  gsap.from('.about-link', {
    y: 20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    delay: 0.6,
    ease: 'power3.out',
  })
})
</script>

<template>
  <div class="about-page">
    <div class="about-content">
      <h1 class="about-title">About</h1>
      <div class="about-line"></div>
      <div class="about-text">
        <p>Welcome to <em>{{ siteConfig.name }}</em>, a personal blog where design meets technology.</p>
        <p>
          This space is crafted with geometric aesthetics, fine-line British typography, and
          interactive canvas animations. Each article is a carefully composed piece, blending visual
          art with technical thought.
        </p>
        <p>
          Built with <strong>Vue 3</strong>, <strong>PixiJS</strong>, and <strong>GSAP</strong>.
          Deployed on GitHub Pages. A tribute to the beauty of geometry and the elegance of code.
        </p>
      </div>
      <div class="about-links">
        <a :href="siteConfig.github" target="_blank" rel="noopener" class="about-link">
          <span class="link-icon">&#8599;</span>
          GitHub
        </a>
      </div>

      <div class="about-stats">
        <div class="stats-item">
          <span class="stats-number">{{ totalVisits }}</span>
          <span class="stats-label">Total Visits</span>
        </div>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="about-decor">
      <div class="decor-square"></div>
      <div class="decor-circle"></div>
      <div class="decor-diamond"></div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 24px 100px;
  position: relative;
}

.about-content {
  position: relative;
  z-index: 1;
}

.about-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 300;
  font-style: italic;
  color: var(--color-text);
  margin-bottom: 20px;
  transition: color 0.6s ease;
}

.about-line {
  width: 60px;
  height: 2px;
  background: var(--color-primary);
  margin-bottom: 36px;
  border-radius: 1px;
  transition: background-color 0.6s ease;
}

.about-text {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 2;
  color: var(--color-textSecondary);
  transition: color 0.6s ease;
}

.about-text p {
  margin-bottom: 20px;
}

.about-text em {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--color-primary);
  transition: color 0.6s ease;
}

.about-text strong {
  font-weight: 400;
  color: var(--color-text);
  transition: color 0.6s ease;
}

.about-links {
  margin-top: 40px;
  display: flex;
  gap: 16px;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-text);
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
}

.about-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-surfaceHover);
}

.link-icon {
  font-size: 1rem;
}

.about-stats {
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid var(--color-borderLight);
  display: flex;
  gap: 40px;
  transition: border-color 0.6s ease;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stats-number {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 300;
  font-style: italic;
  color: var(--color-primary);
  transition: color 0.6s ease;
}

.stats-label {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-textMuted);
}

/* Decorative shapes */
.about-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-square {
  position: absolute;
  top: 60px;
  right: -40px;
  width: 120px;
  height: 120px;
  border: 1px solid var(--color-border);
  opacity: 0.3;
  transform: rotate(15deg);
  transition: border-color 0.6s ease;
}

.decor-circle {
  position: absolute;
  bottom: 120px;
  left: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px solid var(--color-borderLight);
  opacity: 0.2;
  transition: border-color 0.6s ease;
}

.decor-diamond {
  position: absolute;
  top: 40%;
  right: 20px;
  width: 80px;
  height: 80px;
  border: 1px solid var(--color-border);
  opacity: 0.2;
  transform: rotate(45deg);
  transition: border-color 0.6s ease;
}

@media (max-width: 640px) {
  .about-decor {
    display: none;
  }
}
</style>

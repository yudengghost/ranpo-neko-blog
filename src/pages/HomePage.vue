<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useArticles } from '@/composables/useArticles'
import { siteConfig } from '@/config'
import ArticleCard from '@/components/blog/ArticleCard.vue'
import type { ArticleMeta } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const { getHomeArticles } = useArticles()
const articles = getHomeArticles()
const featuredRef = ref<HTMLElement>()

onMounted(() => {
  // Hero entrance animation
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from('.hero-title', { y: 100, opacity: 0, duration: 1.4 })
    .from('.hero-line', { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, '-=0.8')
    .from('.hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.6')
    .from('.hero-scroll-hint', { opacity: 0, y: 10, duration: 0.6 }, '-=0.2')

  // Scroll reveal for cards
  if (featuredRef.value) {
    const cards = featuredRef.value.querySelectorAll('.article-card')
    cards.forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'power2.out',
      })
    })
  }
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ siteConfig.title }}</h1>
        <div class="hero-line"></div>
        <p class="hero-subtitle">{{ siteConfig.subtitle }}</p>
      </div>
      <div class="hero-decoration">
        <div class="hero-ring hero-ring-1"></div>
        <div class="hero-ring hero-ring-2"></div>
        <div class="hero-ring hero-ring-3"></div>
      </div>
      <div class="hero-scroll-hint">
        <span class="scroll-line"></span>
        <span class="scroll-text">Scroll</span>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="articles-section" ref="featuredRef">
      <div class="section-header">
        <h2 class="section-title">Featured</h2>
        <div class="section-line"></div>
      </div>

      <div v-if="articles.length > 0" class="articles-grid">
        <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
      </div>

      <div v-else class="articles-empty">
        <p class="empty-text">Coming soon...</p>
        <p class="empty-sub">Add articles to the <code>src/articles/home/</code> folder.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.8rem, 7vw, 5.5rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-bottom: 32px;
  transition: color 0.6s ease;
}

.hero-line {
  width: 80px;
  height: 2px;
  background: var(--color-primary);
  margin: 0 auto 32px;
  border-radius: 1px;
  transition: background-color 0.6s ease;
}

.hero-subtitle {
  font-family: 'Work Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 300;
  line-height: 1.8;
  letter-spacing: 0.04em;
  color: var(--color-textSecondary);
  transition: color 0.6s ease;
}

/* Hero decorative rings */
.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  transition: border-color 0.6s ease;
}

.hero-ring-1 {
  width: min(60vw, 500px);
  height: min(60vw, 500px);
  opacity: 0.3;
}

.hero-ring-2 {
  width: min(75vw, 650px);
  height: min(75vw, 650px);
  opacity: 0.2;
}

.hero-ring-3 {
  width: min(90vw, 800px);
  height: min(90vw, 800px);
  opacity: 0.1;
}

/* Scroll hint */
.hero-scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.scroll-line {
  width: 1px;
  height: 32px;
  background: var(--color-border);
  transition: background-color 0.6s ease;
}

.scroll-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-textMuted);
}

/* ===== Articles Section ===== */
.articles-section {
  padding: 40px 0 100px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--color-text);
  white-space: nowrap;
  transition: color 0.6s ease;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--color-borderLight);
  transition: background-color 0.6s ease;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

/* Empty state */
.articles-empty {
  text-align: center;
  padding: 80px 20px;
  border: 1px dashed var(--color-borderLight);
  border-radius: 16px;
  transition: border-color 0.6s ease;
}

.empty-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: var(--color-textMuted);
  margin-bottom: 8px;
}

.empty-sub {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-textMuted);
}

.empty-sub code {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: calc(100vh - 100px);
  }
}
</style>

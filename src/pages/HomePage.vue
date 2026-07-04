<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useArticles } from '@/composables/useArticles'
import { siteConfig } from '@/config'
import ArticleCard from '@/components/blog/ArticleCard.vue'

gsap.registerPlugin(ScrollTrigger)

const { getHomeArticles } = useArticles()
const articles = getHomeArticles()
const featuredRef = ref<HTMLElement>()
const subtitleRef = ref<HTMLElement>()

const subtitlePhrases = [
  siteConfig.subtitle,
  '以几何线条编织灵感空间',
  '在代码与设计的边界漫步',
  '每一像素都有它的诗意',
  '于克制之中见丰富',
]

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

let ctx: gsap.Context | null = null
let cancelled = false

onMounted(() => {
  cancelled = false
  ctx = gsap.context(() => {
    const CHAR_DURATION = 0.05
    const PAUSE_AFTER_TYPE_MS = 2500
    const PAUSE_AFTER_DELETE_MS = 300

    // Cursor blink
    const cursorTween = gsap.fromTo(
      '.hero-subtitle-cursor',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      },
    )

    // Animate textContent from startLen to endLen using text as source
    const animateText = (
      text: string,
      startLen: number,
      endLen: number,
      speedMul = 1,
    ): Promise<void> =>
      new Promise((resolve) => {
        const obj = { i: startLen }
        const len = Math.abs(endLen - startLen)
        gsap.to(obj, {
          i: endLen,
          duration: len * CHAR_DURATION * speedMul,
          ease: 'none',
          onUpdate() {
            if (subtitleRef.value) {
              subtitleRef.value.textContent = text.slice(0, Math.floor(obj.i))
            }
          },
          onComplete() {
            if (subtitleRef.value) subtitleRef.value.textContent = text.slice(0, endLen)
            resolve()
          },
        })
      })

    const typeText = (text: string) => animateText(text, 0, text.length)
    const deleteText = () => {
      const current = subtitleRef.value?.textContent || ''
      return animateText(current, current.length, 0, 0.6)
    }

    async function runLoop() {
      let idx = 0
      await delay(200)
      if (cancelled) return
      while (!cancelled) {
        await typeText(subtitlePhrases[idx] ?? subtitlePhrases[0]!)
        await delay(PAUSE_AFTER_TYPE_MS)
        if (cancelled) return
        await deleteText()
        await delay(PAUSE_AFTER_DELETE_MS)
        if (cancelled) return
        idx = (idx + 1) % subtitlePhrases.length
      }
    }

    // Main hero timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.hero-title', { y: 100, opacity: 0, duration: 1.4 })
      .from('.hero-line', { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, '-=0.8')
      .add(() => { runLoop() }, '-=0.6')
      .from('.hero-scroll-hint', { opacity: 0, y: 10, duration: 0.6 }, '-=0.2')

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
})

onUnmounted(() => {
  cancelled = true
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <div>
    <!-- Hero outside container for full-width background -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">{{ siteConfig.title }}</h1>
        <div class="hero-line"></div>
        <p class="hero-subtitle">
          <span ref="subtitleRef" class="hero-subtitle-text"></span>
          <span class="hero-subtitle-cursor">|</span>
        </p>
      </div>
      <div class="hero-scroll-hint">
        <span class="scroll-line"></span>
        <span class="scroll-text">Scroll</span>
      </div>
    </section>

    <!-- Content container -->
    <div class="home-page">
      <section class="articles-section" ref="featuredRef">
        <div class="section-header">
          <h2 class="section-title">Featured</h2>
          <div class="section-line"></div>
        </div>

        <div v-if="articles.length > 0" class="articles-list">
          <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
        </div>

        <div v-else class="articles-empty">
          <p class="empty-text">Coming soon...</p>
          <p class="empty-sub">Add articles to the <code>src/articles/home/</code> folder.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ===== Hero (full viewport width) ===== */
.hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: -40px;
  background-image: url('/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-bg) 20%, transparent) 0%,
    color-mix(in srgb, var(--color-bg) 50%, transparent) 50%,
    var(--color-bg) 100%
  );
  transition: background 0.6s ease;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  padding: 0 24px;
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
  text-shadow: 0 2px 40px var(--color-bg);
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

.hero-subtitle-cursor {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 200;
  color: var(--color-primary);
  opacity: 0;
  margin-left: 2px;
  transition: color 0.6s ease;
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

/* ===== Content Container ===== */
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

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

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  .hero {
    min-height: calc(100vh - 100px);
  }
}
</style>

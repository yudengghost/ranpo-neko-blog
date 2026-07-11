<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useArticles } from '@/composables/useArticles'
import { useSEO } from '@/composables/useSEO'
import { siteConfig } from '@/config'
import ArticleCard from '@/components/blog/ArticleCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

gsap.registerPlugin(ScrollTrigger)

const { getHomeArticles } = useArticles()
const articles = getHomeArticles()
const featuredRef = ref<HTMLElement>()

useSEO({
  title: siteConfig.title,
  description: siteConfig.description,
  type: 'website',
})
const subtitleRef = ref<HTMLElement>()

const subtitlePhrases = [
  siteConfig.subtitle,
  '个人向杂谈',
  '想玩好多好多菠萝干',
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

        <div v-else class="articles-skel">
          <SkeletonCard v-for="i in 2" :key="i" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - var(--header-height, 64px));
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
  -webkit-mask-image: linear-gradient(90deg,
      transparent 0%,
      black 15%,
      black 85%,
      transparent 100%);
  mask-image: linear-gradient(90deg,
      transparent 0%,
      black 15%,
      black 85%,
      transparent 100%);
  transition: opacity 0.6s ease;
}

[data-visual-style='brutalist'] .hero-bg,
[data-visual-style='retro-futurism'] .hero-bg {
  opacity: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      color-mix(in srgb, var(--color-bg) 20%, transparent) 0%,
      color-mix(in srgb, var(--color-bg) 50%, transparent) 50%,
      var(--color-bg) 100%);
  transition: background 0.6s ease;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  padding: 0 24px;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2.8rem, 7vw, 5.5rem);
  font-weight: var(--heading-weight, 300);
  font-style: italic;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-bottom: 32px;
  text-shadow: 0 2px 40px var(--color-bg);
  transition: color 0.6s ease, text-shadow 0.6s ease;
}

[data-visual-style='brutalist'] .hero-title {
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

[data-visual-style='retro-futurism'] .hero-title {
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-shadow: 0 0 20px var(--color-glow), 0 0 40px var(--color-glowSecondary);
}

.hero-line {
  width: 80px;
  height: var(--border-width, 2px);
  background: var(--color-primary);
  margin: 0 auto 32px;
  border-radius: 1px;
  transition: background-color 0.6s ease, box-shadow 0.6s ease;
}

[data-visual-style='brutalist'] .hero-line {
  height: 4px;
  width: 120px;
}

[data-visual-style='retro-futurism'] .hero-line {
  box-shadow: 0 0 8px var(--color-glow);
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 400;
  line-height: 1.8;
  letter-spacing: 0.04em;
  color: var(--color-textSecondary);
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .hero-subtitle {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-subtitle-cursor {
  font-family: var(--font-mono);
  font-weight: 400;
  color: var(--color-primary);
  opacity: 0;
  margin-left: 2px;
  transition: color 0.6s ease;
}

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
  width: var(--border-width, 1px);
  height: 32px;
  background: var(--color-border);
  transition: background-color 0.6s ease;
}

[data-visual-style='brutalist'] .scroll-line {
  width: 3px;
}

.scroll-text {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-textMuted);
}

.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.articles-section {
  padding: var(--section-padding, 40px 0 100px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: var(--heading-weight, 400);
  color: var(--color-text);
  white-space: nowrap;
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .section-title {
  font-weight: 700;
  text-transform: uppercase;
}

[data-visual-style='retro-futurism'] .section-title {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 8px var(--color-glow);
}

.section-line {
  flex: 1;
  height: var(--border-width, 1px);
  background: var(--color-borderLight);
  transition: background-color 0.6s ease;
}

[data-visual-style='brutalist'] .section-line {
  height: 4px;
  background: var(--color-border);
}

[data-visual-style='retro-futurism'] .section-line {
  box-shadow: 0 0 6px var(--color-glow);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.articles-skel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .hero {
    min-height: calc(100vh - 100px);
  }
}
</style>

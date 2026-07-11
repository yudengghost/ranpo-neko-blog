<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import { useArticles } from '@/composables/useArticles'
import { useStats } from '@/composables/useStats'
import { useSEO } from '@/composables/useSEO'
import ArticleRenderer from '@/components/blog/ArticleRenderer.vue'
import ArticleReactions from '@/components/blog/ArticleReactions.vue'
import CommentSection from '@/components/blog/CommentSection.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { getBySlug } = useArticles()
const { recordArticleView } = useStats()
const entry = computed(() => getBySlug(slug.value))
const meta = computed(() => entry.value?.meta)

watch(meta, (m) => {
  if (m) {
    useSEO({
      title: `${m.title} | RanpoNeko Blog`,
      description: m.excerpt,
      image: m.coverImage,
      type: 'article',
    })
  }
}, { immediate: true })

onMounted(() => {
  recordArticleView(slug.value)
  gsap.from('.article-header', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
  gsap.from('.article-body', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.out',
  })
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="article-page" v-if="meta">
    <!-- Cover Image -->
    <div class="article-cover" v-if="meta.coverImage">
      <img :src="meta.coverImage" :alt="meta.title" />
      <div class="cover-gradient"></div>
    </div>

    <!-- Header -->
    <header class="article-header">
      <RouterLink :to="`/category/${meta.category}`" class="back-link">&larr; Back</RouterLink>
      <div class="header-category">{{ meta.category }}</div>
      <h1 class="header-title">{{ meta.title }}</h1>
      <div class="header-meta">
        <time :datetime="meta.publishedAt">{{ formatDate(meta.publishedAt) }}</time>
        <span class="meta-sep">&middot;</span>
        <span>{{ meta.readingTime }} min read</span>
      </div>
      <div class="header-tags" v-if="meta.tags.length > 0">
        <span v-for="tag in meta.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </header>

    <!-- Article Body -->
    <section class="article-body">
      <ArticleRenderer :slug="slug" />
    </section>

    <!-- Reactions -->
    <ArticleReactions :slug="slug" />

    <!-- Divider -->
    <div class="article-divider"></div>

    <!-- Comments -->
    <CommentSection :articleSlug="slug" />
  </div>

  <!-- Not found -->
  <div v-else class="article-not-found">
    <h2>Article Not Found</h2>
    <RouterLink to="/">Return Home</RouterLink>
  </div>
</template>

<style scoped>
.article-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.article-cover {
  position: relative;
  width: 100%;
  max-height: 480px;
  overflow: hidden;
  border-radius: var(--radius-card, 16px);
  margin-bottom: 48px;
  margin-top: 20px;
  border: var(--border-width, 0) var(--border-style, solid) var(--card-border, transparent);
  transition: border-color 0.6s ease, border-radius 0.6s ease;
}

[data-visual-style='brutalist'] .article-cover {
  border-radius: 0;
  border-width: 4px;
}

[data-visual-style='retro-futurism'] .article-cover {
  border-radius: 4px;
  box-shadow: 0 0 15px var(--color-glow);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, var(--color-bg));
}

.article-header {
  max-width: 720px;
  margin: 0 auto 48px;
}

.back-link {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-textMuted);
  text-decoration: none;
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

[data-visual-style='brutalist'] .back-link {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.back-link:hover {
  color: var(--color-primary);
}

.header-category {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 12px;
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .header-category {
  font-weight: 700;
  letter-spacing: 0.1em;
}

.header-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--heading-weight, 400);
  line-height: 1.25;
  color: var(--color-text);
  margin-bottom: 16px;
  transition: color 0.6s ease, text-shadow 0.6s ease;
}

[data-visual-style='brutalist'] .header-title {
  font-weight: 700;
  text-transform: uppercase;
}

[data-visual-style='retro-futurism'] .header-title {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 12px var(--color-glow);
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-textMuted);
  margin-bottom: 20px;
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .header-meta {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.meta-sep {
  color: var(--color-border);
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 4px 10px;
  border: var(--border-width, 1px) var(--border-style, solid) var(--color-border);
  border-radius: 100px;
  color: var(--color-textSecondary);
  background: var(--color-bgAlt);
  transition: background-color 0.6s ease, border-color 0.6s ease, color 0.6s ease;
}

[data-visual-style='brutalist'] .tag {
  border-radius: 0;
  border-width: 2px;
  font-weight: 700;
  text-transform: uppercase;
}

[data-visual-style='retro-futurism'] .tag {
  border-radius: 3px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  box-shadow: 0 0 4px var(--color-glow);
}

.article-body {
  max-width: 720px;
  margin: 0 auto;
}

.article-divider {
  max-width: 720px;
  margin: 60px auto;
  height: var(--border-width, 1px);
  background: var(--color-borderLight);
  transition: background-color 0.6s ease;
}

[data-visual-style='brutalist'] .article-divider {
  height: 4px;
  background: var(--color-border);
}

[data-visual-style='retro-futurism'] .article-divider {
  box-shadow: 0 0 6px var(--color-glow);
}

.article-not-found {
  text-align: center;
  padding: 120px 20px;
}

.article-not-found h2 {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: var(--heading-weight, 400);
  color: var(--color-text);
  margin-bottom: 16px;
}

.article-not-found a {
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--color-primary);
}
</style>

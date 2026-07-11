<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useArticles } from '@/composables/useArticles'
import ArticleCard from '@/components/blog/ArticleCard.vue'

const route = useRoute()
const categorySlug = computed(() => route.params.slug as string)

const { getByCategory, getCategories } = useArticles()
const articles = computed(() => getByCategory(categorySlug.value))
const categoryInfo = computed(() => getCategories().find((c) => c.slug === categorySlug.value))
</script>

<template>
  <div class="category-page">
    <header class="category-header">
      <RouterLink to="/" class="back-link">&larr; Home</RouterLink>
      <h1 class="category-title">{{ categoryInfo?.name || categorySlug }}</h1>
      <p class="category-count">{{ articles.length }} article{{ articles.length !== 1 ? 's' : '' }}</p>
    </header>

    <div v-if="articles.length > 0" class="articles-list">
      <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
    </div>

    <div v-else class="category-empty">
      <p>No articles in this category yet.</p>
      <RouterLink to="/">Return Home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--section-padding, 40px 24px 100px);
}

.category-header {
  margin-bottom: 48px;
}

.back-link {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-textMuted);
  text-decoration: none;
  margin-bottom: 20px;
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

.category-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: var(--heading-weight, 400);
  color: var(--color-text);
  margin-bottom: 8px;
  text-transform: capitalize;
  transition: color 0.6s ease, text-shadow 0.6s ease;
}

[data-visual-style='brutalist'] .category-title {
  font-weight: 700;
  text-transform: uppercase;
}

[data-visual-style='retro-futurism'] .category-title {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px var(--color-glow);
}

.category-count {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--color-textMuted);
}

[data-visual-style='brutalist'] .category-count {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-empty {
  text-align: center;
  padding: 80px 20px;
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--color-textMuted);
}

[data-visual-style='brutalist'] .category-empty {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.category-empty a {
  display: inline-block;
  margin-top: 12px;
  color: var(--color-primary);
}

</style>

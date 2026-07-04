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

    <div v-if="articles.length > 0" class="articles-grid">
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
  padding: 40px 24px 100px;
}

.category-header {
  margin-bottom: 48px;
}

.back-link {
  display: inline-block;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-textMuted);
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: var(--color-primary);
}

.category-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: 8px;
  text-transform: capitalize;
  transition: color 0.6s ease;
}

.category-count {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  color: var(--color-textMuted);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

.category-empty {
  text-align: center;
  padding: 80px 20px;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  color: var(--color-textMuted);
}

.category-empty a {
  display: inline-block;
  margin-top: 12px;
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>

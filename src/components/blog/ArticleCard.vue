<script setup lang="ts">
import type { ArticleMeta } from '@/types'
import { RouterLink } from 'vue-router'

defineProps<{ article: ArticleMeta }>()
</script>

<template>
  <RouterLink :to="`/article/${article.slug}`" class="article-card">
    <div class="card-cover">
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
        loading="lazy"
      />
      <div v-else class="card-cover-placeholder">
        <span class="placeholder-icon">&#9670;</span>
      </div>
    </div>
    <div class="card-body">
      <span class="card-category">{{ article.category }}</span>
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-excerpt">{{ article.excerpt }}</p>
      <div class="card-meta">
        <time :datetime="article.publishedAt">{{
          new Date(article.publishedAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}</time>
        <span class="meta-dot">&middot;</span>
        <span>{{ article.readingTime }} min read</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.article-card {
  display: flex;
  flex-direction: row;
  border: 1px solid var(--color-borderLight);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease,
    background-color 0.6s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--color-glow);
  border-color: var(--color-primary);
}

/* Cover (left side) */
.card-cover {
  width: 320px;
  min-height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-bgAlt);
  transition: background-color 0.6s ease;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bgAlt);
}

.placeholder-icon {
  font-size: 2.5rem;
  color: var(--color-textMuted);
  transition: color 0.6s ease;
}

/* Body (right side) */
.card-body {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-category {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 10px;
  transition: color 0.6s ease;
  width: fit-content;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--color-text);
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

.article-card:hover .card-title {
  color: var(--color-primary);
}

.card-excerpt {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--color-textSecondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
  transition: color 0.6s ease;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--color-textMuted);
  transition: color 0.6s ease;
}

.meta-dot {
  color: var(--color-border);
}

@media (max-width: 700px) {
  .article-card {
    flex-direction: column;
  }

  .card-cover {
    width: 100%;
    min-height: 200px;
    max-height: 260px;
  }

  .card-body {
    padding: 20px 24px 24px;
  }
}
</style>

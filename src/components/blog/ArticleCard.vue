<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ArticleMeta } from '@/types'
import { RouterLink } from 'vue-router'
import { useStats } from '@/composables/useStats'

const props = defineProps<{ article: ArticleMeta }>()

const { getArticleStats } = useStats()
const views = ref(0)
const likes = ref(0)

onMounted(async () => {
  const s = await getArticleStats(props.article.slug)
  views.value = s.views
  likes.value = s.likes
})
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
        <span class="meta-dot">&middot;</span>
        <span>{{ views }} reads</span>
        <span class="meta-dot">&middot;</span>
        <span>&#9650; {{ likes }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.article-card {
  display: flex;
  flex-direction: row;
  border: var(--border-width, 1px) var(--border-style, solid) var(--card-border, var(--color-borderLight));
  border-radius: var(--radius-card, 16px);
  overflow: hidden;
  background: var(--card-bg, var(--color-surface));
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease,
    background-color 0.6s ease;
}

.article-card:hover {
  transform: var(--card-hover-transform, translateY(-2px));
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-primary);
}

[data-visual-style='brutalist'] .article-card:hover {
  transition: none;
}

.card-cover {
  width: 320px;
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-bgAlt);
  border-right: var(--border-width, 1px) var(--border-style, solid) var(--card-border, var(--color-borderLight));
  transition: background-color 0.6s ease;
}

[data-visual-style='brutalist'] .card-cover {
  border-right-width: 4px;
}

[data-visual-style='retro-futurism'] .card-cover {
  border-right: none;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.3s ease;
}

.article-card:hover .card-cover img {
  transform: scale(1.05);
}

[data-visual-style='brutalist'] .article-card:hover .card-cover img {
  transform: none;
  filter: contrast(1.1);
}

[data-visual-style='retro-futurism'] .article-card:hover .card-cover img {
  filter: saturate(1.3) contrast(1.1);
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

[data-visual-style='brutalist'] .placeholder-icon {
  font-size: 3rem;
}

[data-visual-style='retro-futurism'] .placeholder-icon {
  text-shadow: 0 0 10px var(--color-glow);
}

.card-body {
  flex: 1;
  padding: var(--card-padding, 28px 32px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-category {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 10px;
  transition: color 0.6s ease;
  width: fit-content;
  padding: 2px 6px;
}

[data-visual-style='brutalist'] .card-category {
  background: var(--color-primary);
  color: var(--color-bg);
  font-weight: 700;
  padding: 3px 8px;
}

[data-visual-style='retro-futurism'] .card-category {
  text-shadow: 0 0 6px var(--color-glow);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: var(--heading-weight, 500);
  line-height: 1.35;
  color: var(--color-text);
  margin-bottom: 10px;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.article-card:hover .card-title {
  color: var(--color-primary);
}

[data-visual-style='retro-futurism'] .card-title {
  letter-spacing: 0.02em;
}

[data-visual-style='retro-futurism'] .article-card:hover .card-title {
  text-shadow: 0 0 8px var(--color-glow);
}

.card-excerpt {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
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
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-textMuted);
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .card-meta {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
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
    aspect-ratio: 16 / 10;
    border-right: none;
    border-bottom: var(--border-width, 1px) var(--border-style, solid) var(--card-border, var(--color-borderLight));
  }

  [data-visual-style='brutalist'] .card-cover {
    border-bottom-width: 4px;
  }

  .card-body {
    padding: 20px 24px 24px;
  }
}
</style>

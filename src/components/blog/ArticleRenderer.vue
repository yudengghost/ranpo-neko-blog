<script setup lang="ts">
import { computed } from 'vue'
import { useArticles } from '@/composables/useArticles'

const props = defineProps<{ slug: string }>()
const { getBySlug } = useArticles()

const entry = computed(() => getBySlug(props.slug))
const ArticleComponent = computed(() => entry.value?.component || null)
</script>

<template>
  <div v-if="ArticleComponent" class="article-renderer">
    <component :is="ArticleComponent" />
  </div>
  <div v-else class="article-empty">
    <p>Article not found.</p>
  </div>
</template>

<style scoped>
.article-renderer {
  max-width: 720px;
  margin: 0 auto;
}

.article-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-textMuted);
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
}
</style>

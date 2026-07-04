<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticles } from '@/composables/useArticles'

const emit = defineEmits<{ close: [] }>()

const { getAll } = useArticles()
const allArticles = getAll()
const query = ref('')
const inputRef = ref<HTMLInputElement>()

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return allArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q),
  )
})

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('search-backdrop')) {
    emit('close')
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="search-backdrop" @click="onBackdrop" @keydown="onKeydown">
      <div class="search-modal">
        <div class="search-bar">
          <span class="search-icon">&#8981;</span>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search articles..."
            class="search-input"
          />
          <button class="search-close" @click="emit('close')">&times;</button>
        </div>

        <div class="search-results" v-if="query.trim()">
          <p class="results-count" v-if="results.length > 0">
            {{ results.length }} article{{ results.length !== 1 ? 's' : '' }} found
          </p>
          <p class="results-empty" v-else>No articles found.</p>

          <RouterLink
            v-for="article in results"
            :key="article.slug"
            :to="`/article/${article.slug}`"
            class="search-result-item"
            @click="emit('close')"
          >
            <span class="result-category">{{ article.category }}</span>
            <span class="result-title">{{ article.title }}</span>
            <span class="result-excerpt">{{ article.excerpt }}</span>
          </RouterLink>
        </div>

        <div class="search-hint" v-else>
          <p>Type to search through articles, tags, and categories.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: color-mix(in srgb, var(--color-bg) 70%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  padding-top: 14vh;
}

.search-modal {
  width: 100%;
  max-width: 600px;
  margin: 0 20px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.search-icon {
  font-size: 1.2rem;
  color: var(--color-textMuted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Work Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 300;
  color: var(--color-text);
  caret-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-textMuted);
}

.search-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: var(--color-textMuted);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.search-close:hover {
  color: var(--color-text);
}

.search-results {
  margin-top: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-borderLight);
  border-radius: 14px;
  overflow: hidden;
  overflow-y: auto;
  max-height: 50vh;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.results-count,
.results-empty {
  padding: 16px 20px 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
}

.search-result-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 20px;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background: var(--color-surfaceHover);
}

.result-category {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.result-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-text);
}

.result-excerpt {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-hint {
  margin-top: 12px;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-textMuted);
}
</style>

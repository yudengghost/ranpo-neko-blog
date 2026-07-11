<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticles } from '@/composables/useArticles'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { getAll } = useArticles()
const articles = getAll()
const query = ref('')
const page = ref(1)
const PER_PAGE = 5

const allResults = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() => Math.ceil(allResults.value.length / PER_PAGE))

const results = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return allResults.value.slice(start, start + PER_PAGE)
})

watch(query, () => {
  page.value = 1
})

function onClose() {
  query.value = ''
  page.value = 1
  emit('close')
}

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="modal-panel">
      <div class="modal-header">
        <span class="search-icon">&#8981;</span>
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search articles..."
          autofocus
        />
        <button class="modal-close" @click="onClose">&times;</button>
      </div>

      <div class="modal-results" v-if="query.trim()">
        <p class="results-count" v-if="allResults.length > 0">
          {{ allResults.length }} result{{ allResults.length !== 1 ? 's' : '' }} &middot;
          Page {{ page }} of {{ totalPages }}
        </p>

        <RouterLink
          v-for="article in results"
          :key="article.slug"
          :to="`/article/${article.slug}`"
          class="result-item"
          @click="onClose"
        >
          <span class="result-category">{{ article.category }}</span>
          <span class="result-title">{{ article.title }}</span>
          <span class="result-excerpt">{{ article.excerpt }}</span>
        </RouterLink>

        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="page <= 1" @click="prevPage">&larr; Prev</button>
          <span class="page-info">{{ page }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="nextPage">Next &rarr;</button>
        </div>

        <p v-if="allResults.length === 0" class="no-results">
          No articles found for "{{ query }}"
        </p>
      </div>

      <div v-else class="modal-hint">
        <p>Type to search by title, excerpt, or tag.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-panel {
  position: fixed;
  top: 15vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: 560px;
  max-width: 92vw;
  max-height: 72vh;
  display: flex;
  flex-direction: column;
  background: var(--card-bg, var(--color-surface));
  border: var(--border-width, 1px) var(--border-style, solid) var(--card-border, var(--color-border));
  border-radius: var(--radius-card, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-dropdown, 0 16px 48px rgba(0, 0, 0, 0.12));
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

[data-visual-style='retro-futurism'] .modal-panel {
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: var(--border-width, 1px) var(--border-style, solid) var(--color-borderLight);
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
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--color-text);
}

[data-visual-style='brutalist'] .search-input {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.search-input::placeholder {
  color: var(--color-textMuted);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--color-textMuted);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
}

.modal-results {
  overflow-y: auto;
  flex: 1;
}

.results-count {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-textMuted);
  padding: 12px 20px 4px;
}

[data-visual-style='brutalist'] .results-count {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 20px;
  text-decoration: none;
  border-bottom: var(--border-width, 1px) var(--border-style, solid) var(--color-borderLight);
  transition: background-color 0.2s ease;
}

[data-visual-style='brutalist'] .result-item {
  transition: none;
}

.result-item:hover {
  background: var(--color-surfaceHover);
}

[data-visual-style='brutalist'] .result-item:hover {
  background: var(--color-accent);
  color: var(--color-bg);
}

[data-visual-style='brutalist'] .result-item:hover .result-category,
[data-visual-style='brutalist'] .result-item:hover .result-title,
[data-visual-style='brutalist'] .result-item:hover .result-excerpt {
  color: var(--color-bg);
}

.result-category {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.result-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: var(--heading-weight, 500);
  color: var(--color-text);
}

[data-visual-style='retro-futurism'] .result-title {
  letter-spacing: 0.02em;
}

.result-excerpt {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--color-textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  padding: 32px 20px;
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--color-textMuted);
}

.modal-hint {
  padding: 32px 20px;
  text-align: center;
}

.modal-hint p {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-textMuted);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px;
  border-top: var(--border-width, 1px) var(--border-style, solid) var(--color-borderLight);
}

.page-btn {
  background: none;
  border: var(--border-width, 1px) var(--border-style, solid) var(--color-border);
  border-radius: var(--radius-btn, 8px);
  padding: 6px 14px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

[data-visual-style='brutalist'] .page-btn {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.page-info {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-textMuted);
}

.modal-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px) scale(0.97);
}
.modal-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px) scale(0.97);
}
</style>

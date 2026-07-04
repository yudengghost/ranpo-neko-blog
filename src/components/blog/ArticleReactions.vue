<script setup lang="ts">
import { ref } from 'vue'
import { useStats } from '@/composables/useStats'

const props = defineProps<{ slug: string }>()

const { getArticleStats, getUserReaction, toggleReaction } = useStats()

const stats = ref(getArticleStats(props.slug))
const userReaction = ref(getUserReaction(props.slug))

function onReact(type: 'like' | 'dislike') {
  userReaction.value = toggleReaction(props.slug, type)
  stats.value = getArticleStats(props.slug)
}
</script>

<template>
  <div class="article-reactions">
    <div class="reactions-row">
      <button
        class="reaction-btn"
        :class="{ active: userReaction === 'like' }"
        @click="onReact('like')"
        aria-label="Like"
      >
        <span class="reaction-icon">&#9650;</span>
        <span class="reaction-count">{{ stats.likes }}</span>
      </button>
      <button
        class="reaction-btn"
        :class="{ active: userReaction === 'dislike' }"
        @click="onReact('dislike')"
        aria-label="Dislike"
      >
        <span class="reaction-icon icon-down">&#9660;</span>
        <span class="reaction-count">{{ stats.dislikes }}</span>
      </button>
    </div>
    <p class="reactions-views">{{ stats.views }} view{{ stats.views !== 1 ? 's' : '' }}</p>
  </div>
</template>

<style scoped>
.article-reactions {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 0;
  text-align: center;
}

.reactions-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: 100px;
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.reaction-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.reaction-btn.active {
  border-color: var(--color-primary);
  background: var(--color-bgAlt);
}

.reaction-icon {
  font-size: 0.85rem;
  color: var(--color-textSecondary);
  transition: color 0.2s ease;
}

.reaction-btn.active .reaction-icon {
  color: var(--color-primary);
}

.icon-down {
  font-size: 0.7rem;
}

.reaction-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--color-textMuted);
  min-width: 16px;
  text-align: center;
}

.reactions-views {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--color-textMuted);
}
</style>

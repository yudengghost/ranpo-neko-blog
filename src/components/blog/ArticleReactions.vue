<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStats } from '@/composables/useStats'

const props = defineProps<{ slug: string }>()

const { stats, getUserReaction, toggleReaction } = useStats()

const userReaction = ref<'like' | 'dislike' | null>(getUserReaction(props.slug))

watch(() => props.slug, (s) => {
  userReaction.value = getUserReaction(s)
})

function onReact(type: 'like' | 'dislike') {
  userReaction.value = toggleReaction(props.slug, type)
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
        <span class="reaction-count">{{ stats.articles[slug]?.likes || 0 }}</span>
      </button>
      <button
        class="reaction-btn"
        :class="{ active: userReaction === 'dislike' }"
        @click="onReact('dislike')"
        aria-label="Dislike"
      >
        <span class="reaction-icon icon-down">&#9660;</span>
        <span class="reaction-count">{{ stats.articles[slug]?.dislikes || 0 }}</span>
      </button>
    </div>
    <p class="reactions-views">{{ stats.articles[slug]?.views || 0 }} view{{ (stats.articles[slug]?.views || 0) !== 1 ? 's' : '' }}</p>
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

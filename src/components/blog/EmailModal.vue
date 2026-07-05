<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEmails } from '@/composables/useEmails'
import MailIcon from '@/components/ui/MailIcon.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { getAll, getBySlug } = useEmails()
const emails = computed(() => getAll())
const selectedSlug = ref<string | null>(null)
const selected = computed(() =>
  selectedSlug.value ? getBySlug(selectedSlug.value) : null,
)
const readSet = ref<Set<string>>(new Set())

watch(
  () => props.open,
  (val) => {
    if (!val) {
      selectedSlug.value = null
    }
  },
)

function openEmail(slug: string) {
  selectedSlug.value = slug
  readSet.value.add(slug)
  nextTick(() => {
    const el = document.querySelector('.email-body-view')
    el?.scrollTo(0, 0)
  })
}

function backToList() {
  selectedSlug.value = null
}

function onOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('email-overlay')) {
    emit('close')
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const unreadCount = computed(() => emails.value.filter((e) => !readSet.value.has(e.slug)).length)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="email-overlay"
      @click="onOverlayClick"
      @keydown="onKeydown"
    >
      <div class="email-modal" role="dialog" aria-label="站内信">
        <!-- Header -->
        <div class="email-modal-header">
          <div class="email-modal-title">
            <MailIcon />
            <span>站内信</span>
            <span v-if="unreadCount > 0" class="email-unread-badge">{{ unreadCount }}</span>
          </div>
          <button class="email-close" @click="emit('close')" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" stroke-width="1.2" />
              <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" stroke-width="1.2" />
            </svg>
          </button>
        </div>

        <!-- Email list -->
        <div v-if="!selectedSlug" class="email-list">
          <div v-if="emails.length === 0" class="email-empty">
            暂无信件
          </div>
          <button
            v-for="email in emails"
            :key="email.slug"
            class="email-item"
            :class="{ unread: !readSet.has(email.slug) }"
            @click="openEmail(email.slug)"
          >
            <div class="email-item-header">
              <span class="email-item-from">{{ email.from }}</span>
              <span class="email-item-date">{{ formatDate(email.sentAt) }}</span>
            </div>
            <div class="email-item-subject">{{ email.subject }}</div>
            <div class="email-item-excerpt">{{ email.excerpt }}</div>
          </button>
        </div>

        <!-- Email reading view -->
        <div v-else class="email-body-view">
          <button class="email-back" @click="backToList">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="8,2 3,7 8,12" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            返回列表
          </button>
          <div class="email-body-meta">
            <div class="email-body-subject">{{ selected?.meta.subject }}</div>
            <div class="email-body-from">{{ selected?.meta.from }}</div>
            <div class="email-body-date">{{ formatDate(selected?.meta.sentAt ?? '') }}</div>
          </div>
          <div class="email-body-content">
            <component v-if="selected" :is="selected.component" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.email-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.email-modal {
  width: 560px;
  max-width: calc(100vw - 40px);
  max-height: 80vh;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px var(--color-glow);
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

/* ── Header ── */
.email-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-borderLight);
  flex-shrink: 0;
}

.email-modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  color: var(--color-text);
}

.email-unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 400;
  color: #fff;
  background: var(--color-primary);
}

.email-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-textMuted);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.email-close:hover {
  background: var(--color-surfaceHover);
  color: var(--color-text);
}

/* ── List ── */
.email-list {
  overflow-y: auto;
  flex: 1;
}

.email-empty {
  padding: 48px 24px;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--color-textMuted);
}

.email-item {
  display: block;
  width: 100%;
  padding: 18px 24px;
  border: none;
  border-bottom: 1px solid var(--color-borderLight);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.email-item:hover {
  background: var(--color-surfaceHover);
}

.email-item.unread {
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}

.email-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.email-item-from {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
}

.email-item.unread .email-item-from {
  color: var(--color-primary);
}

.email-item-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--color-textMuted);
}

.email-item-subject {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: 4px;
}

.email-item-excerpt {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--color-textMuted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Reading view ── */
.email-body-view {
  overflow-y: auto;
  flex: 1;
}

.email-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 16px 24px 0;
  padding: 6px 12px;
  border: 1px solid var(--color-borderLight);
  border-radius: 8px;
  background: transparent;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--color-textSecondary);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.email-back:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.email-body-meta {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-borderLight);
}

.email-body-subject {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 8px;
}

.email-body-from {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-textSecondary);
}

.email-body-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--color-textMuted);
  margin-top: 4px;
}

.email-body-content {
  padding: 20px 24px 32px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.85;
  color: var(--color-textSecondary);
}

.email-body-content :deep(p) {
  margin-bottom: 14px;
}
.email-body-content :deep(.signature) {
  margin-top: 28px;
  font-style: italic;
  color: var(--color-textMuted);
}
</style>

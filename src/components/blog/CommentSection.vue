<script setup lang="ts">
import { ref } from 'vue'
import { useComments } from '@/composables/useComments'

const props = defineProps<{ articleSlug: string }>()

const { comments, count, addComment, submitViaGitHub } = useComments(props.articleSlug)

const nickname = ref('')
const email = ref('')
const content = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)

function handleSubmit() {
  if (!nickname.value.trim() || !email.value.trim() || !content.value.trim()) return

  isSubmitting.value = true

  // Store locally
  addComment(nickname.value.trim(), email.value.trim(), content.value.trim())

  // Open GitHub issue for cross-user persistence
  submitViaGitHub(nickname.value.trim(), email.value.trim(), content.value.trim())

  submitted.value = true
  content.value = ''
  isSubmitting.value = false
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="comment-section">
    <h3 class="comment-heading">
      Comments
      <span class="comment-count" v-if="count > 0">{{ count }}</span>
    </h3>

    <!-- Comment list -->
    <div class="comment-list" v-if="comments.length > 0">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          {{ comment.nickname.charAt(0).toUpperCase() }}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ comment.nickname }}</span>
            <time class="comment-time" :datetime="comment.createdAt">{{ formatDate(comment.createdAt) }}</time>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="comment-empty">
      <p>No comments yet. Be the first to share your thoughts!</p>
    </div>

    <!-- Comment form -->
    <div class="comment-form" v-if="!submitted">
      <h4 class="form-heading">Leave a Comment</h4>
      <div class="form-row">
        <input
          v-model="nickname"
          type="text"
          placeholder="Nickname *"
          class="form-input"
          maxlength="30"
          required
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email *"
          class="form-input"
          maxlength="100"
          required
        />
      </div>
      <textarea
        v-model="content"
        placeholder="Write your comment... *"
        class="form-textarea"
        rows="4"
        maxlength="1000"
        required
      ></textarea>
      <button class="form-submit" @click="handleSubmit" :disabled="isSubmitting">
        Submit Comment
      </button>
      <p class="form-note">Comments are stored locally and submitted via GitHub Issues for cross-user visibility.</p>
    </div>

    <!-- Submitted state -->
    <div v-else class="comment-submitted">
      <p>Thank you! Your comment has been added.</p>
      <button class="form-submit form-submit--ghost" @click="submitted = false">Write another</button>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  max-width: 720px;
  margin: 60px auto 0;
}

.comment-heading {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: 32px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-borderLight);
  transition: color 0.6s ease, border-color 0.6s ease;
}

.comment-count {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-textMuted);
  margin-left: 8px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.comment-item {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-borderLight);
  border-radius: 12px;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bgAlt);
  color: var(--color-primary);
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-author {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.6s ease;
}

.comment-time {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--color-textMuted);
}

.comment-content {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.7;
  color: var(--color-textSecondary);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-textMuted);
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  border: 1px dashed var(--color-borderLight);
  border-radius: 12px;
  margin-bottom: 40px;
  transition: color 0.6s ease, border-color 0.6s ease;
}

.comment-form {
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-borderLight);
  border-radius: 16px;
}

.form-heading {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  outline: none;
  transition: border-color 0.3s ease, background-color 0.6s ease, color 0.6s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  margin-bottom: 14px;
}

.form-submit {
  padding: 10px 28px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.form-submit:hover {
  background: var(--color-primaryHover);
  transform: translateY(-1px);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-submit--ghost {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.form-submit--ghost:hover {
  background: var(--color-bgAlt);
}

.form-note {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 300;
  color: var(--color-textMuted);
  margin-top: 10px;
}

.comment-submitted {
  padding: 32px;
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-borderLight);
  border-radius: 16px;
  font-family: 'Work Sans', sans-serif;
  color: var(--color-textSecondary);
}

.comment-submitted p {
  margin-bottom: 14px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

import { ref, computed } from 'vue'
import type { Comment } from '@/types'

const STORAGE_PREFIX = 'blog-comments-'
const GITHUB_REPO_OWNER = 'yudengghost'
const GITHUB_REPO_NAME = 'ranpo-neko-blog'

function storageKey(articleSlug: string): string {
  return STORAGE_PREFIX + articleSlug
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function loadFromStorage(articleSlug: string): Comment[] {
  try {
    const raw = localStorage.getItem(storageKey(articleSlug))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(articleSlug: string, comments: Comment[]): void {
  try {
    localStorage.setItem(storageKey(articleSlug), JSON.stringify(comments))
  } catch {}
}

export function useComments(articleSlug: string) {
  const localComments = ref<Comment[]>(loadFromStorage(articleSlug))
  const isLoading = ref(false)

  const comments = computed(() => [...localComments.value])

  const count = computed(() => localComments.value.length)

  const addComment = (nickname: string, email: string, content: string): Comment => {
    const comment: Comment = {
      id: generateId(),
      articleSlug,
      nickname,
      email: email.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    localComments.value = [comment, ...localComments.value]
    saveToStorage(articleSlug, localComments.value)
    return comment
  }

  const submitViaGitHub = (nickname: string, email: string, content: string) => {
    const body = [
      `**Nickname:** ${nickname}`,
      `**Email:** ${email}`,
      ``,
      content,
      ``,
      `> Submitted from blog on ${new Date().toISOString()}`,
    ].join('\n')

    const title = encodeURIComponent(`Comment: ${articleSlug}`)
    const encodedBody = encodeURIComponent(body)
    const labels = encodeURIComponent('comment,blog')
    const url = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues/new?title=${title}&body=${encodedBody}&labels=${labels}`

    window.open(url, '_blank')
  }

  return {
    comments,
    count,
    isLoading,
    addComment,
    submitViaGitHub,
  }
}

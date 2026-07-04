import { ref, computed } from 'vue'
import type { Comment } from '@/types'
import { getSupabase } from '@/lib/supabase'

// localStorage fallback
const STORAGE_PREFIX = 'blog-comments-'

function storageKey(articleSlug: string): string { return STORAGE_PREFIX + articleSlug }

function lsLoad(articleSlug: string): Comment[] {
  try { const raw = localStorage.getItem(storageKey(articleSlug)); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function lsSave(articleSlug: string, comments: Comment[]) {
  try { localStorage.setItem(storageKey(articleSlug), JSON.stringify(comments)) } catch {}
}

export function useComments(articleSlug: string) {
  const supabase = getSupabase()
  const localComments = ref<Comment[]>([])
  const isLoading = ref(false)

  const comments = computed(() => [...localComments.value])
  const count = computed(() => localComments.value.length)

  const fetchComments = async () => {
    isLoading.value = true
    if (supabase) {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('article_slug', articleSlug)
        .order('created_at', { ascending: false })
      localComments.value = (data || []) as Comment[]
    } else {
      localComments.value = lsLoad(articleSlug)
    }
    isLoading.value = false
  }

  fetchComments()

  const addComment = async (nickname: string, email: string, content: string): Promise<Comment | null> => {
    const comment = {
      article_slug: articleSlug,
      nickname: nickname.trim(),
      email: email.trim(),
      content: content.trim(),
    }

    if (supabase) {
      const { data, error } = await supabase.from('comments').insert(comment).select().single()
      if (error || !data) return null
      localComments.value = [data as Comment, ...localComments.value]
      return data as Comment
    }

    const local: Comment = {
      ...comment,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      articleSlug,
      createdAt: new Date().toISOString(),
    }
    localComments.value = [local, ...localComments.value]
    lsSave(articleSlug, localComments.value)
    return local
  }

  return { comments, count, isLoading, addComment, fetchComments }
}

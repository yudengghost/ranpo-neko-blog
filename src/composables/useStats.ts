import { ref, computed } from 'vue'

const GITHUB_REPO = 'yudengghost/ranpo-neko-blog'
const STATS_URL = '/data/stats.json'
const PENDING_KEY = 'blog-pending-actions'
const LOCAL_CACHE_KEY = 'blog-stats-cache'

interface ArticleStats {
  views: number
  likes: number
  dislikes: number
}

interface RemoteStats {
  totalVisits: number
  articles: Record<string, ArticleStats>
}

interface PendingAction {
  action: string
  slug: string
  type?: string
}

const baseStats = ref<RemoteStats>({ totalVisits: 0, articles: {} })
let loaded = false
let loadPromise: Promise<void> | null = null

function loadPendingActions(): PendingAction[] {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') } catch { return [] }
}

function savePendingActions(actions: PendingAction[]) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(actions)) } catch {}
}

function mergePending(base: RemoteStats, pending: PendingAction[]): RemoteStats {
  const merged = JSON.parse(JSON.stringify(base)) as RemoteStats
  for (const act of pending) {
    const article = merged.articles[act.slug] || { views: 0, likes: 0, dislikes: 0 }
    merged.articles[act.slug] = article
    if (act.action === 'visit') {
      merged.totalVisits++
      article.views++
    } else if (act.action === 'react' && act.type) {
      article[act.type as 'likes' | 'dislikes']++
    } else if (act.action === 'unreact' && act.type) {
      const key = act.type as 'likes' | 'dislikes'
      article[key] = Math.max(0, article[key] - 1)
    }
  }
  return merged
}

function submitIssue(action: string, slug: string, type?: string) {
  const parts = [`action=${action}`, `slug=${slug}`]
  if (type) parts.push(`type=${type}`)
  const body = encodeURIComponent(parts.join('\n'))
  const title = encodeURIComponent(`stats: ${action} ${slug}`)
  window.open(
    `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}&labels=stats-update`,
    '_blank',
    'noopener,noreferrer',
  )
}

export function useStats() {
  const stats = computed(() => {
    const pending = loadPendingActions()
    return mergePending(baseStats.value, pending)
  })

  const ensureLoaded = async () => {
    if (loadPromise) return loadPromise
    loadPromise = (async () => {
      try {
        const res = await fetch(STATS_URL, { cache: 'no-cache' })
        if (res.ok) baseStats.value = await res.json()
        else throw new Error('fetch failed')
      } catch {
        try {
          const cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || 'null')
          if (cached) baseStats.value = cached
        } catch {}
      }
      try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(baseStats.value)) } catch {}
      loaded = true
    })()
    return loadPromise
  }

  const recordTotalVisit = () => {
    const pending = loadPendingActions()
    pending.push({ action: 'visit', slug: '' })
    savePendingActions(pending)
    submitIssue('visit', '')
  }

  const recordArticleView = (slug: string) => {
    const pending = loadPendingActions()
    if (pending.some((a) => a.action === 'visit' && a.slug === slug)) return
    pending.push({ action: 'visit', slug })
    savePendingActions(pending)
    submitIssue('visit', slug)
  }

  const getUserReaction = (_slug: string): 'like' | 'dislike' | null => {
    try {
      return (localStorage.getItem(`blog-reaction-${_slug}`) as 'like' | 'dislike') || null
    } catch {
      return null
    }
  }

  const toggleReaction = (slug: string, type: 'like' | 'dislike'): 'like' | 'dislike' | null => {
    const key = `blog-reaction-${slug}`
    const current = getUserReaction(slug)
    const pending = loadPendingActions()

    if (current === type) {
      localStorage.removeItem(key)
      pending.push({ action: 'unreact', slug, type })
      savePendingActions(pending)
      submitIssue('unreact', slug, type)
      return null
    }
    if (current) {
      pending.push({ action: 'unreact', slug, type: current })
    }
    localStorage.setItem(key, type)
    pending.push({ action: 'react', slug, type })
    savePendingActions(pending)
    submitIssue('react', slug, type)
    return type
  }

  return { stats, ensureLoaded, recordTotalVisit, recordArticleView, getUserReaction, toggleReaction }
}

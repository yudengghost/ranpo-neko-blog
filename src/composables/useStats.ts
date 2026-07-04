import { ref } from 'vue'
import { getSupabase } from '@/lib/supabase'

// ---- localStorage fallback ----
const ARTICLE_KEY = 'blog-article-stats'
const REACTIONS_KEY = 'blog-user-reactions'
const SESSION_KEY = 'blog-session-articles'
const USER_ID_KEY = 'blog-user-id'

function getUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return 'anon-' + Date.now().toString(36)
  }
}

interface ArticleStats {
  views: number
  likes: number
  dislikes: number
}

// ---- localStorage helpers (fallback) ----
function lsLoadAllStats(): Record<string, ArticleStats> {
  try { return JSON.parse(localStorage.getItem(ARTICLE_KEY) || '{}') } catch { return {} }
}
function lsSaveAllStats(stats: Record<string, ArticleStats>) {
  try { localStorage.setItem(ARTICLE_KEY, JSON.stringify(stats)) } catch {}
}
function lsLoadReactions(): Record<string, 'like' | 'dislike'> {
  try { return JSON.parse(localStorage.getItem(REACTIONS_KEY) || '{}') } catch { return {} }
}
function lsSaveReactions(r: Record<string, 'like' | 'dislike'>) {
  try { localStorage.setItem(REACTIONS_KEY, JSON.stringify(r)) } catch {}
}
function lsLoadSessionViews(): Set<string> {
  try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')) } catch { return new Set() }
}
function lsSaveSessionViews(views: Set<string>) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify([...views])) } catch {}
}

export function useStats() {
  const supabase = getSupabase()

  const recordTotalVisit = async () => {
    if (supabase) {
      await supabase.rpc('increment_total_visits')
    } else {
      try {
        const v = parseInt(localStorage.getItem('blog-total-visits') || '0', 10) || 0
        localStorage.setItem('blog-total-visits', String(v + 1))
      } catch {}
    }
  }

  const recordArticleView = async (slug: string) => {
    const sessionViews = lsLoadSessionViews()
    if (sessionViews.has(slug)) return
    sessionViews.add(slug)
    lsSaveSessionViews(sessionViews)

    if (supabase) {
      await supabase.rpc('increment_article_view', { article_slug: slug })
    } else {
      const stats = lsLoadAllStats()
      const current = stats[slug] || { views: 0, likes: 0, dislikes: 0 }
      stats[slug] = { ...current, views: current.views + 1 }
      lsSaveAllStats(stats)
    }
  }

  const getTotalVisits = async (): Promise<number> => {
    if (supabase) {
      const { data } = await supabase.from('site_stats').select('total_visits').eq('id', 1).single()
      return data?.total_visits || 0
    }
    try { return parseInt(localStorage.getItem('blog-total-visits') || '0', 10) || 0 } catch { return 0 }
  }

  const getArticleStats = async (slug: string): Promise<ArticleStats> => {
    if (supabase) {
      const { data } = await supabase.from('article_stats').select('*').eq('slug', slug).maybeSingle()
      return data ? { views: data.views, likes: data.likes, dislikes: data.dislikes } : { views: 0, likes: 0, dislikes: 0 }
    }
    return lsLoadAllStats()[slug] || { views: 0, likes: 0, dislikes: 0 }
  }

  const getUserReaction = async (slug: string): Promise<'like' | 'dislike' | null> => {
    const uid = getUserId()
    if (supabase) {
      const { data } = await supabase.from('article_reactions').select('reaction').eq('article_slug', slug).eq('user_id', uid).maybeSingle()
      return (data?.reaction as 'like' | 'dislike') || null
    }
    return lsLoadReactions()[slug] || null
  }

  const toggleReaction = async (slug: string, type: 'like' | 'dislike'): Promise<'like' | 'dislike' | null> => {
    const uid = getUserId()

    if (supabase) {
      const { data: existing } = await supabase.from('article_reactions').select('reaction').eq('article_slug', slug).eq('user_id', uid).maybeSingle()

      if (existing?.reaction === type) {
        // Undo
        await supabase.from('article_reactions').delete().eq('article_slug', slug).eq('user_id', uid)
      } else {
        // Upsert (remove old if switching)
        await supabase.from('article_reactions').upsert({ article_slug: slug, user_id: uid, reaction: type })
      }

      // Recalculate counts
      const { data: agg } = await supabase.rpc('recalc_article_reactions', { article_slug_param: slug })

      // Fetch updated reaction
      const { data: updated } = await supabase.from('article_reactions').select('reaction').eq('article_slug', slug).eq('user_id', uid).maybeSingle()
      return (updated?.reaction as 'like' | 'dislike') || null
    }

    // localStorage fallback
    const reactions = lsLoadReactions()
    const stats = lsLoadAllStats()
    const article = stats[slug] || { views: 0, likes: 0, dislikes: 0 }
    const current = reactions[slug]

    if (current === type) {
      delete reactions[slug]
      if (type === 'like') article.likes = Math.max(0, article.likes - 1)
      else article.dislikes = Math.max(0, article.dislikes - 1)
    } else {
      if (current === 'like') article.likes = Math.max(0, article.likes - 1)
      else if (current === 'dislike') article.dislikes = Math.max(0, article.dislikes - 1)
      reactions[slug] = type
      if (type === 'like') article.likes++
      else article.dislikes++
    }

    stats[slug] = article
    lsSaveReactions(reactions)
    lsSaveAllStats(stats)
    return reactions[slug] || null
  }

  return { recordTotalVisit, recordArticleView, getTotalVisits, getArticleStats, getUserReaction, toggleReaction }
}

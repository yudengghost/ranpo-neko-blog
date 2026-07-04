const TOTAL_KEY = 'blog-total-visits'
const ARTICLE_KEY = 'blog-article-stats'
const REACTIONS_KEY = 'blog-user-reactions'
const SESSION_KEY = 'blog-session-articles'

interface ArticleStats {
  views: number
  likes: number
  dislikes: number
}

function loadTotal(): number {
  try { return parseInt(localStorage.getItem(TOTAL_KEY) || '0', 10) || 0 } catch { return 0 }
}

function saveTotal(n: number) {
  try { localStorage.setItem(TOTAL_KEY, String(n)) } catch {}
}

function loadAllStats(): Record<string, ArticleStats> {
  try { return JSON.parse(localStorage.getItem(ARTICLE_KEY) || '{}') } catch { return {} }
}

function saveAllStats(stats: Record<string, ArticleStats>) {
  try { localStorage.setItem(ARTICLE_KEY, JSON.stringify(stats)) } catch {}
}

function loadReactions(): Record<string, 'like' | 'dislike' | null> {
  try { return JSON.parse(localStorage.getItem(REACTIONS_KEY) || '{}') } catch { return {} }
}

function saveReactions(r: Record<string, 'like' | 'dislike' | null>) {
  try { localStorage.setItem(REACTIONS_KEY, JSON.stringify(r)) } catch {}
}

function loadSessionViews(): Set<string> {
  try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')) } catch { return new Set() }
}

function saveSessionViews(views: Set<string>) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify([...views])) } catch {}
}

export function useStats() {
  const recordTotalVisit = () => {
    saveTotal(loadTotal() + 1)
  }

  const recordArticleView = (slug: string) => {
    const sessionViews = loadSessionViews()
    if (sessionViews.has(slug)) return
    sessionViews.add(slug)
    saveSessionViews(sessionViews)

    const stats = loadAllStats()
    const current = stats[slug] || { views: 0, likes: 0, dislikes: 0 }
    stats[slug] = { ...current, views: current.views + 1 }
    saveAllStats(stats)
  }

  const getTotalVisits = () => loadTotal()

  const getArticleStats = (slug: string): ArticleStats => {
    return loadAllStats()[slug] || { views: 0, likes: 0, dislikes: 0 }
  }

  const getUserReaction = (slug: string): 'like' | 'dislike' | null => {
    return loadReactions()[slug] ?? null
  }

  const toggleReaction = (slug: string, type: 'like' | 'dislike'): 'like' | 'dislike' | null => {
    const reactions = loadReactions()
    const stats = loadAllStats()
    const article = stats[slug] || { views: 0, likes: 0, dislikes: 0 }
    const current = reactions[slug]

    if (current === type) {
      // Undo reaction
      reactions[slug] = null
      if (type === 'like') article.likes = Math.max(0, article.likes - 1)
      else article.dislikes = Math.max(0, article.dislikes - 1)
    } else {
      // Remove old reaction if switching
      if (current === 'like') article.likes = Math.max(0, article.likes - 1)
      else if (current === 'dislike') article.dislikes = Math.max(0, article.dislikes - 1)
      // Add new
      reactions[slug] = type
      if (type === 'like') article.likes++
      else article.dislikes++
    }

    stats[slug] = article
    saveReactions(reactions)
    saveAllStats(stats)
    return reactions[slug]
  }

  return { recordTotalVisit, recordArticleView, getTotalVisits, getArticleStats, getUserReaction, toggleReaction }
}

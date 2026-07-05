import type { ArticleMeta, CategoryInfo } from '@/types'

const modules = import.meta.glob<{ meta: ArticleMeta; default: unknown }>(
  '@/articles/**/*.vue',
  { eager: true },
)

interface ArticleEntry {
  meta: ArticleMeta
  component: unknown
  path: string
}

const allArticles: ArticleEntry[] = []

for (const [path, mod] of Object.entries(modules)) {
  if (!mod.meta) continue

  const parts = path.split('/')
  // Extract full relative path from articles/ folder: e.g. "tech/frontend"
  const idx = parts.indexOf('articles')
  const folder = idx >= 0 ? parts.slice(idx + 1, -1).join('/') : 'uncategorized'
  const meta = mod.meta

  allArticles.push({
    meta: {
      ...meta,
      category: meta.category || folder,
    },
    component: mod.default,
    path,
  })
}

allArticles.sort(
  (a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime(),
)

export function useArticles() {
  const getAll = (): ArticleMeta[] => allArticles.map((a) => a.meta)

  const getBySlug = (slug: string): ArticleEntry | undefined =>
    allArticles.find((a) => a.meta.slug === slug)

  const getHomeArticles = (): ArticleMeta[] =>
    allArticles.filter((a) => a.meta.category === 'home').map((a) => a.meta)

  const getFeatured = (): ArticleMeta[] =>
    allArticles.filter((a) => a.meta.featured).map((a) => a.meta)

  const getByCategory = (catSlug: string): ArticleMeta[] =>
    allArticles.filter(
      (a) => a.meta.category === catSlug || a.meta.category.startsWith(catSlug + '/'),
    ).map((a) => a.meta)

  const getCategories = (): CategoryInfo[] => {
    const catMap = new Map<string, number>()
    for (const a of allArticles) {
      if (a.meta.category === 'home') continue
      // Also count direct articles in this category
      catMap.set(a.meta.category, (catMap.get(a.meta.category) || 0) + 1)
      // Count parent categories (e.g., "tech/frontend" → also counts under "tech")
      const segments = a.meta.category.split('/')
      for (let i = 1; i < segments.length; i++) {
        const parent = segments.slice(0, i).join('/')
        catMap.set(parent, (catMap.get(parent) || 0) + 1)
      }
    }
    return Array.from(catMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slug, count]) => {
        const segments = slug.split('/')
        const name = segments[segments.length - 1]!.charAt(0).toUpperCase() + segments[segments.length - 1]!.slice(1)
        return {
          slug,
          name,
          depth: segments.length - 1,
          articleCount: count,
        } as CategoryInfo
      })
  }

  return { getAll, getBySlug, getHomeArticles, getFeatured, getByCategory, getCategories }
}

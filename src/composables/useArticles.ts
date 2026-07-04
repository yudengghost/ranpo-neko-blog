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
  const folder = parts[parts.length - 2] ?? 'uncategorized'
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
    allArticles.filter((a) => a.meta.category === catSlug).map((a) => a.meta)

  const getCategories = (): CategoryInfo[] => {
    const catMap = new Map<string, number>()
    for (const a of allArticles) {
      if (a.meta.category === 'home') continue
      catMap.set(a.meta.category, (catMap.get(a.meta.category) || 0) + 1)
    }
    return Array.from(catMap.entries()).map(([slug, count]) => ({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      articleCount: count,
    }))
  }

  return { getAll, getBySlug, getHomeArticles, getFeatured, getByCategory, getCategories }
}

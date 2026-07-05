export type ArticleStatus = 'published' | 'draft' | 'archived'

export interface ArticleMeta {
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt?: string
  readingTime: number
  featured: boolean
  status?: ArticleStatus
}

export interface Comment {
  id: string
  articleSlug: string
  nickname: string
  email: string
  content: string
  createdAt: string
  avatar?: string
}

export interface CategoryInfo {
  slug: string
  name: string
  description?: string
  depth: number
  articleCount: number
}

export type ColorSchemeId = 'mint' | 'rose' | 'lavender' | 'sand' | 'sage' | 'ocean' | 'noir'

export interface ColorSchemeDef {
  id: ColorSchemeId
  name: string
  nameZh: string
  colors: {
    bg: string
    bgAlt: string
    surface: string
    surfaceHover: string
    text: string
    textSecondary: string
    textMuted: string
    primary: string
    primaryHover: string
    accent: string
    accentHover: string
    cursorColor: string
    border: string
    borderLight: string
    glow: string
    glowSecondary: string
  }
}

export interface NavItem {
  name: string
  path: string
}

export interface SiteConfig {
  name: string
  title: string
  subtitle: string
  description: string
  author: string
  github: string
  footerText: string
  navLinks: NavItem[]
}

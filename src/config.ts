import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'RanpoNeko',
  title: 'RanpoNeko Blog',
  subtitle: '漫步于几何线条之间的创意日志',
  description: '一个关于设计、技术和生活的个人博客，以几何美学构建灵感空间。',
  author: 'RanpoNeko',
  github: 'https://github.com/yudengghost',
  footerText: 'Built with Vue, PixiJS & GSAP',
  navLinks: [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/category/all' },
    { name: 'About', path: '/about' },
  ],
}

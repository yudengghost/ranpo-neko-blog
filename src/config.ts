import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'RanpoNeko',
  title: 'RanpoNeko Blog',
  subtitle: '乱步猫猫的杂谈博客',
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

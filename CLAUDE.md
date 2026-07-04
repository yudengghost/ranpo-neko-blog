# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static personal blog deployed on GitHub Pages, featuring an art-gallery aesthetic with geometric line design, British-style thin serif typography, and rich canvas/DOM animations. Built with Vue 3 + Vite + TypeScript.

**Live domain:** `blog.shadowgarden.top` (CNAME in `dist/`)

## Commands

```bash
npm run dev          # Start dev server (Vite HMR)
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
npm run type-check   # vue-tsc type checking only
npm run lint         # Oxlint + ESLint
npm run format       # Prettier
npm run test:unit    # Vitest unit tests
```

## Animation Rules (CRITICAL)

- **PixiJS v8**: All canvas-based animations, geometric backgrounds, particle systems, and continuous per-frame rendering. Uses WebGL via `Application` + `Graphics` API. Never use raw Canvas 2D.
- **GSAP v3**: All DOM animations — page transitions, scroll-triggered reveals, hero entrances, hover effects. Use `ScrollTrigger` for scroll-linked animations. Never use CSS `@keyframes` or `transition` for motion effects.
- **Separation of concerns**: PixiJS handles the canvas layer (background), GSAP handles the DOM layer (content). Do not use GSAP's PixiPlugin; animate PixiJS objects via the PixiJS ticker directly.

## Architecture

### Tech Stack
- Vue 3.5 (Composition API, `<script setup>`)
- Vite 8 with `@vitejs/plugin-vue`, `@tailwindcss/vite`
- Tailwind CSS v4 (no DaisyUI — removed)
- Vue Router v5 with `createWebHashHistory` (required for static hosting)
- PixiJS v8 (`pixi.js`) for WebGL canvas rendering
- GSAP v3 (`gsap` + `ScrollTrigger`) for DOM animation
- TypeScript ~6.0, ESLint + Oxlint + Prettier
- No backend — fully static JSON/localStorage data layer

### Path Alias
`@` → `./src` (configured in `vite.config.ts` and `tsconfig.app.json`)

### Article System

Articles are Vue SFC files under `src/articles/{category}/`. The folder structure **is** the category tree:
```
src/articles/
├── home/          → Articles displayed on landing page
├── tech/          → Category "tech"
├── art/           → Category "art"
└── ...
```

**Adding an article:** Create a `.vue` file with a `<script>` block that exports both `meta` and `export default`:

```vue
<script lang="ts">
import type { ArticleMeta } from '@/types'
export const meta: ArticleMeta = {
  slug: 'my-post', title: '...', excerpt: '...',
  category: 'tech', tags: [...], publishedAt: '...',
  readingTime: N, featured: false, coverImage: '/images/...',
}
export default { name: 'MyPostArticle' }
</script>
<template><article class="prose"><!-- content --></article></template>
```

**Discovering articles:** `src/composables/useArticles.ts` uses `import.meta.glob('@/articles/**/*.vue', { eager: true })` to auto-discover all article files at build time. No manual registration required.

### Color Scheme System

Six curated themes defined in `src/theme/colors.ts`, applied via `data-theme` attribute on `<html>`. CSS custom properties in `src/assets/base.css` define per-theme colors under `[data-theme='mint']`, `[data-theme='rose']`, etc. The `useTheme()` composable in `src/composables/useTheme.ts` manages switching and localStorage persistence. Color transitions are handled via `transition: background-color 0.6s ease` on themed elements.

Themes: Mint Cream (default), Dusty Rose, Lavender Mist, Warm Sand, Sage Green, Ocean Haze.

### Comment System

Comments persist locally via `localStorage` keyed by article slug (`src/composables/useComments.ts`). Cross-user visibility is bridged through GitHub Issues — the comment form opens a pre-filled issue URL when submitting. No server or API token required (fully static compatible).

### PixiJS Background

`src/components/ui/PixiBackground.vue` creates a full-viewport fixed canvas (`pointer-events: none`) that renders three layers:
1. Thin grid lines (80px spacing)
2. Diagonal accent lines at golden-ratio positions (slowly rotating)
3. Floating geometric particles (circles, diamonds, triangles) with mouse-repulsion behavior

The background uses `currentScheme` from `useTheme()` to redraw with the active theme's colors when the scheme changes.

### GSAP Usage Patterns

- **Page transitions**: `src/App.vue` uses `<transition name="page">` with CSS for the enter/leave, but the timeline sequencing within pages is GSAP-driven
- **Hero entrance**: `HomePage.vue` uses `gsap.timeline()` for staggered text reveal
- **Scroll reveals**: `HomePage.vue` uses `ScrollTrigger` with `toggleActions: 'play none none none'` for card entrance animations
- Always call `gsap.registerPlugin(ScrollTrigger)` in any component that uses scroll-linked animations
- Always clean up ScrollTrigger instances if creating them dynamically (not needed for one-time mount triggers)

### Route Structure
| Path | Component | Purpose |
|------|-----------|---------|
| `#/` | `HomePage.vue` | Landing page with hero + featured articles |
| `#/article/:slug` | `ArticlePage.vue` | Full article with cover, content, comments |
| `#/category/:slug` | `CategoryPage.vue` | Articles filtered by category |
| `#/about` | `AboutPage.vue` | About page |

### Image Assets

Images in `public/images/` are referenced as `/images/...` in code (no `public/` prefix in URL). Article cover images from Pexels are free to use (CC0).

## Key Files

| File | Role |
|------|------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/theme/colors.ts` | 6 color scheme definitions |
| `src/assets/base.css` | CSS reset, typography, theme variables |
| `src/composables/useArticles.ts` | `import.meta.glob` article discovery |
| `src/composables/useTheme.ts` | Theme state + localStorage persistence |
| `src/composables/useComments.ts` | Comment CRUD + GitHub Issues bridge |
| `src/config.ts` | Site metadata (name, nav, social links) |
| `public/images/hero-bg.jpg` | Full-viewport hero background |

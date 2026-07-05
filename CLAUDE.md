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

Articles are Vue SFC files under `src/articles/{category}/`. The folder structure **is** the category tree. Supports multi-level nesting:
```
src/articles/
├── home/              → Articles displayed on landing page
├── tech/              → Category "tech"
│   └── frontend/      → Category "tech/frontend"
├── art/               → Category "art"
│   ├── digital/       → Category "art/digital"
│   └── traditional/   → Category "art/traditional"
└── ...
```
Parent categories automatically aggregate counts from sub-categories. Category page shows all articles in that category and its descendants.

**Adding an article:** Create a `.vue` file with a `<script>` block that exports both `meta` and `export default`:

```vue
<script lang="ts">
import type { ArticleMeta } from '@/types'
export const meta: ArticleMeta = {
  slug: 'my-post', title: '...', excerpt: '...',
  category: 'tech', tags: [...], publishedAt: '...',
  readingTime: N, featured: false, status: 'published', coverImage: '/images/...',
}
export default { name: 'MyPostArticle' }
</script>
<template><article class="prose"><!-- content --></article></template>
```

**Slug uniqueness (CRITICAL):** Each article's `slug` must be unique across the entire project. Duplicate slugs will cause routing conflicts and corrupt Supabase stats/comments data (slug is the primary key in `article_stats` and a foreign key in `comments` and `article_reactions`). Before adding a new article, grep existing slugs: `grep -r "slug:" src/articles/`. Once published, do not change a slug unless you also run the corresponding SQL migration.

**Article status:** Set `status: 'draft'` or `status: 'archived'` to hide an article from all listings (home, categories, search). Non-published articles are still accessible via direct URL (`#/article/:slug`) for previewing. Omit the `status` field or set it to `'published'` for normal visibility. Supabase data (views, likes, comments) is preserved regardless of status.

**Discovering articles:** `src/composables/useArticles.ts` uses `import.meta.glob('@/articles/**/*.vue', { eager: true })` to auto-discover all article files at build time. No manual registration required.

### Color Scheme System

Seven curated themes defined in `src/theme/colors.ts`, applied via `data-theme` attribute on `<html>`. CSS custom properties in `src/assets/base.css` define per-theme colors under `[data-theme='mint']`, `[data-theme='rose']`, etc. The `useTheme()` composable in `src/composables/useTheme.ts` manages switching and localStorage persistence. Color transitions are handled via `transition: background-color 0.6s ease` on themed elements.

Themes: Mint Cream (default), Dusty Rose, Lavender Mist, Warm Sand, Sage Green, Ocean Haze, Noir Ink (dark).

### Comment System

Comments persist locally via `localStorage` keyed by article slug (`src/composables/useComments.ts`). Cross-user visibility is bridged through GitHub Issues — the comment form opens a pre-filled issue URL when submitting. No server or API token required (fully static compatible).

### PixiJS Background

`src/components/ui/PixiBackground.vue` creates a full-viewport fixed canvas (`pointer-events: none`) that renders three layers:
1. Thin grid lines (80px spacing)
2. Diagonal accent lines at golden-ratio positions (slowly rotating)
3. Floating geometric particles (circles, diamonds, triangles) with mouse-repulsion behavior

The background uses `currentScheme` from `useTheme()` to redraw with the active theme's colors when the scheme changes.

### GSAP Usage Patterns

- **`gsap.context()`**: Wrap all GSAP animations in `gsap.context(() => { ... })` in `onMounted`. Call `ctx.revert()` in `onUnmounted` to auto-kill all tweens, ScrollTriggers, and delayed calls. This is the standard cleanup pattern — see `HomePage.vue` for reference.
- **Page transitions**: `src/App.vue` uses `<transition name="page">` with CSS for the enter/leave.
- **Hero entrance**: `HomePage.vue` uses `gsap.timeline()` for staggered title reveal.
- **Typewriter subtitle**: `HomePage.vue` cycles through 5 phrases with type → pause → delete → next loop. Uses `gsap.to({ i: N })` with `onUpdate` to slice `textContent`, wrapped in Promises with a `cancelled` flag for safe unmount.
- **Scroll reveals**: `HomePage.vue` uses `ScrollTrigger` with `toggleActions: 'play none none none'` for card entrance animations.
- Always call `gsap.registerPlugin(ScrollTrigger)` in any component that uses scroll-linked animations.

### Spring Physics Navigation

`src/components/layout/AppHeader.vue` runs a real-time spring simulation on nav links via `requestAnimationFrame`:
- Each link is a mass-spring-damper system attracted to the mouse cursor position
- Center coordinates are cached in `initSprings()` and updated on window resize (avoid `getBoundingClientRect()` per frame).
- The RAF loop auto-suspends when all springs are at rest (`anyMoving` flag), restarts on `mousemove`.
- Click feedback injects a scale impulse (0.8) with negative velocity for overshoot bounce, plus a GSAP-animated diamond indicator.
- Categories dropdown toggles on click with a `▾` arrow; click-outside listener only registers when dropdown is open.

### Article Typography

Article prose styles are centralized in `src/assets/prose.css` (global, imported in `main.css`). Individual article SFCs should NOT duplicate `.prose` rules — use the shared stylesheet. Article-specific styles (e.g., `.article-figure`) stay scoped in the article file.

### Route Structure
| Path | Component | Purpose |
|------|-----------|---------|
| `#/` | `HomePage.vue` | Landing page with hero + featured articles |
| `#/article/:slug` | `ArticlePage.vue` | Full article with cover, content, comments |
| `#/category/:slug` | `CategoryPage.vue` | Articles filtered by category |
| `#/about` | `AboutPage.vue` | About page |

### Search

`src/components/blog/SearchModal.vue` is a fixed-position floating panel triggered by the "Search" nav item. Filters articles by title/excerpt/tags, paginated at 5 results per page. No overlay/backdrop — pure floating panel with `box-shadow`.

### Nav Structure

Header nav: **Home** | **Categories** (click dropdown, lists all dynamic categories with article counts) | **Search** (opens modal) | **About**

### Image Assets

Images in `public/images/` are referenced as `/images/...` in code (no `public/` prefix in URL). Article cover images from Pexels are free to use (CC0).

## Key Files

| File | Role |
|------|------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/theme/colors.ts` | 7 color scheme definitions (6 light + 1 dark) |
| `src/assets/base.css` | CSS reset, typography, 7 theme variable groups |
| `src/assets/prose.css` | Shared article typography (do not duplicate in article SFCs) |
| `src/composables/useArticles.ts` | `import.meta.glob` article auto-discovery |
| `src/composables/useTheme.ts` | Theme state + localStorage persistence |
| `src/composables/useComments.ts` | Comment CRUD + GitHub Issues bridge |
| `src/config.ts` | Site metadata (name, nav, social links) |
| `src/components/layout/AppHeader.vue` | Spring physics nav + categories dropdown + search trigger |
| `src/components/blog/SearchModal.vue` | Paginated article search floating panel |
| `src/components/ui/PixiBackground.vue` | WebGL geometric background (grid, lines, particles) |
| `public/images/hero-bg.jpg` | Full-viewport hero background |

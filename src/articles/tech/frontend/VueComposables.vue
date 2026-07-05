<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'vue-composables-patterns',
  title: 'Vue 3 Composable Patterns',
  excerpt:
    'From useMouse to useAsync — a deep dive into Vue 3 composable design patterns that keep your components clean and reusable.',
  category: 'tech/frontend',
  tags: ['vue', 'typescript', 'composables', 'frontend'],
  publishedAt: '2026-06-25',
  readingTime: 5,
  featured: false,
  coverImage: '/images/code-screen.jpg',
}

export default { name: 'VueComposablesArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      Vue 3's Composition API transformed how we write components. But the real power lies in composables — reusable functions that encapsulate stateful logic. After building this blog's animation system with several composables, here are the patterns that emerged.
    </p>

    <h2>The Anatomy of a Good Composable</h2>

    <p>
      A composable should do <strong>one thing well</strong>. It should be a pure function that takes inputs, manages internal state, and returns reactive values. Nothing more. The moment a composable starts doing two unrelated things, it should be split.
    </p>

    <h3>Single Responsibility</h3>

    <p>
      <code>useTheme()</code> manages color scheme switching. <code>useArticles()</code> discovers and filters articles. <code>useStats()</code> handles visit counts and reactions. Each is focused, testable, and independent. When I was tempted to merge <code>useStats</code> and <code>useArticles</code> into one "data layer", I reminded myself: small composables compose better than one big one.
    </p>

    <h2>State Ownership</h2>

    <p>
      The biggest mistake with composables is ambiguous state ownership. If two composables modify the same reactive object, debugging becomes a nightmare. The rule: <strong>each piece of state has exactly one composable that owns it</strong>.
    </p>

    <p>
      In this blog, <code>useTheme</code> owns <code>currentScheme</code>. <code>useStats</code> owns the stats cache. No composable reaches into another's state — they communicate through the returned API, like a microservice but for your UI.
    </p>

    <h2>Effect Cleanup</h2>

    <p>
      Every <code>addEventListener</code> needs a matching <code>removeEventListener</code>. Every GSAP tween needs to be killed. Every RAF needs <code>cancelAnimationFrame</code>. The spring physics system in the header is a good example — it tracks all active tweens in a <code>Set</code> and kills them in <code>onUnmounted</code>. Without this discipline, memory leaks are inevitable.
    </p>
  </article>
</template>

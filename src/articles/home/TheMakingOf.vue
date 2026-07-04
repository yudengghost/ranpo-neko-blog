<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'the-making-of',
  title: 'The Making of This Blog',
  excerpt:
    'A behind-the-scenes look at the technology stack, design decisions, and architecture of this geometric blog.',
  category: 'home',
  tags: ['design', 'architecture', 'vue', 'pixijs'],
  publishedAt: '2026-07-02',
  readingTime: 4,
  featured: true,
  coverImage: '/images/bauhaus-blue.jpg',
}

export default { name: 'TheMakingOfArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      Every personal project is a reflection of its creator's taste. This blog is no exception. Here is
      the story of how it was built &mdash; the technology choices, the design principles, and the
      small details that make it unique.
    </p>

    <h2>The Technical Foundation</h2>

    <p>
      At its core, the blog runs on <strong>Vue 3</strong> with TypeScript, bundled by
      <strong>Vite</strong>. The choice of Vue over React or Svelte was deliberate: Vue's single-file
      components elegantly encapsulate template, logic, and style in one place, which aligns perfectly
      with how articles are authored here.
    </p>

    <h3>Article System</h3>

    <p>
      Unlike traditional blogs that store articles as Markdown files, this one takes a different
      approach. Each article <em>is</em> a Vue component. The folder structure under
      <code>src/articles/</code> defines the category tree:
    </p>

    <ul>
      <li><code>home/</code> &mdash; Articles featured on the landing page</li>
      <li><code>tech/</code> &mdash; Technology and programming</li>
      <li><code>art/</code> &mdash; Design and visual arts</li>
    </ul>

    <p>
      Vite's <code>import.meta.glob</code> API automatically discovers all article files at build time,
      extracts their metadata, and maps them into the routing system. This means no manual
      configuration is needed when adding new articles &mdash; just drop a <code>.vue</code> file into
      the right folder.
    </p>

    <h2>The Visual Layer</h2>

    <p>
      <strong>PixiJS</strong> powers the animated geometric background. A WebGL canvas renders a grid
      of subtle lines, diagonal accent lines at golden-ratio positions, and floating geometric shapes
      (circles, diamonds, triangles) that respond subtly to mouse movement. The entire background runs
      at a smooth 60fps with minimal GPU overhead.
    </p>

    <p>
      <strong>GSAP</strong> handles all DOM-level animations: page transitions, hero entrance
      animations, and scroll-triggered card reveals. The combination of PixiJS for canvas rendering and
      GSAP for DOM animation gives us the best of both worlds.
    </p>

    <h2>Typography</h2>

    <p>
      The type system is built around two typefaces:
    </p>

    <ul>
      <li><strong>Playfair Display</strong> &mdash; A transitional serif inspired by 18th century British type design, used for headings and decorative text</li>
      <li><strong>Work Sans</strong> &mdash; A clean geometric sans-serif in thin weights (200&ndash;400), used for body text</li>
      <li><strong>JetBrains Mono</strong> &mdash; A developer-friendly monospace for code snippets and technical labels</li>
    </ul>

    <h2>Color Palette System</h2>

    <p>
      Six curated color schemes are available, each designed with a specific mood and aesthetic. They
      are implemented as CSS custom properties on the <code>data-theme</code> attribute, allowing
      instant switching without page reload. The transition between themes is animated with a 0.6s ease
      curve, creating a seamless color-shift experience.
    </p>

    <blockquote>
      Six palettes, one click away. Each tells a different story.
    </blockquote>
  </article>
</template>

<style scoped>
.prose {
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  line-height: 1.9;
  color: var(--color-textSecondary);
}

.prose h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 400;
  color: var(--color-text);
  margin-top: 48px;
  margin-bottom: 16px;
}

.prose h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text);
  margin-top: 36px;
  margin-bottom: 12px;
}

.prose p {
  margin-bottom: 18px;
}

.prose .lead {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
}

.prose em {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--color-primary);
}

.prose strong {
  font-weight: 400;
  color: var(--color-text);
}

.prose blockquote {
  border-left: 2px solid var(--color-primary);
  padding: 8px 0 8px 20px;
  margin: 32px 0;
  color: var(--color-text);
}

.prose ul {
  margin-bottom: 18px;
  padding-left: 20px;
}

.prose li {
  margin-bottom: 6px;
}

.prose code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  padding: 2px 6px;
  background: var(--color-bgAlt);
  border-radius: 4px;
  color: var(--color-primary);
}
</style>

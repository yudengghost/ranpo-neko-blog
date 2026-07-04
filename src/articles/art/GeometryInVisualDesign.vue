<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'geometry-in-visual-design',
  title: 'Geometry in Visual Design',
  excerpt:
    'How geometric principles, from Bauhaus to modern web design, shape the way we perceive and interact with visual interfaces.',
  category: 'art',
  tags: ['design', 'geometry', 'bauhaus', 'typography', 'visual-design'],
  publishedAt: '2026-06-10',
  readingTime: 4,
  featured: false,
}

export default { name: 'GeometryInVisualDesignArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      Geometry is the silent language of design. From the golden rectangles of ancient Greek
      architecture to the clean grids of modern web layouts, geometric principles underpin every
      visually pleasing composition. Understanding these principles elevates design from mere
      decoration to intentional craft.
    </p>

    <h2>The Bauhaus Legacy</h2>

    <p>
      The <strong>Bauhaus school</strong> (1919&ndash;1933) revolutionized design by reducing forms to
      their geometric essence. Circles, squares, and triangles became the building blocks of visual
      communication. The Bauhaus philosophy &mdash; that form should follow function &mdash; remains
      deeply relevant in digital product design today.
    </p>

    <p>
      Consider the geometric background of this blog. The grid represents order and structure. The
      diagonal lines suggest dynamic movement within that structure. The floating shapes
      &mdash; circles, diamonds, triangles &mdash; echo Bauhaus motifs while adding a layer of
      playful interaction.
    </p>

    <h2>The Golden Ratio in Digital Spaces</h2>

    <p>
      The golden ratio (&phi; &asymp; 1.618) appears throughout nature and has been used by artists
      and architects for millennia. In web design, it manifests in:
    </p>

    <ul>
      <li><strong>Layout proportions</strong> &mdash; Content-to-sidebar ratios, hero section heights</li>
      <li><strong>Typography scales</strong> &mdash; Font-size hierarchies that feel naturally balanced</li>
      <li><strong>Spacing systems</strong> &mdash; Padding and margin scales based on the Fibonacci sequence</li>
      <li><strong>Image aspect ratios</strong> &mdash; 3:2, 16:10, and other near-golden-ratio proportions</li>
    </ul>

    <h2>Grids and Alignment</h2>

    <p>
      A consistent grid is the backbone of visual design. It creates a rhythm that guides the eye
      and establishes hierarchy. The 8px grid system, popularized by Google's Material Design, is a
      prime example of how a simple geometric constraint can lead to more cohesive interfaces.
    </p>

    <p>
      But grids should not be prisons. The most interesting designs know when to break the grid
      &mdash; a strategic off-grid element draws attention and creates visual tension.
    </p>

    <h2>The Beauty of Restraint</h2>

    <p>
      Perhaps the most important geometric principle is restraint. A single line, placed with
      intention, can be more powerful than a hundred decorative elements. The thin, 1px lines in this
      blog's design are not an accident &mdash; they are a conscious choice to let the content breathe
      while maintaining structure.
    </p>

    <blockquote>
      "Simplicity is the ultimate sophistication."
      <cite>&mdash; Leonardo da Vinci</cite>
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

.prose blockquote cite {
  display: block;
  margin-top: 8px;
  font-size: 0.85rem;
  font-style: normal;
  color: var(--color-textMuted);
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

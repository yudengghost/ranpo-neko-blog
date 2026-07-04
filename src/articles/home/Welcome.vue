<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'welcome',
  title: 'Welcome to RanpoNeko Blog',
  excerpt:
    'A personal blog blending geometric aesthetics with creative writing, built with Vue, PixiJS & GSAP.',
  category: 'home',
  tags: ['welcome', 'introduction'],
  publishedAt: '2026-07-01',
  readingTime: 2,
  featured: true,
  coverImage: '/images/vintage-desk.jpg',
}

export default { name: 'WelcomeArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      This blog is a space where <em>design meets technology</em>. Every pixel, every line, and
      every animation is crafted with intention. The geometric patterns in the background, the
      fine-line British typography, and the smooth page transitions all work together to create a
      distinctive reading experience.
    </p>

    <h2>The Philosophy</h2>

    <p>
      Great design is not about decoration &mdash; it is about creating an environment where content
      can breathe. The geometric line art that dances across the background is not just visual noise;
      it represents the underlying structure and order that good design provides. Like the golden ratio
      in nature, these patterns remind us that beauty often follows mathematical principles.
    </p>

    <p>
      The <strong>Playfair Display</strong> typeface, with its delicate serifs and elegant italics, was
      inspired by 18th century British letterforms. Paired with the clean geometry of
      <strong>Work Sans</strong>, it creates a typographic harmony that feels both classic and
      contemporary.
    </p>

    <h2>What You Will Find Here</h2>

    <p>
      This blog explores the intersection of frontend engineering and visual design. Topics range from
      creative coding with technologies like PixiJS and GSAP, to broader reflections on design
      philosophy and the craft of building beautiful things for the web.
    </p>

    <blockquote>
      "The details are not the details. They make the design."
      <cite>&mdash; Charles Eames</cite>
    </blockquote>

    <p>
      Feel free to explore the articles, switch between the six curated color schemes using the palette
      button in the header, and leave your thoughts in the comments section of each article.
    </p>
  </article>
</template>

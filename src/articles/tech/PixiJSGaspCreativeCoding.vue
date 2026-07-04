<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'pixijs-gsap-creative-coding',
  title: 'Creative Coding with PixiJS and GSAP',
  excerpt:
    'Exploring the synergy between WebGL rendering and timeline-based animation for interactive web experiences.',
  category: 'tech',
  tags: ['pixijs', 'gsap', 'webgl', 'animation', 'creative-coding'],
  publishedAt: '2026-06-20',
  readingTime: 5,
  featured: false,
  coverImage: '/images/code-screen.jpg',
}

export default { name: 'PixiJSGaspCreativeCodingArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      WebGL has transformed what is possible in the browser. Combined with a robust animation library,
      the creative potential is enormous. This article explores the relationship between
      <strong>PixiJS</strong> and <strong>GSAP</strong> &mdash; two libraries that complement each
      other perfectly.
    </p>

    <h2>Why PixiJS and GSAP Together?</h2>

    <p>
      PixiJS excels at rendering high-performance 2D graphics on the GPU. It handles thousands of
      sprites, shapes, and particles with ease, thanks to its WebGL renderer. But PixiJS is a
      <em>rendering engine</em>, not an animation engine. Its built-in ticker is great for per-frame
      updates, but complex animation sequencing can become cumbersome.
    </p>

    <p>
      GSAP, on the other hand, is a <em>dedicated animation library</em>. It provides a rich timeline
      API, easing functions, stagger effects, and the powerful ScrollTrigger plugin. GSAP can animate
      any numeric property of any JavaScript object &mdash; including PixiJS display objects.
    </p>

    <h3>Rendering is not animation</h3>

    <p>
      A common misconception is that PixiJS includes animation capabilities. While its ticker allows
      per-frame updates, building complex choreographed animations requires managing timing, easing,
      and sequencing manually. GSAP fills this gap by providing:
    </p>

    <ul>
      <li><strong>Timeline sequencing</strong> &mdash; Chain, overlap, and stagger animations with precise control</li>
      <li><strong>Rich easing</strong> &mdash; Over 30 easing functions beyond the standard CSS curves</li>
      <li><strong>ScrollTrigger</strong> &mdash; Link animations to scroll position with pinning, scrubbing, and toggle actions</li>
      <li><strong>Plugin ecosystem</strong> &mdash; MorphSVG, SplitText, DrawSVG for specialized text and SVG effects</li>
    </ul>

    <h2>A Practical Example</h2>

    <p>
      Consider the geometric background on this blog. The grid and particle system are rendered by
      PixiJS, updating every frame via the PixiJS ticker. But the hero section entrance animation
      &mdash; the title sliding up, the accent line drawing itself, the subtitle fading in &mdash; is
      handled by GSAP. This separation of concerns is key:
    </p>

    <ul>
      <li><strong>PixiJS</strong> handles continuous, frame-by-frame rendering (the background)</li>
      <li><strong>GSAP</strong> handles discrete, timeline-based animations (page transitions, reveals, hover effects)</li>
    </ul>

    <h2>Performance Considerations</h2>

    <p>
      When using both libraries together, keep these principles in mind:
    </p>

    <ul>
      <li>Keep the PixiJS stage separate from GSAP-animated DOM elements to avoid layout thrashing</li>
      <li>Use GSAP to animate PixiJS objects directly when you need complex sequencing</li>
      <li>For simple per-frame updates (particles, scrolling textures), stick with the PixiJS ticker</li>
      <li>Always clean up ScrollTrigger instances and PixiJS applications on component unmount</li>
    </ul>

    <blockquote>
      PixiJS paints the canvas. GSAP conducts the orchestra. Together, they create a symphony.
    </blockquote>
  </article>
</template>

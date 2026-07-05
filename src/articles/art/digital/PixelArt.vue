<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'pixel-art-renaissance',
  title: '像素艺术的数字复兴',
  excerpt:
    '在 4K 时代，像素艺术不仅没有消亡，反而成为独立游戏和数字艺术中最具辨识度的视觉语言。',
  category: 'art/digital',
  tags: ['pixel-art', '游戏设计', '数字艺术', '复古'],
  publishedAt: '2026-05-15',
  readingTime: 4,
  featured: false,
  coverImage: '/images/geometric-abstract.jpg',
}

export default { name: 'PixelArtArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      当屏幕分辨率以指数增长，当显卡能渲染数亿多边形，为什么像素艺术依然活跃在独立游戏和数字创作的最前沿？答案在于一种被低估的美学力量——限制。
    </p>

    <h2>像素不是缺陷，是选择</h2>

    <p>
      像素艺术不是技术落后的妥协。20 世纪 80 年代的开发者受限于硬件，但在那些 8×8 或 16×16 的精灵图中，诞生了一种独特的视觉语言。今天，《Celeste》、《Stardew Valley》、《Terraria》等独立游戏用像素风格证明了：<strong>低分辨率反而放大了想象力</strong>。
    </p>

    <h2>几何与像素的共鸣</h2>

    <p>
        像素艺术的本质是几何的。每个像素是一个矩形，每幅画面是一个网格。这与现代设计中的网格系统、Design Token、模块化组件有着惊人的共鸣。当你用 16×16 的像素画布设计一个角色时，每一格都影响着整体——就像每个 CSS 属性都参与着最终的视觉呈现。
    </p>

    <h2>有限中的无限</h2>

    <p>
      最伟大的像素艺术家能在最少的色板中找到无限的表达。16 色、32 色、甚至只有 4 种灰度——限制迫使创作者专注于构图、对比和叙事，而不是技术堆砌。这和极简主义设计共享同一种哲学：<strong>删减到本质，剩下的才真正重要</strong>。
    </p>
  </article>
</template>

<script lang="ts">
import type { ArticleMeta } from '@/types'

export const meta: ArticleMeta = {
  slug: 'eastern-aesthetics-geometric-design',
  title: '东方留白 —— 当几何设计遇见东方美学',
  excerpt:
    '探索东方传统美学中的留白、对称与自然法则，如何与当代几何极简设计产生共鸣。从水墨画到枯山水，再到现代 UI 设计，一脉相承的克制之美。',
  category: 'art',
  tags: ['东方美学', '几何设计', '留白', '禅意', '极简主义', 'design'],
  publishedAt: '2026-07-05',
  readingTime: 6,
  featured: false,
  coverImage: '/images/calligraphy.jpg',
}

export default { name: 'EasternAestheticsArticle' }
</script>

<template>
  <article class="prose">
    <p class="lead">
      在西方极简主义席卷全球设计界之前，东方早已将"少即是多"刻入文化基因。水墨画中的大片留白、枯山水中的砂纹几何、书法中的一笔千钧——这些古老的东方美学原则，与当代几何设计语言有着惊人的共鸣。这不是巧合，而是一种跨越时空的审美回归。
    </p>

    <h2>留白的几何学</h2>

    <p>
      南宋画家马远的《寒江独钓图》，一叶扁舟独占画面一隅，其余皆为空白。这"空白"并非虚无——它是水、是天、是一切未言明却可感知的存在。在现代设计语境中，这种留白被翻译为
      <strong>Negative Space</strong>（负空间）。
    </p>

    <p>
      几何设计讲究线条与块面的精确关系。一条 1px 的细线、一个 80px 的网格间距、一组基于黄金比例的分割——它们构成的是秩序。而留白，恰恰是秩序得以呼吸的介质。没有足够的留白，几何线条不过是拥挤的噪音；有了留白，每一条线都能被看见、被感知、被赋予意义。
    </p>

    <figure class="article-figure">
      <img src="/images/zen-garden.jpg" alt="Japanese zen garden with traditional house" loading="lazy" />
      <figcaption>枯山水的砂纹与石组，是最早的几何极简设计。</figcaption>
    </figure>

    <h2>枯山水中的几何哲学</h2>

    <p>
        京都龙安寺的方丈庭园，十五块石头被分成五组，安置在白色砂砾之上。无论从哪个角度，你都只能同时看到十四块。砂纹以石头为中心辐射出同心圆，宛如水面涟漪——这是用最纯粹的形式（点、线、面）来描摹自然。
    </p>

    <p>
        这种表达方式与 Bauhaus 的基础课程何其相似：Kandinsky 在《点线面》中论述的正是同样的几何元素。区别在于，枯山水比 Bauhaus 早了五百年，且目的不同——枯山水的几何不是为了分析形式，而是为了<strong>抵达禅意</strong>。
    </p>

    <p>
        今天的 UI 设计师在构建 Design System 时，本质上也在做类似的事：将复杂的世界归纳为有限的 Token（色彩、间距、圆角、阴影），然后用这些 Token 搭建出千变万化的界面。这是几何的工业化，也是几何的诗意化——取决于你如何对待它。
    </p>

    <h2>书法：一笔定乾坤</h2>

    <p>
        中国书法中的"永字八法"，用一个字涵盖了八种基本笔画。每种笔画的起笔、行笔、收笔都有严格的几何规律。然而当王羲之写下《兰亭序》时，每一个"之"字都各不相同——它们在规则之内找到了自由。
    </p>

    <p>
        这让我想起 Frontend 开发中的 <strong>Design Token</strong> 与 <strong>Component Variant</strong> 的关系。设计系统定义了 Button 的基础形态（padding、border-radius、font-size），但 Button 可以是 primary、secondary、ghost、danger……基础规则不变，变化在规则的缝隙中生长。
    </p>

    <h2>不对称中的平衡</h2>

    <p>
        西方古典设计强调对称——建筑立面左右镜像，花园呈几何对称，字体也追求严格的比例关系。东方美学则不然。日本茶室的"躙口"（入口）偏于一隅，壁龛中的挂轴不居中，花入（花瓶）与香合的摆放遵循的是"七五三"而非等分。
    </p>

    <p>
        这种不对称的平衡在现代 Web 设计中格外重要。Hero Section 中标题偏左、装饰元素在右下方、视觉重心看似偏离实则通过留白拉回——这就是东方不对称美学的数字转译。
    </p>

    <h2>从水墨到暗色模式</h2>

    <p>
        水墨画只有黑白灰，却能表现万物。墨分五色——焦、浓、重、淡、清——每个层次都有独立的表达力。这与现代 UI 的暗色模式（Dark Mode）设计中使用的灰度层级如出一辙：不是用纯黑和纯白，而是精心挑选 8-12 个灰度阶层，构建出有质感、有深度的暗色界面。
    </p>

    <p>
        这个博客的六套配色方案，每一套都在做同样的事：用一个主色、一个辅色、若干个中性灰度，构建一个完整的色彩宇宙。换一套配色，就如同换了一卷画轴——骨架不变，气韵已改。
    </p>

    <h2>结语：古老的新鲜</h2>

    <p>
        东方美学不是博物馆里的标本。它的核心原则——留白、克制、不对称平衡、在约束中寻找自由——恰恰是当代设计的最高追求。我们不是在复古，而是在用今天的技术（PixiJS 的几何线条、GSAP 的流畅动效、CSS 的精确布局）重新诠释那些跨越千年的美学直觉。
    </p>

    <blockquote>
      "大音希声，大象无形。"
      <cite>—— 《道德经》</cite>
    </blockquote>
  </article>
</template>

<style scoped>
.prose {
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  line-height: 2;
  color: var(--color-textSecondary);
}

.prose h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 400;
  color: var(--color-text);
  margin-top: 52px;
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
  margin-bottom: 20px;
}

.prose .lead {
  font-size: 1.1rem;
  line-height: 1.9;
  color: var(--color-text);
}

.prose em {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--color-primary);
}

.prose strong {
  font-weight: 500;
  color: var(--color-text);
}

.prose blockquote {
  border-left: 2px solid var(--color-primary);
  padding: 10px 0 10px 20px;
  margin: 36px 0;
  color: var(--color-text);
  font-size: 1.05rem;
}

.prose blockquote cite {
  display: block;
  margin-top: 10px;
  font-size: 0.85rem;
  font-style: normal;
  color: var(--color-textMuted);
}

.prose ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

.prose li {
  margin-bottom: 8px;
}

.prose code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  padding: 2px 6px;
  background: var(--color-bgAlt);
  border-radius: 4px;
  color: var(--color-primary);
}

/* Content figure */
.article-figure {
  margin: 36px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-borderLight);
  transition: border-color 0.6s ease;
}

.article-figure img {
  width: 100%;
  display: block;
}

.article-figure figcaption {
  padding: 12px 16px;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
  background: var(--color-bgAlt);
  text-align: center;
  transition: background-color 0.6s ease, color 0.6s ease;
}
</style>

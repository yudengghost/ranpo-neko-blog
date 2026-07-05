<script lang="ts">
import type { EmailMeta } from '@/types'

export const meta: EmailMeta = {
  slug: 'welcome-to-ranponeko',
  subject: '欢迎来到 RanpoNeko Blog',
  from: 'RanpoNeko 站长',
  sentAt: '2026-07-06',
  excerpt: '一封来自站长的欢迎信，介绍这个博客的创建初衷与设计理念。',
  tags: ['welcome'],
}

export default { name: 'WelcomeEmail' }
</script>

<template>
  <p>亲爱的访客，</p>

  <p>
    欢迎来到 <strong>RanpoNeko Blog</strong> —— 一个漫步于几何线条与创意代码之间的个人空间。
  </p>

  <p>
    这个博客的核心理念很简单：<strong>让内容呼吸，让设计说话</strong>。背景中缓慢旋转的几何线条、
    Playfair Display 的纤细衬线、七套精心挑选的配色方案 —— 每一个细节都不是装饰，而是为了创造
    一种安静而专注的阅读氛围。
  </p>

  <p>
    在这里你会找到关于软件工程、视觉设计、创意编程的文章，偶尔也会有一些
    关于艺术、动画和游戏的闲聊。随意探索，切换配色方案，留下评论。
  </p>

  <p>
    如果有任何想法或建议，欢迎通过评论区或 GitHub Issues(about 页面有GitHub链接) 与我交流。
  </p>
  <hr>
  <p>
    好吧，上面的内容是AI生成的，看看效果，这个网站主要就是用来记录一些随笔了，反正应该什么都有，
    想到什么写什么吧，不过有任何建议都可以提issue，我建站主要也是为了学习，以及<del>互联网寻伯乐(bushi)</del>，
    如果有什么想要分享的东西也可以联系我！非常乐意♪(´▽｀)
  </p>

  <p class="signature">
    — 站长 RanpoNeko<br />
    2026 年 7 月
  </p>
</template>

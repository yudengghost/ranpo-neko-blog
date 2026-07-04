import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/article/:slug',
      name: 'article',
      component: () => import('@/pages/ArticlePage.vue'),
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: () => import('@/pages/CategoryPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/AboutPage.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

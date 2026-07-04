<script setup lang="ts">
import PixiBackground from '@/components/ui/PixiBackground.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <div class="app-shell">
    <PixiBackground />
    <AppHeader />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.6s ease, color 0.6s ease;
}

.app-main {
  flex: 1;
  position: relative;
  z-index: 1;
  padding-top: 64px;
}
</style>

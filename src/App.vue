<script setup lang="ts">
import { ref } from 'vue'
import PixiBackground from '@/components/ui/PixiBackground.vue'
import LoadingScreen from '@/components/ui/LoadingScreen.vue'
import CustomCursor from '@/components/ui/CustomCursor.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useTheme } from '@/composables/useTheme'
import { useStats } from '@/composables/useStats'

useTheme()

const showLoader = ref(true)

const SESSION_FLAG = 'blog-visit-recorded'
if (!sessionStorage.getItem(SESSION_FLAG)) {
  sessionStorage.setItem(SESSION_FLAG, '1')
  useStats().recordTotalVisit()
}
</script>

<template>
  <LoadingScreen v-if="showLoader" @done="showLoader = false" />
  <div class="app-shell" v-show="!showLoader">
    <PixiBackground />
    <CustomCursor />
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

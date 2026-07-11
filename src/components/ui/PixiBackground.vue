<script setup lang="ts">
import { ref, computed, watch, onMounted, type Component } from 'vue'
import { gsap } from 'gsap'
import { useVisualStyle } from '@/composables/useVisualStyle'
import GeometricBackground from '@/components/backgrounds/GeometricBackground.vue'
import BrutalistBackground from '@/components/backgrounds/BrutalistBackground.vue'
import RetroFuturismBackground from '@/components/backgrounds/RetroFuturismBackground.vue'
import type { VisualStyleId } from '@/types'

const { currentStyle } = useVisualStyle()
const containerRef = ref<HTMLDivElement>()

const styleComponents: Record<VisualStyleId, Component> = {
  geometric: GeometricBackground,
  brutalist: BrutalistBackground,
  'retro-futurism': RetroFuturismBackground,
}

const currentComp = computed(() => styleComponents[currentStyle.value])
const key = ref(0)
const bgOpacity = ref(1)

watch(currentStyle, () => {
  if (!containerRef.value) return
  gsap.to(bgOpacity, {
    value: 0,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => {
      key.value++
      gsap.to(bgOpacity, {
        value: 1,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.1,
      })
    },
  })
})

onMounted(() => {
  bgOpacity.value = 1
})
</script>

<template>
  <div ref="containerRef" class="pixi-bg" :style="{ opacity: bgOpacity }">
    <component :is="currentComp" :key="key" />
  </div>
</template>

<style scoped>
.pixi-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>

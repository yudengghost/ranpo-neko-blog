<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const circleRef = ref<SVGCircleElement>()
const visible = ref(false)
const circumference = 2 * Math.PI * 16

function scrollToTop() {
  gsap.to(window, { scrollTo: { y: 0 }, duration: 0.8, ease: 'power3.inOut' })
}

let ticking = false

function updateProgress() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const p = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
  visible.value = p > 0.03
  if (circleRef.value) {
    circleRef.value.style.strokeDashoffset = String(circumference * (1 - p))
  }
  ticking = false
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(updateProgress)
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="scroll-ind">
    <div v-if="visible" class="scroll-indicator" @click="scrollToTop" title="Back to top">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke="var(--color-border)"
          stroke-width="1"
        />
        <circle
          ref="circleRef"
          cx="20" cy="20" r="16"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="1.5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference"
          transform="rotate(-90 20 20)"
          style="transition: stroke 0.6s ease"
        />
        <line x1="20" y1="24" x2="20" y2="14" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" />
        <line x1="14" y1="19" x2="20" y2="14" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" />
        <line x1="26" y1="19" x2="20" y2="14" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </div>
  </Transition>
</template>

<style scoped>
.scroll-indicator {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 90;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.scroll-indicator:hover {
  transform: scale(1.15);
}

.scroll-ind-enter-active,
.scroll-ind-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.scroll-ind-enter-from,
.scroll-ind-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 640px) {
  .scroll-indicator {
    bottom: 20px;
    right: 20px;
  }
}
</style>

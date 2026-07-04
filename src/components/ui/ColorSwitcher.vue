<script setup lang="ts">
import { ref } from 'vue'
import type { ColorSchemeId } from '@/types'
import { useTheme } from '@/composables/useTheme'

const { currentScheme, schemeList, colorSchemes, setScheme } = useTheme()
const isOpen = ref(false)

function select(id: ColorSchemeId) {
  setScheme(id)
  isOpen.value = false
}
</script>

<template>
  <div class="color-switcher">
    <button class="switcher-toggle" @click="isOpen = !isOpen" :aria-label="`Current theme: ${colorSchemes[currentScheme].nameZh}`">
      <span class="swatch" :style="{ background: colorSchemes[currentScheme].colors.primary }"></span>
    </button>

    <Transition name="switcher-drop">
      <div v-if="isOpen" class="switcher-dropdown">
        <button
          v-for="id in schemeList"
          :key="id"
          class="switcher-option"
          :class="{ active: id === currentScheme }"
          @click="select(id)"
        >
          <span class="option-swatch" :style="{ background: colorSchemes[id].colors.primary }"></span>
          <span class="option-label">{{ colorSchemes[id].nameZh }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.color-switcher {
  position: relative;
}

.switcher-toggle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.3s ease, transform 0.2s ease;
}

.switcher-toggle:hover {
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: block;
  transition: background-color 0.6s ease;
}

.switcher-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 8px 32px var(--color-glow);
  z-index: 200;
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.switcher-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-text);
  transition: background-color 0.2s ease;
}

.switcher-option:hover {
  background: var(--color-surfaceHover);
}

.switcher-option.active {
  background: var(--color-bgAlt);
}

.option-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-label {
  white-space: nowrap;
}

/* Dropdown transition */
.switcher-drop-enter-active,
.switcher-drop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.switcher-drop-enter-from,
.switcher-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>

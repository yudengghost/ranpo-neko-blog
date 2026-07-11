<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVisualStyle } from '@/composables/useVisualStyle'
import type { VisualStyleId, ColorSchemeId } from '@/types'

const {
  currentStyle,
  currentVariant,
  styleList,
  currentStyleDef,
  visualStyles,
  colorSchemes,
  setStyle,
  setVariant,
} = useVisualStyle()

const styles = computed(() => styleList.map((id) => visualStyles[id]))

const open = ref(false)

function selectStyle(id: VisualStyleId) {
  setStyle(id)
}

function selectVariant(id: ColorSchemeId) {
  setVariant(id)
}

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <div class="style-switcher" :class="{ open }">
    <button class="switcher-toggle" @click="toggle" :title="currentStyleDef.nameZh">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5"/>
        <circle cx="17.5" cy="10.5" r="2.5"/>
        <circle cx="8.5" cy="7.5" r="2.5"/>
        <circle cx="6.5" cy="12.5" r="2.5"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    </button>
    <div class="switcher-panel">
      <div class="panel-title">视觉风格</div>
      <div class="style-list">
        <button
          v-for="style in styles"
          :key="style.id"
          class="style-btn"
          :class="{ active: currentStyle === style.id }"
          @click="selectStyle(style.id)"
        >
          <span class="style-name">{{ style.nameZh }}</span>
          <span class="style-desc">{{ style.description }}</span>
        </button>
      </div>
      <div class="panel-title">配色方案</div>
      <div class="variant-list">
        <button
          v-for="vid in currentStyleDef.colorVariants"
          :key="vid"
          class="variant-dot"
          :class="{ active: currentVariant === vid }"
          :style="{ backgroundColor: colorSchemes[vid].colors.primary }"
          :title="colorSchemes[vid].nameZh"
          @click="selectVariant(vid)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-switcher {
  position: relative;
}

.switcher-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.switcher-toggle:hover {
  background: var(--color-accent);
  color: var(--color-bg);
  transform: rotate(30deg);
}

.switcher-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 280px;
  padding: 20px;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.97);
  transform-origin: top right;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  z-index: 100;
}

.style-switcher.open .switcher-panel {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 10px;
}

.panel-title + .style-list {
  margin-bottom: 20px;
}

.style-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.style-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.style-btn:hover {
  border-color: var(--color-accent);
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0 var(--color-border);
}

.style-btn.active {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg));
}

.style-name {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
}

.style-desc {
  font-size: 0.7rem;
  color: var(--color-muted);
  line-height: 1.3;
}

.variant-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.variant-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.variant-dot:hover {
  transform: scale(1.15);
}

.variant-dot.active {
  border-color: var(--color-text);
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-text);
}
</style>

import { ref, computed } from 'vue'
import type { ColorSchemeId, VisualStyleId } from '@/types'
import { colorSchemes, getSchemesForStyle } from '@/theme/colors'
import { visualStyles, styleList, getDefaultVariantForStyle } from '@/theme/styles'

const STORAGE_KEY = 'blog-visual-style'

interface StoredStyle {
  style: VisualStyleId
  variant: ColorSchemeId
}

function getInitial(): StoredStyle {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as StoredStyle
      if (styleList.includes(parsed.style) && colorSchemes[parsed.variant]) {
        const validVariants = getSchemesForStyle(parsed.style)
        if (validVariants.includes(parsed.variant)) {
          return parsed
        }
      }
    }
  } catch {}
  return { style: 'geometric', variant: 'mint' }
}

const initial = getInitial()
const currentStyle = ref<VisualStyleId>(initial.style)
const currentVariant = ref<ColorSchemeId>(initial.variant)
const isTransitioning = ref(false)

const colors = computed(() => colorSchemes[currentVariant.value].colors)
const currentStyleDef = computed(() => visualStyles[currentStyle.value])
const currentVariants = computed(() => getSchemesForStyle(currentStyle.value))

const transitionListeners: Array<(from: VisualStyleId, to: VisualStyleId) => void> = []

function applyDOM(style: VisualStyleId, variant: ColorSchemeId) {
  document.documentElement.setAttribute('data-visual-style', style)
  document.documentElement.setAttribute('data-theme', variant)
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ style: currentStyle.value, variant: currentVariant.value }),
    )
  } catch {}
}

export function useVisualStyle() {
  const setVariant = (id: ColorSchemeId) => {
    const scheme = colorSchemes[id]
    if (!scheme) return
    if (scheme.visualStyle !== currentStyle.value) {
      setStyle(scheme.visualStyle, id)
      return
    }
    currentVariant.value = id
    applyDOM(currentStyle.value, id)
    persist()
  }

  const setStyle = (id: VisualStyleId, variant?: ColorSchemeId) => {
    if (id === currentStyle.value && !variant) return
    const targetVariant = variant ?? getDefaultVariantForStyle(id)
    if (id === currentStyle.value) {
      setVariant(targetVariant)
      return
    }
    const from = currentStyle.value
    isTransitioning.value = true
    transitionListeners.forEach((fn) => fn(from, id))
    currentStyle.value = id
    currentVariant.value = targetVariant
    applyDOM(id, targetVariant)
    persist()
    setTimeout(() => { isTransitioning.value = false }, 900)
  }

  const onStyleChange = (fn: (from: VisualStyleId, to: VisualStyleId) => void) => {
    transitionListeners.push(fn)
  }

  applyDOM(currentStyle.value, currentVariant.value)

  return {
    currentStyle,
    currentVariant,
    currentStyleDef,
    currentVariants,
    colors,
    isTransitioning,
    styleList,
    visualStyles,
    colorSchemes,
    setStyle,
    setVariant,
    onStyleChange,
  }
}

let themeCompatInitialized = false
export function useTheme() {
  const vs = useVisualStyle()
  if (!themeCompatInitialized) {
    themeCompatInitialized = true
  }
  return {
    currentScheme: vs.currentVariant,
    colors: vs.colors,
    schemeList: vs.currentVariants,
    colorSchemes: vs.colorSchemes,
    setScheme: vs.setVariant,
  }
}

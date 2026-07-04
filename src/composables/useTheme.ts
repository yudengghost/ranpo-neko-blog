import { ref, computed } from 'vue'
import type { ColorSchemeId } from '@/types'
import { colorSchemes, schemeList } from '@/theme/colors'

const STORAGE_KEY = 'blog-color-scheme'

function getInitialScheme(): ColorSchemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && schemeList.includes(stored as ColorSchemeId)) {
      return stored as ColorSchemeId
    }
  } catch {}
  return 'mint'
}

const currentScheme = ref<ColorSchemeId>(getInitialScheme())

const colors = computed(() => colorSchemes[currentScheme.value].colors)

export function useTheme() {
  const setScheme = (id: ColorSchemeId) => {
    currentScheme.value = id
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
    document.documentElement.setAttribute('data-theme', id)
  }

  document.documentElement.setAttribute('data-theme', currentScheme.value)

  return {
    currentScheme,
    colors,
    schemeList,
    colorSchemes,
    setScheme,
  }
}

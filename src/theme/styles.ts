import type { VisualStyleId, VisualStyleDef, ColorSchemeId } from '@/types'

export const visualStyles: Record<VisualStyleId, VisualStyleDef> = {
  geometric: {
    id: 'geometric',
    name: 'Geometric Line',
    nameZh: '几何线条',
    description: '细衬线、柔和低饱和、优雅留白',
    colorVariants: ['mint', 'rose', 'lavender', 'sand', 'sage', 'ocean', 'noir'],
    defaultVariant: 'mint',
  },
  brutalist: {
    id: 'brutalist',
    name: 'Neo-Brutalism',
    nameZh: '新粗野主义',
    description: '粗边框、硬阴影、高对比、反精致',
    colorVariants: ['brutal-light', 'brutal-dark'],
    defaultVariant: 'brutal-light',
  },
  'retro-futurism': {
    id: 'retro-futurism',
    name: 'Retro-Futurism',
    nameZh: '复古未来主义',
    description: '霓虹发光、透视网格、CRT质感、Synthwave',
    colorVariants: ['retro-sunset', 'retro-neon'],
    defaultVariant: 'retro-sunset',
  },
}

export const styleList: VisualStyleId[] = ['geometric', 'brutalist', 'retro-futurism']

export function getDefaultVariantForStyle(style: VisualStyleId): ColorSchemeId {
  return visualStyles[style].defaultVariant
}

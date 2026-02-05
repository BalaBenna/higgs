export type PresetId =
  | 'infographics'
  | 'text-animation'
  | 'posters'
  | 'presentation'
  | 'scratch'

export type StyleId = 'minimal' | 'corporate' | 'fashion' | 'marketing'

export type ThemeId = 'prism' | 'mosaic' | 'candy' | 'custom'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
}

export interface MotionGenerationParams {
  prompt: string
  preset: PresetId
  style?: StyleId
  theme?: ThemeId
  themeColors?: ThemeColors
  duration: number
  mediaUrls?: string[]
}

export interface CompilationResult {
  Component: React.FC | null
  error: string | null
}

export const PRESET_LABELS: Record<PresetId, string> = {
  infographics: 'Infographics',
  'text-animation': 'Text Animation',
  posters: 'Posters',
  presentation: 'Presentation',
  scratch: 'From Scratch',
}

export const STYLE_DATA: { id: StyleId; label: string }[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'marketing', label: 'Marketing' },
]

export const THEME_DATA: {
  id: ThemeId
  label: string
  colors: ThemeColors
}[] = [
  {
    id: 'prism',
    label: 'PRISM',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: '#FFFFFF',
    },
  },
  {
    id: 'mosaic',
    label: 'MOSAIC',
    colors: {
      primary: '#667EEA',
      secondary: '#764BA2',
      accent: '#F5576C',
      background: '#1a1a2e',
    },
  },
  {
    id: 'candy',
    label: 'CANDY',
    colors: {
      primary: '#FF9A9E',
      secondary: '#FAD0C4',
      accent: '#FFD1FF',
      background: '#FFF5F5',
    },
  },
]

export const QUICK_PROMPTS: Record<PresetId, string[]> = {
  infographics: [
    'Revenue growth chart',
    'User statistics',
    'Timeline infographic',
  ],
  'text-animation': [
    'Brand tagline reveal',
    'Countdown timer',
    'Lyric animation',
  ],
  posters: ['Social poster', 'Event promo', 'Minimal loop'],
  presentation: [
    'Product launch slides',
    'Quarterly report',
    'Team intro',
  ],
  scratch: ['Logo animation', 'Abstract motion', 'Social media post'],
}

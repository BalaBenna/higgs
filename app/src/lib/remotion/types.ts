export type PresetId =
  | 'infographics'
  | 'text-animation'
  | 'posters'
  | 'presentation'
  | 'scratch'
  | 'social-media-ad'
  | 'logo-animation'
  | 'product-showcase'
  | 'countdown'

export type StyleId = 'minimal' | 'corporate' | 'fashion' | 'marketing'

export type ThemeId = 'prism' | 'mosaic' | 'candy' | 'custom'

export type ModelId = 'gpt-4o' | 'gemini-2.5-pro'

export type AspectRatioId = '16:9' | '9:16' | '1:1' | '4:5'

export const ASPECT_RATIO_DATA: {
  id: AspectRatioId
  label: string
  width: number
  height: number
  description: string
}[] = [
  { id: '16:9', label: 'Landscape', width: 1920, height: 1080, description: 'YouTube, presentations' },
  { id: '9:16', label: 'Portrait', width: 1080, height: 1920, description: 'Reels, TikTok, Stories' },
  { id: '1:1', label: 'Square', width: 1080, height: 1080, description: 'Instagram, social posts' },
  { id: '4:5', label: 'Vertical', width: 1080, height: 1350, description: 'Instagram feed, Pinterest' },
]

export const MODEL_DATA: { id: ModelId; label: string; provider: string; description: string }[] = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', description: 'Fast, reliable code generation' },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning, large context',
  },
]

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
  model?: ModelId
  aspectRatio?: AspectRatioId
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
  'social-media-ad': 'Social Media Ad',
  'logo-animation': 'Logo Animation',
  'product-showcase': 'Product Showcase',
  countdown: 'Countdown',
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
  'social-media-ad': [
    'Flash sale banner',
    'New product launch',
    'Limited time offer',
  ],
  'logo-animation': [
    'Logo intro reveal',
    'Brand identity motion',
    'Animated monogram',
  ],
  'product-showcase': [
    'Feature highlight reel',
    'Before and after',
    'Product comparison',
  ],
  countdown: [
    'Event countdown',
    'New year countdown',
    'Launch countdown',
  ],
}

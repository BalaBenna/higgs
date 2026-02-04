import {
  Video,
  Film,
  Sparkles,
  Scissors,
  MousePointer,
  TrendingUp,
  Mic,
  Pencil,
  PenTool,
  Factory,
  ArrowUp,
  Clapperboard,
  Image,
  LayoutGrid,
  User,
  Lightbulb,
  Paintbrush,
  Wand2,
  UserCircle,
  Repeat,
  Camera,
  Shirt,
  Eraser,
  Palette,
  Maximize,
  Heart,
  RotateCcw,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'

export type BadgeType = 'new' | 'top' | 'best' | 'neon' | null

export interface FeatureItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
  badge?: BadgeType
  description?: string
}

export interface ModelItem {
  id: string
  label: string
  provider?: string
  badge?: BadgeType
  toolId?: string
  isComingSoon?: boolean
}

export interface NavigationMenu {
  features: FeatureItem[]
  models: ModelItem[]
}

export const VIDEO_MENU: NavigationMenu = {
  features: [
    { id: 'create-video', label: 'Create Video', icon: Video, path: '/video' },
    { id: 'cinema-studio-video', label: 'Cinema Studio Video', icon: Film, path: '/cinema-studio', badge: 'top' },
    { id: 'mixed-media', label: 'Mixed Media', icon: LayoutGrid, path: '/video/mixed-media', badge: 'new' },
    { id: 'edit-video', label: 'Edit Video', icon: Scissors, path: '/edit' },
    { id: 'click-to-ad', label: 'Click to Ad', icon: MousePointer, path: '/video/click-to-ad' },
    { id: 'sora-trends', label: 'Sora 2 Trends', icon: TrendingUp, path: '/video/sora-trends' },
    { id: 'lipsync-studio', label: 'Lipsync Studio', icon: Mic, path: '/video/lipsync' },
    { id: 'draw-to-video', label: 'Draw to Video', icon: Pencil, path: '/video/draw' },
    { id: 'sketch-to-video', label: 'Sketch to Video', icon: PenTool, path: '/video/sketch' },
    { id: 'ugc-factory', label: 'UGC Factory', icon: Factory, path: '/video/ugc' },
    { id: 'video-upscale', label: 'Video Upscale', icon: ArrowUp, path: '/video/upscale' },
    { id: 'higgsfield-animate', label: 'Higgsfield Animate', icon: Sparkles, path: '/vibe-motion' },
    { id: 'recast-studio', label: 'Recast Studio', icon: Clapperboard, path: '/video/recast' },
  ],
  models: [
    { id: 'higgsfield-dop', label: 'Higgsfield DOP', provider: 'Higgsfield', isComingSoon: true },
    { id: 'grok-imagine', label: 'Grok Imagine', provider: 'xAI', badge: 'new', isComingSoon: true },
    { id: 'kling-motion-control', label: 'Kling Motion Control', provider: 'Kuaishou', badge: 'new', isComingSoon: true },
    { id: 'kling-2.6', label: 'Kling 2.6', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v2_jaaz' },
    { id: 'kling-o1-edit', label: 'Kling O1 Edit', provider: 'Kuaishou', isComingSoon: true },
    { id: 'sora-2', label: 'Sora 2', provider: 'OpenAI', isComingSoon: true },
    { id: 'veo-3.1', label: 'Google Veo 3.1', provider: 'Google', toolId: 'generate_video_by_veo3_fast_jaaz' },
    { id: 'seedance-1.5-pro', label: 'Seedance 1.5 Pro', provider: 'ByteDance', toolId: 'generate_video_by_seedance_v1_jaaz' },
    { id: 'wan-2.6', label: 'Wan 2.6', provider: 'Alibaba', isComingSoon: true },
    { id: 'hailuo-o2', label: 'Minimax Hailuo O2', provider: 'MiniMax', toolId: 'generate_video_by_hailuo_02_jaaz' },
    { id: 'kling-avatars-2.0', label: 'Kling Avatars 2.0', provider: 'Kuaishou', isComingSoon: true },
  ],
}

export const IMAGE_MENU: NavigationMenu = {
  features: [
    { id: 'create-image', label: 'Create Image', icon: Image, path: '/image' },
    { id: 'cinema-studio-image', label: 'Cinema Studio Image', icon: Film, path: '/cinema-studio', badge: 'top' },
    { id: 'create-storyboard', label: 'Create Storyboard', icon: LayoutGrid, path: '/image/storyboard' },
    { id: 'soul-id-character', label: 'Soul ID Character', icon: User, path: '/character', badge: 'new' },
    { id: 'relight', label: 'Relight', icon: Lightbulb, path: '/edit', badge: 'new' },
    { id: 'inpaint', label: 'Inpaint', icon: Paintbrush, path: '/inpaint', badge: 'new' },
    { id: 'image-upscale', label: 'Image Upscale', icon: Maximize, path: '/edit' },
    { id: 'face-swap', label: 'Face Swap', icon: UserCircle, path: '/character/face-swap' },
    { id: 'character-swap', label: 'Character Swap', icon: Repeat, path: '/character/swap' },
    { id: 'draw-to-edit', label: 'Draw to Edit', icon: Pencil, path: '/edit' },
    { id: 'instadump', label: 'Instadump', icon: Camera, path: '/image/instadump' },
    { id: 'photodump-studio', label: 'Photodump Studio', icon: Camera, path: '/image/photodump' },
    { id: 'fashion-factory', label: 'Fashion Factory', icon: Shirt, path: '/image/fashion' },
  ],
  models: [
    { id: 'higgsfield-soul', label: 'Higgsfield Soul', provider: 'Higgsfield', badge: 'best', isComingSoon: true },
    { id: 'higgsfield-popcorn', label: 'Higgsfield Popcorn', provider: 'Higgsfield', isComingSoon: true },
    { id: 'nano-banana-pro', label: 'Nano Banana Pro', provider: 'Nano', badge: 'top', isComingSoon: true },
    { id: 'seedream-4.5', label: 'Seedream 4.5', provider: 'ByteDance', badge: 'new', toolId: 'generate_image_by_doubao_seedream_3_jaaz' },
    { id: 'gpt-image-1.5', label: 'GPT Image 1.5', provider: 'OpenAI', toolId: 'generate_image_by_gpt_image_1_jaaz' },
    { id: 'flux-2', label: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new', toolId: 'generate_image_by_flux_kontext_max_jaaz' },
    { id: 'z-image', label: 'Z-Image', provider: 'Various', isComingSoon: true },
    { id: 'kling-o1-image', label: 'Kling O1 Image', provider: 'Kuaishou', isComingSoon: true },
    { id: 'wan-2.2-image', label: 'Wan 2.2 Image', provider: 'Alibaba', isComingSoon: true },
    { id: 'reve', label: 'Reve', provider: 'Reve', isComingSoon: true },
    { id: 'topaz', label: 'Topaz', provider: 'Topaz Labs', isComingSoon: true },
  ],
}

export const EDIT_MENU: NavigationMenu = {
  features: [
    { id: 'edit-video', label: 'Edit Video', icon: Scissors, path: '/edit' },
    { id: 'inpaint-edit', label: 'Inpaint', icon: Eraser, path: '/inpaint', badge: 'top' },
    { id: 'relight-edit', label: 'Relight', icon: Lightbulb, path: '/edit', badge: 'new' },
    { id: 'ai-stylist', label: 'AI Stylist', icon: Palette, path: '/edit' },
    { id: 'upscale', label: 'Upscale', icon: Maximize, path: '/edit' },
    { id: 'skin-enhancer', label: 'Skin Enhancer', icon: Heart, path: '/edit' },
    { id: 'angles', label: 'Angles', icon: RotateCcw, path: '/edit' },
  ],
  models: [
    { id: 'nano-banana-pro-inpaint', label: 'Nano Banana Pro Inpaint', provider: 'Nano', isComingSoon: true },
    { id: 'nano-banana-inpaint', label: 'Nano Banana Inpaint', provider: 'Nano', isComingSoon: true },
    { id: 'product-placement', label: 'Product Placement', provider: 'Various', isComingSoon: true },
    { id: 'topaz-edit', label: 'Topaz', provider: 'Topaz Labs', isComingSoon: true },
    { id: 'grok-imagine-edit', label: 'Grok Imagine Edit', provider: 'xAI', badge: 'new', isComingSoon: true },
    { id: 'kling-motion-control-edit', label: 'Kling Motion Control', provider: 'Kuaishou', badge: 'top', isComingSoon: true },
    { id: 'kling-o1-edit', label: 'Kling O1 Edit', provider: 'Kuaishou', badge: 'top', isComingSoon: true },
  ],
}

export const CHARACTER_MENU: NavigationMenu = {
  features: [
    { id: 'face-swap', label: 'Face Swap', icon: UserCircle, path: '/character/face-swap' },
    { id: 'character-swap', label: 'Character Swap', icon: Repeat, path: '/character/swap' },
    { id: 'video-face-swap', label: 'Video Face Swap', icon: VideoIcon, path: '/character/video-face-swap' },
    { id: 'ai-stylist-char', label: 'AI Stylist', icon: Palette, path: '/edit', badge: 'top' },
    { id: 'recast-studio-char', label: 'Recast Studio', icon: Clapperboard, path: '/video/recast' },
  ],
  models: [
    { id: 'soul-id-character', label: 'Soul ID Character', provider: 'Higgsfield', isComingSoon: true },
  ],
}

export const NAVIGATION_MENUS: Record<string, NavigationMenu> = {
  image: IMAGE_MENU,
  video: VIDEO_MENU,
  edit: EDIT_MENU,
  character: CHARACTER_MENU,
}

export const TABS_WITH_DROPDOWN = ['image', 'video', 'edit', 'character']

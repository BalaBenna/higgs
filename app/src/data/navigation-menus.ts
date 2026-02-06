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
  description?: string
}

export interface NavigationMenu {
  features: FeatureItem[]
  models: ModelItem[]
}

export const VIDEO_MENU: NavigationMenu = {
  features: [
    { id: 'create-video', label: 'Create Video', icon: Video, path: '/video', description: 'Generate AI videos from text or images' },
    { id: 'cinema-studio-video', label: 'Cinema Studio Video', icon: Film, path: '/cinema-studio', badge: 'top', description: 'Professional cinematic video creation' },
    { id: 'mixed-media', label: 'Mixed Media', icon: LayoutGrid, path: '/video/mixed-media', badge: 'new', description: 'Combine multiple media formats' },
    { id: 'edit-video', label: 'Edit Video', icon: Scissors, path: '/edit', description: 'AI-powered video editing tools' },
    { id: 'click-to-ad', label: 'Click to Ad', icon: MousePointer, path: '/video/click-to-ad', description: 'Create ads from product images' },
    { id: 'sora-trends', label: 'Sora 2 Trends', icon: TrendingUp, path: '/video/sora-trends', description: 'Trending Sora 2 video styles' },
    { id: 'lipsync-studio', label: 'Lipsync Studio', icon: Mic, path: '/video/lipsync', description: 'Sync lips to any audio track' },
    { id: 'draw-to-video', label: 'Draw to Video', icon: Pencil, path: '/video/draw', description: 'Sketch and animate your ideas' },
    { id: 'sketch-to-video', label: 'Sketch to Video', icon: PenTool, path: '/video/sketch', description: 'Convert sketches to motion' },
    { id: 'ugc-factory', label: 'UGC Factory', icon: Factory, path: '/video/ugc', description: 'Generate user-generated content' },
    { id: 'video-upscale', label: 'Video Upscale', icon: ArrowUp, path: '/video/upscale', description: 'Enhance video resolution with AI' },
    { id: 'higgsfield-animate', label: 'Higgsfield Animate', icon: Sparkles, path: '/vibe-motion', description: 'Bring still images to life' },
    { id: 'recast-studio', label: 'Recast Studio', icon: Clapperboard, path: '/video/recast', description: 'Restyle and remix existing videos' },
  ],
  models: [
    { id: 'higgsfield-dop', label: 'Higgsfield DOP', provider: 'Higgsfield', toolId: 'generate_video_by_higgsfield_dop_jaaz', description: 'Cinematic depth-of-field video' },
    { id: 'grok-imagine', label: 'Grok Imagine', provider: 'xAI', badge: 'new', toolId: 'generate_video_by_grok_imagine_jaaz', description: 'AI video from xAI' },
    { id: 'kling-3.0', label: 'Kling 3.0', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_3_jaaz', description: 'Next-gen Kling video model' },
    { id: 'kling-motion-control', label: 'Kling Motion Control', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_motion_control_jaaz', description: 'Precise motion-guided generation' },
    { id: 'kling-2.6', label: 'Kling 2.6', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v2_jaaz', description: 'High-quality video generation' },
    { id: 'kling-3.0-omni-edit', label: 'Kling 3.0 Omni Edit', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_3_omni_edit_jaaz', description: 'All-in-one video editing' },
    { id: 'kling-o1-edit', label: 'Kling O1 Edit', provider: 'Kuaishou', toolId: 'generate_video_by_kling_q1_edit_jaaz', description: 'AI-powered video editing' },
    { id: 'sora-2', label: 'Sora 2', provider: 'OpenAI', toolId: 'generate_video_by_sora_2_jaaz', description: 'OpenAI cinematic video model' },
    { id: 'veo-3.1', label: 'Google Veo 3.1', provider: 'Google', toolId: 'generate_video_by_veo3_fast_jaaz', description: 'Google DeepMind video model' },
    { id: 'seedance-1.5-pro', label: 'Seedance 1.5 Pro', provider: 'ByteDance', toolId: 'generate_video_by_seedance_v1_jaaz', description: 'ByteDance motion generation' },
    { id: 'seedance-v1-lite', label: 'Seedance v1 Lite', provider: 'ByteDance', toolId: 'generate_video_by_seedance_v1_lite_jaaz', description: 'Fast lightweight video generation' },
    { id: 'wan-2.6', label: 'Wan 2.6', provider: 'Alibaba', toolId: 'generate_video_by_wan_2_6_jaaz', description: 'Alibaba video generation' },
    { id: 'hailuo-o2', label: 'Minimax Hailuo O2', provider: 'MiniMax', toolId: 'generate_video_by_hailuo_02_jaaz', description: 'MiniMax AI video' },
    { id: 'kling-avatars-2.0', label: 'Kling Avatars 2.0', provider: 'Kuaishou', toolId: 'generate_video_by_kling_avatars_2_jaaz', description: 'AI avatar video generation' },
    // Kling Replicate models (kwaivgi/*)
    { id: 'kling-v2.6-replicate', label: 'Kling v2.6', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_v26_replicate', description: 'Latest Kling with audio generation' },
    { id: 'kling-v2.5-turbo-replicate', label: 'Kling v2.5 Turbo', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_v25_turbo_replicate', description: 'Fastest Kling model' },
    { id: 'kling-v2.1-master-replicate', label: 'Kling v2.1 Master', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v21_master_replicate', description: 'Balanced quality generation' },
    { id: 'kling-v2.0-replicate', label: 'Kling v2.0', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v20_replicate', description: 'Reliable text/image-to-video' },
    { id: 'kling-v1.6-standard-replicate', label: 'Kling v1.6 Standard', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v16_standard_replicate', description: 'Standard quality with reference images' },
    { id: 'kling-v1.6-pro-replicate', label: 'Kling v1.6 Pro', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v16_pro_replicate', description: 'Pro quality with 1080p support' },
    { id: 'kling-v1.5-pro-replicate', label: 'Kling v1.5 Pro', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v15_pro_replicate', description: 'Pro quality with end image' },
    { id: 'kling-v2.1-i2v-replicate', label: 'Kling v2.1 (I2V)', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_v21_i2v_replicate', description: 'Image-to-video specialist' },
    { id: 'kling-v2.6-motion-control-replicate', label: 'Kling v2.6 Motion Control', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_v26_motion_control_replicate', description: 'Motion-guided video generation' },
    { id: 'kling-avatar-v2-replicate', label: 'Kling Avatar v2', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_avatar_v2_replicate', description: 'Avatar talking-head videos' },
    { id: 'kling-lip-sync-replicate', label: 'Kling Lip Sync', provider: 'Kuaishou', badge: 'new', toolId: 'generate_video_by_kling_lip_sync_replicate', description: 'Audio/text lip sync on video' },
  ],
}

export const IMAGE_MENU: NavigationMenu = {
  features: [
    { id: 'create-image', label: 'Create Image', icon: Image, path: '/image', description: 'Generate AI images from text prompts' },
    { id: 'cinema-studio-image', label: 'Cinema Studio Image', icon: Film, path: '/cinema-studio', badge: 'top', description: 'Professional studio-quality images' },
    { id: 'create-storyboard', label: 'Create Storyboard', icon: LayoutGrid, path: '/image/storyboard', description: 'Visual story planning with AI' },
    { id: 'soul-id-character', label: 'Soul ID Character', icon: User, path: '/character', badge: 'new', description: 'Consistent character generation' },
    { id: 'relight', label: 'Relight', icon: Lightbulb, path: '/edit', badge: 'new', description: 'AI-powered lighting adjustments' },
    { id: 'inpaint', label: 'Inpaint', icon: Paintbrush, path: '/inpaint', badge: 'new', description: 'Edit specific areas of images' },
    { id: 'image-upscale', label: 'Image Upscale', icon: Maximize, path: '/edit', description: 'Enhance image resolution' },
    { id: 'face-swap', label: 'Face Swap', icon: UserCircle, path: '/character/face-swap', description: 'Swap faces in photos with AI' },
    { id: 'character-swap', label: 'Character Swap', icon: Repeat, path: '/character/swap', description: 'Replace characters in images' },
    { id: 'draw-to-edit', label: 'Draw to Edit', icon: Pencil, path: '/edit', description: 'Draw on images to guide edits' },
    { id: 'instadump', label: 'Instadump', icon: Camera, path: '/image/instadump', description: 'Batch-generate social content' },
    { id: 'photodump-studio', label: 'Photodump Studio', icon: Camera, path: '/image/photodump', description: 'Create photo collections with AI' },
    { id: 'fashion-factory', label: 'Fashion Factory', icon: Shirt, path: '/image/fashion', description: 'Ultra-realistic fashion visuals' },
    { id: 'click-to-ad-image', label: 'Click to Ad', icon: MousePointer, path: '/image/click-to-ad', badge: 'new', description: 'Create image ads from product URLs' },
  ],
  models: [
    { id: 'higgsfield-soul', label: 'Higgsfield Soul', provider: 'Higgsfield', badge: 'best', toolId: 'generate_image_by_higgsfield_soul_jaaz', description: 'Ultra-realistic portrait generation' },
    { id: 'higgsfield-popcorn', label: 'Higgsfield Popcorn', provider: 'Higgsfield', toolId: 'generate_image_by_higgsfield_popcorn_jaaz', description: 'Fast creative image generation' },
    { id: 'nano-banana-pro', label: 'Nano Banana Pro', provider: 'Nano', badge: 'top', toolId: 'generate_image_by_nano_banana_pro_jaaz', description: 'High-speed image model' },
    { id: 'seedream-4.5', label: 'Seedream 4.5', provider: 'ByteDance', badge: 'new', toolId: 'generate_image_by_doubao_seedream_3_jaaz', description: 'ByteDance image generation' },
    { id: 'gpt-image-1.5', label: 'GPT Image 1.5', provider: 'OpenAI', toolId: 'generate_image_by_gpt_image_1_jaaz', description: 'OpenAI image model' },
    { id: 'flux-2', label: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new', toolId: 'generate_image_by_flux_kontext_max_jaaz', description: 'State-of-the-art image synthesis' },
    { id: 'z-image', label: 'Z-Image', provider: 'Various', toolId: 'generate_image_by_z_image_jaaz', description: 'Multi-provider image fusion' },
    { id: 'kling-q1-image', label: 'Kling Q1 Image', provider: 'Kuaishou', toolId: 'generate_image_by_kling_q1_image_jaaz', description: 'Kling image generation model' },
    { id: 'wan-2.2-image', label: 'Wan 2.2 Image', provider: 'Alibaba', toolId: 'generate_image_by_wan_2_2_image_jaaz', description: 'Alibaba image generation' },
    { id: 'reve', label: 'Reve', provider: 'Reve', toolId: 'generate_image_by_reve_jaaz', description: 'Artistic image creation' },
    { id: 'topaz', label: 'Topaz', provider: 'Topaz Labs', toolId: 'generate_image_by_topaz_jaaz', description: 'AI-enhanced image processing' },
    { id: 'flux-2-pro-replicate', label: 'FLUX 2 Pro', provider: 'Black Forest Labs', badge: 'new', toolId: 'generate_image_by_flux_2_pro_replicate', description: 'High-quality FLUX 2 Pro via Replicate' },
    { id: 'ideogram-v3-turbo', label: 'Ideogram V3 Turbo', provider: 'Ideogram', badge: 'new', toolId: 'generate_image_by_ideogram_v3_turbo_replicate', description: 'Fast Ideogram V3 text-to-image' },
    { id: 'flux-1.1-pro', label: 'FLUX 1.1 Pro', provider: 'Black Forest Labs', badge: 'new', toolId: 'generate_image_by_flux_1_1_pro_replicate', description: 'FLUX 1.1 Pro image generation' },
  ],
}

export const EDIT_MENU: NavigationMenu = {
  features: [
    { id: 'edit-video', label: 'Edit Video', icon: Scissors, path: '/edit', description: 'AI-powered video editing tools' },
    { id: 'inpaint-edit', label: 'Inpaint', icon: Eraser, path: '/inpaint', badge: 'top', description: 'Remove or replace image regions' },
    { id: 'relight-edit', label: 'Relight', icon: Lightbulb, path: '/edit', badge: 'new', description: 'Adjust lighting with AI' },
    { id: 'ai-stylist', label: 'AI Stylist', icon: Palette, path: '/edit', description: 'Transform image styles with AI' },
    { id: 'upscale', label: 'Upscale', icon: Maximize, path: '/edit', description: 'Enhance resolution and details' },
    { id: 'skin-enhancer', label: 'Skin Enhancer', icon: Heart, path: '/edit', description: 'Professional skin retouching' },
    { id: 'angles', label: 'Angles', icon: RotateCcw, path: '/edit', description: 'Change perspective and angles' },
  ],
  models: [
    { id: 'nano-banana-pro-inpaint', label: 'Nano Banana Pro Inpaint', provider: 'Nano', toolId: 'generate_image_by_nano_banana_pro_inpaint_jaaz', description: 'Advanced inpainting model' },
    { id: 'nano-banana-inpaint', label: 'Nano Banana Inpaint', provider: 'Nano', toolId: 'generate_image_by_nano_banana_inpaint_jaaz', description: 'Fast inpainting model' },
    { id: 'product-placement', label: 'Product Placement', provider: 'Various', toolId: 'generate_image_by_product_placement_jaaz', description: 'AI product placement in scenes' },
    { id: 'topaz-edit', label: 'Topaz', provider: 'Topaz Labs', toolId: 'generate_image_by_topaz_jaaz', description: 'AI-enhanced editing tools' },
    { id: 'grok-imagine-edit', label: 'Grok Imagine Edit', provider: 'xAI', badge: 'new', toolId: 'generate_video_by_grok_imagine_edit_jaaz', description: 'xAI-powered image editing' },
    { id: 'kling-3.0-omni-edit', label: 'Kling 3.0 Omni Edit', provider: 'Kuaishou', badge: 'top', toolId: 'generate_video_by_kling_3_omni_edit_jaaz', description: 'All-in-one editing model' },
    { id: 'kling-o1-edit', label: 'Kling O1 Edit', provider: 'Kuaishou', badge: 'top', toolId: 'generate_video_by_kling_q1_edit_jaaz', description: 'Intelligent video editing' },
  ],
}

export const CHARACTER_MENU: NavigationMenu = {
  features: [
    { id: 'face-swap', label: 'Face Swap', icon: UserCircle, path: '/character/face-swap', description: 'Swap faces in photos with AI' },
    { id: 'character-swap', label: 'Character Swap', icon: Repeat, path: '/character/swap', description: 'Replace characters in scenes' },
    { id: 'video-face-swap', label: 'Video Face Swap', icon: VideoIcon, path: '/character/video-face-swap', description: 'Swap faces in video clips' },
    { id: 'ai-stylist-char', label: 'AI Stylist', icon: Palette, path: '/edit', badge: 'top', description: 'AI fashion and style transfer' },
    { id: 'recast-studio-char', label: 'Recast Studio', icon: Clapperboard, path: '/video/recast', description: 'Restyle characters in videos' },
  ],
  models: [
    { id: 'soul-id-character', label: 'Soul ID Character', provider: 'Higgsfield', toolId: 'generate_image_by_higgsfield_soul_jaaz', description: 'Consistent character identity' },
  ],
}

export const NAVIGATION_MENUS: Record<string, NavigationMenu> = {
  image: IMAGE_MENU,
  video: VIDEO_MENU,
  edit: EDIT_MENU,
  character: CHARACTER_MENU,
}

export const TABS_WITH_DROPDOWN = ['image', 'video', 'edit', 'character']

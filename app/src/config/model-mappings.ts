export interface ModelMapping {
  id: string
  name: string
  provider: string
  toolId: string
  type: 'image' | 'video'
  isAvailable: boolean
}

export const IMAGE_MODEL_MAPPINGS: ModelMapping[] = [
  // OpenAI Models
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    toolId: 'generate_image_by_dalle3_openai',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    provider: 'OpenAI',
    toolId: 'generate_image_by_gpt_image_openai',
    type: 'image',
    isAvailable: true,
  },
  // Google Models
  {
    id: 'imagen-3',
    name: 'Imagen 3',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_google',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_4_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'imagen-4-fast',
    name: 'Imagen 4 Fast',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_4_fast_google',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'imagen-4-ultra',
    name: 'Imagen 4 Ultra',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_4_ultra_google',
    type: 'image',
    isAvailable: true,
  },
  // Replicate Models
  {
    id: 'flux-2-pro-replicate',
    name: 'FLUX 2 Pro (Replicate)',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_2_pro_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'ideogram-v3-turbo',
    name: 'Ideogram V3 Turbo',
    provider: 'Ideogram',
    toolId: 'generate_image_by_ideogram_v3_turbo_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-1.1-pro',
    name: 'FLUX 1.1 Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_1_1_pro_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-kontext-pro-replicate',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_pro_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-kontext-max-replicate',
    name: 'FLUX Kontext Max',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_max_replicate',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'recraft-v3-replicate',
    name: 'Recraft V3',
    provider: 'Recraft',
    toolId: 'generate_image_by_recraft_v3_replicate',
    type: 'image',
    isAvailable: true,
  },
  // xAI Grok
  {
    id: 'grok-imagine-image',
    name: 'Grok Imagine',
    provider: 'xAI',
    toolId: 'generate_image_by_grok_imagine_xai',
    type: 'image',
    isAvailable: true,
  },
  // Higgsfield
  {
    id: 'higgsfield-soul',
    name: 'Higgsfield Soul',
    provider: 'Higgsfield',
    toolId: 'generate_image_by_higgsfield_soul_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'higgsfield-popcorn',
    name: 'Higgsfield Popcorn',
    provider: 'Higgsfield',
    toolId: 'generate_image_by_higgsfield_popcorn_jaaz',
    type: 'image',
    isAvailable: true,
  },
  // Topaz
  {
    id: 'topaz',
    name: 'Topaz Enhancer',
    provider: 'Topaz Labs',
    toolId: 'enhance_image_by_topaz',
    type: 'image',
    isAvailable: true,
  },
]

export const VIDEO_MODEL_MAPPINGS: ModelMapping[] = [
  // Google Veo
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    provider: 'Google',
    toolId: 'generate_video_by_veo_google',
    type: 'video',
    isAvailable: true,
  },
  // OpenAI Sora
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    toolId: 'generate_video_by_sora_openai',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'OpenAI',
    toolId: 'generate_video_by_sora_2_pro_openai',
    type: 'video',
    isAvailable: true,
  },
  // xAI Grok
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'xAI',
    toolId: 'generate_video_by_grok_imagine_xai',
    type: 'video',
    isAvailable: true,
  },
  // ByteDance Seedance Lite
  {
    id: 'seedance-v1-lite',
    name: 'Seedance v1 Lite',
    provider: 'ByteDance',
    toolId: 'generate_video_by_seedance_v1_lite_jaaz',
    type: 'video',
    isAvailable: true,
  },
  // Kling Replicate Models (kwaivgi/*)
  {
    id: 'kling-v2.6-replicate',
    name: 'Kling v2.6',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v26_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v2.5-turbo-replicate',
    name: 'Kling v2.5 Turbo',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v25_turbo_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v2.1-master-replicate',
    name: 'Kling v2.1 Master',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v21_master_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v2.0-replicate',
    name: 'Kling v2.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v20_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v1.6-standard-replicate',
    name: 'Kling v1.6 Standard',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v16_standard_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v1.6-pro-replicate',
    name: 'Kling v1.6 Pro',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v16_pro_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v1.5-pro-replicate',
    name: 'Kling v1.5 Pro',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v15_pro_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v2.1-i2v-replicate',
    name: 'Kling v2.1 (I2V)',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v21_i2v_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-v2.6-motion-control-replicate',
    name: 'Kling v2.6 Motion Control',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v26_motion_control_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-avatar-v2-replicate',
    name: 'Kling Avatar v2',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_avatar_v2_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-lip-sync-replicate',
    name: 'Kling Lip Sync',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_lip_sync_replicate',
    type: 'video',
    isAvailable: true,
  },
  // Alias entries for inline model IDs used across pages
  {
    id: 'higgsfield-dop',
    name: 'Higgsfield DOP',
    provider: 'Higgsfield',
    toolId: 'generate_video_by_higgsfield_dop_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-2.6',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v26_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'ByteDance',
    toolId: 'generate_video_by_seedance_v1_pro_volces',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'hailuo-o2',
    name: 'Minimax Hailuo O2',
    provider: 'MiniMax',
    toolId: 'generate_video_by_hailuo_o2_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-3.0',
    name: 'Kling 3.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_3_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-motion-control',
    name: 'Kling Motion Control',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v26_motion_control_replicate',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'wan-2.6',
    name: 'Wan 2.6',
    provider: 'Alibaba',
    toolId: 'generate_video_by_wan_2_6_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-avatars-2.0',
    name: 'Kling Avatars 2.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_avatar_v2_replicate',
    type: 'video',
    isAvailable: true,
  },
]

// --- Image Model Capabilities ---

export interface ImageModelCapabilities {
  aspectRatios?: string[]
  supportsStyle?: boolean
  styleOptions?: string[]
  supportsNegativePrompt?: boolean
  supportsGuidanceScale?: boolean
  defaultGuidanceScale?: number
  minGuidanceScale?: number
  maxGuidanceScale?: number
  maxImages?: number
}

export const DEFAULT_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4']
export const DEFAULT_MAX_IMAGES = 8

const REPLICATE_CAPS: ImageModelCapabilities = {
  maxImages: 1,
}

const IMAGE_MODEL_CAPABILITIES: Record<string, ImageModelCapabilities> = {
  // OpenAI
  'dall-e-3': {
    supportsStyle: true,
    styleOptions: ['vivid', 'natural'],
    maxImages: 4,
  },
  'gpt-image-1.5': {
    maxImages: 8,
  },
  // Google
  'imagen-3': {
    maxImages: 4,
  },
  'imagen-4': {
    maxImages: 4,
  },
  'imagen-4-fast': {
    maxImages: 4,
  },
  'imagen-4-ultra': {
    maxImages: 4,
  },
  // Replicate models
  'flux-2-pro-replicate': REPLICATE_CAPS,
  'ideogram-v3-turbo': REPLICATE_CAPS,
  'flux-1.1-pro': REPLICATE_CAPS,
  'flux-kontext-pro-replicate': REPLICATE_CAPS,
  'flux-kontext-max-replicate': REPLICATE_CAPS,
  'recraft-v3-replicate': REPLICATE_CAPS,
  // xAI
  'grok-imagine-image': {
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
    maxImages: 8,
  },
  // Jaaz/Higgsfield
  'higgsfield-soul': {
    maxImages: 1,
  },
  'higgsfield-popcorn': {
    maxImages: 1,
  },
}

export function getImageModelCapabilities(modelId: string): ImageModelCapabilities {
  return IMAGE_MODEL_CAPABILITIES[modelId] ?? {}
}

export const ALL_MODEL_MAPPINGS = [...IMAGE_MODEL_MAPPINGS, ...VIDEO_MODEL_MAPPINGS]

export const MODEL_TO_TOOL_MAP: Record<string, string> = ALL_MODEL_MAPPINGS.reduce(
  (acc, model) => {
    acc[model.id] = model.toolId
    return acc
  },
  {} as Record<string, string>
)

export function getModelById(modelId: string): ModelMapping | undefined {
  return ALL_MODEL_MAPPINGS.find((m) => m.id === modelId)
}

export function getToolIdByModelId(modelId: string): string | undefined {
  return MODEL_TO_TOOL_MAP[modelId]
}

export function getAvailableImageModels(): ModelMapping[] {
  return IMAGE_MODEL_MAPPINGS.filter((m) => m.isAvailable)
}

export function getAvailableVideoModels(): ModelMapping[] {
  return VIDEO_MODEL_MAPPINGS.filter((m) => m.isAvailable)
}

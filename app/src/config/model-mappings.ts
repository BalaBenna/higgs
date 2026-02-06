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
    toolId: 'generate_image_by_gpt_image_openai',
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
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'Google',
    toolId: 'generate_image_by_nano_banana_fal',
    type: 'image',
    isAvailable: true,
  },
  // ByteDance Models
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    provider: 'ByteDance',
    toolId: 'generate_image_by_seedream_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'seedream-4.0',
    name: 'Seedream 4.0',
    provider: 'ByteDance',
    toolId: 'generate_image_by_seedream_fal',
    type: 'image',
    isAvailable: true,
  },
  // Black Forest Labs FLUX
  {
    id: 'flux-2-pro',
    name: 'FLUX.2 Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux2_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-2-max',
    name: 'FLUX.2 Max',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux2_max_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-kontext-max',
    name: 'FLUX Kontext Max',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_max_fal',
    type: 'image',
    isAvailable: true,
  },
  // Third Party Models
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    toolId: 'generate_image_by_midjourney_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'ideogram-3',
    name: 'Ideogram 3',
    provider: 'Ideogram',
    toolId: 'generate_image_by_ideogram_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    provider: 'Recraft',
    toolId: 'generate_image_by_recraft_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'reve',
    name: 'Reve',
    provider: 'Reve AI',
    toolId: 'generate_image_by_reve_fal',
    type: 'image',
    isAvailable: true,
  },
  // Higgsfield
  {
    id: 'higgsfield-soul',
    name: 'Higgsfield Soul',
    provider: 'Higgsfield',
    toolId: 'generate_image_by_higgsfield_soul_fal',
    type: 'image',
    isAvailable: true,
  },
  // Other Models
  {
    id: 'z-image',
    name: 'Z-Image',
    provider: 'Various',
    toolId: 'generate_image_by_z_image_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'kling-q1-image',
    name: 'Kling Q1 Image',
    provider: 'Kuaishou',
    toolId: 'generate_image_by_kling_image_fal',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'wan-2.0-image',
    name: 'Wan 2.0 Image',
    provider: 'Alibaba',
    toolId: 'generate_image_by_wan_image_fal',
    type: 'image',
    isAvailable: true,
  },
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
  // Kuaishou Kling Models
  {
    id: 'kling-3.0',
    name: 'Kling 3.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_fal',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-2.6',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_fal',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-motion-control',
    name: 'Kling Motion Control',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_motion_fal',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'kling-avatars-2.0',
    name: 'Kling Avatars 2.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_avatars_fal',
    type: 'video',
    isAvailable: true,
  },
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
  // ByteDance Seedance
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'ByteDance',
    toolId: 'generate_video_by_seedance_fal',
    type: 'video',
    isAvailable: true,
  },
  // Alibaba Wan
  {
    id: 'wan-2.6',
    name: 'Wan 2.6',
    provider: 'Alibaba',
    toolId: 'generate_video_by_wan_fal',
    type: 'video',
    isAvailable: true,
  },
  // MiniMax Hailuo
  {
    id: 'hailuo-02',
    name: 'MiniMax Hailuo 02',
    provider: 'MiniMax',
    toolId: 'generate_video_by_hailuo_fal',
    type: 'video',
    isAvailable: true,
  },
  // Higgsfield DOP
  {
    id: 'higgsfield-dop',
    name: 'Higgsfield DOP',
    provider: 'Higgsfield',
    toolId: 'generate_video_by_higgsfield_dop_fal',
    type: 'video',
    isAvailable: true,
  },
  // xAI Grok
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'xAI',
    toolId: 'generate_video_by_grok_fal',
    type: 'video',
    isAvailable: true,
  },
]

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

export interface ModelMapping {
  id: string
  name: string
  provider: string
  toolId: string
  type: 'image' | 'video'
  isAvailable: boolean
}

export const IMAGE_MODEL_MAPPINGS: ModelMapping[] = [
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    toolId: 'generate_image_by_gpt_image_1_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'imagen-3',
    name: 'Imagen 3',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_4_jaaz',
    type: 'image',
    isAvailable: true,
  },
  // Models below require jaaz API subscription
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    provider: 'ByteDance',
    toolId: 'generate_image_by_doubao_seedream_3_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'flux-2',
    name: 'FLUX.2',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_max_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    toolId: 'generate_image_by_midjourney_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'ideogram-3',
    name: 'Ideogram 3',
    provider: 'Ideogram',
    toolId: 'generate_image_by_ideogram3_bal_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    provider: 'Recraft',
    toolId: 'generate_image_by_recraft_v3_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'flux-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_pro_jaaz',
    type: 'image',
    isAvailable: false,
  },
  // Coming Soon models
  {
    id: 'higgsfield-soul',
    name: 'Higgsfield Soul',
    provider: 'Higgsfield',
    toolId: 'generate_image_by_higgsfield_soul_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'higgsfield-popcorn',
    name: 'Higgsfield Popcorn',
    provider: 'Higgsfield',
    toolId: 'generate_image_by_higgsfield_popcorn_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'Nano',
    toolId: 'generate_image_by_nano_banana_pro_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'z-image',
    name: 'Z-Image',
    provider: 'Various',
    toolId: 'generate_image_by_z_image_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'kling-q1-image',
    name: 'Kling Q1 Image',
    provider: 'Kuaishou',
    toolId: 'generate_image_by_kling_q1_image_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'wan-2.2-image',
    name: 'Wan 2.2 Image',
    provider: 'Alibaba',
    toolId: 'generate_image_by_wan_2_2_image_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'reve',
    name: 'Reve',
    provider: 'Reve',
    toolId: 'generate_image_by_reve_jaaz',
    type: 'image',
    isAvailable: false,
  },
  {
    id: 'topaz',
    name: 'Topaz',
    provider: 'Topaz Labs',
    toolId: 'generate_image_by_topaz_jaaz',
    type: 'image',
    isAvailable: false,
  },
]

export const VIDEO_MODEL_MAPPINGS: ModelMapping[] = [
  {
    id: 'kling-2.6',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_v2_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    provider: 'Google',
    toolId: 'generate_video_by_veo3_fast_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'ByteDance',
    toolId: 'generate_video_by_seedance_v1_jaaz',
    type: 'video',
    isAvailable: true,
  },
  {
    id: 'hailuo-o2',
    name: 'Minimax Hailuo O2',
    provider: 'MiniMax',
    toolId: 'generate_video_by_hailuo_02_jaaz',
    type: 'video',
    isAvailable: true,
  },
  // Coming Soon models
  {
    id: 'higgsfield-dop',
    name: 'Higgsfield DOP',
    provider: 'Higgsfield',
    toolId: 'generate_video_by_higgsfield_dop_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'xAI',
    toolId: 'generate_video_by_grok_imagine_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'kling-3.0',
    name: 'Kling 3.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_3_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'kling-motion-control',
    name: 'Kling Motion Control',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_motion_control_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    toolId: 'generate_video_by_sora_2_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'wan-2.6',
    name: 'Wan 2.6',
    provider: 'Alibaba',
    toolId: 'generate_video_by_wan_2_6_jaaz',
    type: 'video',
    isAvailable: false,
  },
  {
    id: 'kling-avatars-2.0',
    name: 'Kling Avatars 2.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_avatars_2_jaaz',
    type: 'video',
    isAvailable: false,
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

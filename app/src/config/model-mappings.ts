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
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    provider: 'OpenAI',
    toolId: 'generate_image_by_gpt_image_1_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    provider: 'ByteDance',
    toolId: 'generate_image_by_doubao_seedream_3_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-2',
    name: 'FLUX.2',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_max_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    provider: 'Google',
    toolId: 'generate_image_by_imagen_4_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    toolId: 'generate_image_by_midjourney_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'ideogram-3',
    name: 'Ideogram 3',
    provider: 'Ideogram',
    toolId: 'generate_image_by_ideogram3_bal_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    provider: 'Recraft',
    toolId: 'generate_image_by_recraft_v3_jaaz',
    type: 'image',
    isAvailable: true,
  },
  {
    id: 'flux-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest Labs',
    toolId: 'generate_image_by_flux_kontext_pro_jaaz',
    type: 'image',
    isAvailable: true,
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

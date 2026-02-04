'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MODEL_TO_TOOL_MAP, getModelById } from '@/config/model-mappings'

interface GenerationParams {
  model: string
  prompt: string
  negativePrompt?: string
  aspectRatio?: string
  numImages?: number
  guidanceScale?: number
  style?: string
}

interface VideoGenerationParams {
  model: string
  prompt: string
  duration?: number
  aspectRatio?: string
  resolution?: string
  motionStrength?: number
  sourceImage?: File | null
}

interface GenerationResult {
  id: string
  type: 'image' | 'video'
  url: string
  prompt: string
  model: string
  createdAt: string
}

async function generateContent(
  endpoint: string,
  params: Record<string, unknown>
): Promise<GenerationResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Generation failed')
  }

  return response.json()
}

export function useImageGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: GenerationParams) => {
      const toolId = MODEL_TO_TOOL_MAP[params.model]
      if (!toolId) {
        throw new Error(`No tool mapping found for model: ${params.model}`)
      }

      const model = getModelById(params.model)

      return generateContent('/api/generate/image', {
        tool: toolId,
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        aspect_ratio: params.aspectRatio,
        num_images: params.numImages || 1,
        guidance_scale: params.guidanceScale,
        style: params.style,
        model_name: model?.name,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}

export function useVideoGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: VideoGenerationParams) => {
      const toolId = MODEL_TO_TOOL_MAP[params.model]
      if (!toolId) {
        throw new Error(`No tool mapping found for model: ${params.model}`)
      }

      const model = getModelById(params.model)

      const formData = new FormData()
      formData.append('tool', toolId)
      formData.append('prompt', params.prompt)
      if (params.duration) formData.append('duration', String(params.duration))
      if (params.aspectRatio) formData.append('aspect_ratio', params.aspectRatio)
      if (params.resolution) formData.append('resolution', params.resolution)
      if (params.motionStrength)
        formData.append('motion_strength', String(params.motionStrength))
      if (params.sourceImage) formData.append('source_image', params.sourceImage)
      if (model?.name) formData.append('model_name', model.name)

      const response = await fetch('/api/generate/video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Video generation failed')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}

export function useChatGeneration() {
  return useMutation({
    mutationFn: async (params: {
      message: string
      sessionId?: string
    }) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          session_id: params.sessionId,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Chat request failed')
      }

      return response.json()
    },
  })
}

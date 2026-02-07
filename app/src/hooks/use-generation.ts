'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MODEL_TO_TOOL_MAP, getModelById } from '@/config/model-mappings'
import { getAuthHeaders } from '@/lib/auth-headers'

interface GenerationParams {
  model: string
  prompt: string
  negativePrompt?: string
  aspectRatio?: string
  numImages?: number
  guidanceScale?: number
  style?: string
  inputImages?: string[]
}

interface VideoGenerationParams {
  model: string
  prompt: string
  duration?: number
  aspectRatio?: string
  resolution?: string
  motionStrength?: number
  sourceImage?: File | null
  // Kling-specific params
  negativePrompt?: string
  cfgScale?: number
  guidanceScale?: number
  generateAudio?: boolean
  mode?: string
  endImage?: File | null
  audioFile?: File | null
  videoFile?: File | null
  voiceId?: string
  voiceSpeed?: number
  lipSyncText?: string
}

interface GenerationResult {
  id: string
  type: 'image' | 'video'
  url: string
  src?: string
  prompt: string
  model: string
  createdAt: string
}

interface ImageGenerationResponse {
  images: GenerationResult[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateContent<T = any>(
  endpoint: string,
  params: Record<string, unknown>
): Promise<T> {
  const authHeaders = await getAuthHeaders()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    let errorMsg = 'Generation failed'
    try {
      // Read body as text first to avoid stream consumption issues
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        errorMsg = errorData.detail || errorData.message || errorMsg
      } catch {
        // Not JSON, use text directly
        errorMsg = errorText || errorMsg
      }
    } catch {
      // Fallback if text() also fails
    }
    throw new Error(errorMsg)
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

      return generateContent<ImageGenerationResponse>('/api/generate/image', {
        tool: toolId,
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        aspect_ratio: params.aspectRatio,
        num_images: params.numImages || 1,
        guidance_scale: params.guidanceScale,
        style: params.style,
        model_name: model?.name,
        input_images: params.inputImages,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
      queryClient.invalidateQueries({ queryKey: ['my-content'] })
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
      const authHeaders = await getAuthHeaders()

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
      // Kling-specific params
      if (params.negativePrompt) formData.append('negative_prompt', params.negativePrompt)
      if (params.cfgScale !== undefined)
        formData.append('cfg_scale', String(params.cfgScale))
      if (params.guidanceScale !== undefined)
        formData.append('guidance_scale', String(params.guidanceScale))
      if (params.generateAudio !== undefined)
        formData.append('generate_audio', String(params.generateAudio))
      if (params.mode) formData.append('mode', params.mode)
      if (params.endImage) formData.append('end_image', params.endImage)
      if (params.audioFile) formData.append('audio_file', params.audioFile)
      if (params.videoFile) formData.append('video_file', params.videoFile)
      if (params.voiceId) formData.append('voice_id', params.voiceId)
      if (params.voiceSpeed !== undefined)
        formData.append('voice_speed', String(params.voiceSpeed))
      if (params.lipSyncText) formData.append('lip_sync_text', params.lipSyncText)

      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (!response.ok) {
        let errorMsg = 'Video generation failed'
        try {
          // Read body as text first to avoid stream consumption issues
          const errorText = await response.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMsg = errorData.detail || errorData.message || errorMsg
          } catch {
            // Not JSON, use text directly
            errorMsg = errorText || errorMsg
          }
        } catch {
          // Fallback if text() also fails
        }
        throw new Error(errorMsg)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
      queryClient.invalidateQueries({ queryKey: ['my-content'] })
    },
  })
}

export function useChatGeneration() {
  return useMutation({
    mutationFn: async (params: { message: string; sessionId?: string }) => {
      const authHeaders = await getAuthHeaders()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
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

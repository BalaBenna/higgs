'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthHeaders } from '@/lib/auth-headers'

interface FeatureGenerationParams {
  featureType: string
  inputImages?: string[]
  prompt?: string
  params?: Record<string, string | number>
}

interface FeatureResult {
  id: string
  type: string
  url: string
  src: string
  prompt: string
  feature_type: string
  createdAt: string
}

export function useFeatureGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: FeatureGenerationParams): Promise<FeatureResult> => {
      const authHeaders = await getAuthHeaders()

      const response = await fetch('/api/generate/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          feature_type: params.featureType,
          input_images: params.inputImages || [],
          prompt: params.prompt || '',
          params: params.params || {},
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Feature generation failed'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = (await response.text()) || errorMsg
        }
        throw new Error(errorMsg)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}

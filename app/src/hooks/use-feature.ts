'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRequiredAuthHeaders } from '@/lib/auth-headers'

interface FeatureGenerationParams {
  featureType: string
  inputImages?: string[]
  prompt?: string
  params?: Record<string, string | number | boolean>
  toolId?: string
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
      const authHeaders = await getRequiredAuthHeaders()

      console.log('[Feature] Sending request:', params.featureType, params.params)

      // Call the backend directly (bypass the Next.js proxy) to avoid
      // Next.js killing the handler for long-running operations like upscale.
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const url = `${backendUrl}/api/generate/feature`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          feature_type: params.featureType,
          input_images: params.inputImages || [],
          prompt: params.prompt || '',
          params: params.params || {},
          ...(params.toolId ? { tool_id: params.toolId } : {}),
        }),
      })

      console.log('[Feature] Response status:', response.status)

      if (!response.ok) {
        let errorMsg = 'Feature generation failed'
        try {
          const errorText = await response.text()
          console.log('[Feature] Error response body:', errorText)
          try {
            const errorData = JSON.parse(errorText)
            errorMsg = errorData.detail || errorData.message || errorMsg
          } catch {
            errorMsg = errorText || errorMsg
          }
        } catch { }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      console.log('[Feature] Success response:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
      queryClient.invalidateQueries({ queryKey: ['my-content'] })
    },
  })
}

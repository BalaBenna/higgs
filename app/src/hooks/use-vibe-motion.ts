'use client'

import { useMutation } from '@tanstack/react-query'
import { buildSystemPrompt } from '@/lib/remotion/system-prompt'
import type { MotionGenerationParams } from '@/lib/remotion/types'
import { THEME_DATA } from '@/lib/remotion/types'

interface GenerationCallbacks {
  onCodeUpdate?: (code: string) => void
}

export function useVibeMotionGeneration(callbacks?: GenerationCallbacks) {
  return useMutation({
    mutationFn: async (params: MotionGenerationParams) => {
      const themeColors =
        params.themeColors ??
        THEME_DATA.find((t) => t.id === params.theme)?.colors

      const systemPrompt = buildSystemPrompt({
        preset: params.preset,
        style: params.style,
        themeColors,
        duration: params.duration,
        mediaUrls: params.mediaUrls,
      })

      const response = await fetch('/api/generate/motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: params.prompt,
          system_prompt: systemPrompt,
          preset: params.preset,
          style: params.style,
          theme: params.theme,
          duration: params.duration,
          media_urls: params.mediaUrls,
          model: params.model,
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Motion generation failed'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = (await response.text()) || errorMsg
        }
        throw new Error(errorMsg)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream available')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr)

            if (event.type === 'delta' && event.content) {
              accumulated += event.content
              callbacks?.onCodeUpdate?.(accumulated)
            } else if (event.type === 'error') {
              throw new Error(event.content || 'Generation error')
            }
            // type === 'done' means stream ended
          } catch (parseErr) {
            // Skip malformed SSE lines
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }

      return { code: accumulated }
    },
  })
}

export function useMotionMediaUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/generate/motion/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMsg = 'File upload failed'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorMsg
        } catch {
          errorMsg = (await response.text()) || errorMsg
        }
        throw new Error(errorMsg)
      }

      return response.json() as Promise<{ file_id: string; url: string }>
    },
  })
}

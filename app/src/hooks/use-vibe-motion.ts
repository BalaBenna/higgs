'use client'

import { useMutation } from '@tanstack/react-query'
import { buildSystemPrompt } from '@/lib/remotion/system-prompt'
import type { MotionGenerationParams } from '@/lib/remotion/types'
import { ASPECT_RATIO_DATA, THEME_DATA } from '@/lib/remotion/types'

interface GenerationCallbacks {
  onCodeUpdate?: (code: string) => void
}

export function useVibeMotionGeneration(callbacks?: GenerationCallbacks) {
  return useMutation({
    mutationFn: async (params: MotionGenerationParams) => {
      const themeColors =
        params.themeColors ??
        THEME_DATA.find((t) => t.id === params.theme)?.colors

      const ratioData = ASPECT_RATIO_DATA.find((r) => r.id === params.aspectRatio)

      const systemPrompt = buildSystemPrompt({
        preset: params.preset,
        style: params.style,
        themeColors,
        duration: params.duration,
        mediaUrls: params.mediaUrls,
        width: ratioData?.width,
        height: ratioData?.height,
        aspectRatio: params.aspectRatio,
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
          aspect_ratio: params.aspectRatio,
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Motion generation failed'
        try {
          const errorText = await response.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMsg = errorData.detail || errorData.message || errorMsg
          } catch {
            errorMsg = errorText || errorMsg
          }
        } catch {}
        throw new Error(errorMsg)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream available')

      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      function processLine(line: string) {
        if (!line.startsWith('data: ')) return
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) return

        const event = JSON.parse(jsonStr)

        if (event.type === 'delta' && event.content) {
          accumulated += event.content
          callbacks?.onCodeUpdate?.(accumulated)
        } else if (event.type === 'error') {
          throw new Error(event.content || 'Generation error')
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = (buffer + chunk).split('\n')

        // Last element may be an incomplete line — keep it in the buffer
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          try {
            processLine(line)
          } catch (parseErr) {
            // Skip malformed SSE lines
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        try {
          processLine(buffer)
        } catch {
          // Ignore trailing partial data
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
          const errorText = await response.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMsg = errorData.detail || errorMsg
          } catch {
            errorMsg = errorText || errorMsg
          }
        } catch {}
        throw new Error(errorMsg)
      }

      return response.json() as Promise<{ file_id: string; url: string }>
    },
  })
}

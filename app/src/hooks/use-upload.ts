'use client'

import { useState, useCallback, useRef } from 'react'
import { getAuthHeaders } from '@/lib/auth-headers'

interface UploadResult {
  filename: string
  url: string
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true)
    try {
      const authHeaders = await getAuthHeaders()

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload_image', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const result = {
        filename: data.filename || data.file_id || '',
        url: data.url || `/api/file/${data.filename || data.file_id}`,
      }
      setFilename(result.filename)
      return result
    } catch {
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return null

      // Create preview
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      return upload(file)
    },
    [upload]
  )

  const clear = useCallback(() => {
    setPreview(null)
    setFilename(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    isUploading,
    preview,
    filename,
    fileInputRef,
    upload,
    handleFileSelect,
    clear,
    openFilePicker,
  }
}

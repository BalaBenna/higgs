'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-headers'

interface UploadResult {
  filename: string
  url: string
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null!)
  const dragCounterRef = useRef(0)

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true)
    try {
      const authHeaders = await getAuthHeaders()

      const formData = new FormData()
      formData.append('file', file)

      console.log('[UPLOAD] Starting upload:', file.name, file.size, 'bytes')
      const response = await fetch('/api/upload_image', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error('[UPLOAD] Failed:', response.status, errText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('[UPLOAD] Success:', data)
      const result = {
        filename: data.filename || data.file_id || '',
        url: data.url || `/api/file/${data.filename || data.file_id}`,
      }
      setFilename(result.filename)
      setUrl(result.url)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
      return upload(file)
    },
    [upload]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return null
      return processFile(file)
    },
    [processFile]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (!file) return null
      return processFile(file)
    },
    [processFile]
  )

  const clear = useCallback(() => {
    setPreview(null)
    setFilename(null)
    setUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const dropZoneProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  }

  return {
    isUploading,
    isDragging,
    preview,
    filename,
    url,
    fileInputRef,
    upload,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    dropZoneProps,
    clear,
    openFilePicker,
  }
}

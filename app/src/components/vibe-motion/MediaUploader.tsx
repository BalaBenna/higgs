'use client'

import { useRef, useState } from 'react'
import { Upload, X, ImageIcon, FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaFile {
  file: File
  preview: string
  url?: string
}

interface MediaUploaderProps {
  files: MediaFile[]
  onFilesChange: (files: MediaFile[]) => void
  onUpload: (file: File) => Promise<{ url: string }>
  isUploading?: boolean
}

export function MediaUploader({
  files,
  onFilesChange,
  onUpload,
  isUploading,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = async (fileList: FileList) => {
    const newFiles: MediaFile[] = []
    for (const file of Array.from(fileList)) {
      const preview = URL.createObjectURL(file)
      newFiles.push({ file, preview })
    }
    let current = [...files, ...newFiles]
    onFilesChange(current)

    // Upload each file
    for (const mf of newFiles) {
      try {
        const result = await onUpload(mf.file)
        current = current.map((f) =>
          f.preview === mf.preview ? { ...f, url: result.url } : f
        )
        onFilesChange(current)
      } catch {
        // Upload error handled by parent
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    onFilesChange(updated)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Upload Media</label>

      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((mf, i) => (
            <div
              key={i}
              className="relative h-16 w-16 rounded-lg overflow-hidden border border-border"
            >
              {mf.file.type.startsWith('video/') ? (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <FileVideo className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <img
                  src={mf.preview}
                  alt="Upload preview"
                  className="h-full w-full object-cover"
                />
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-neon bg-neon/5'
            : 'border-border hover:border-neon/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <span>
                <ImageIcon className="h-4 w-4" />
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isUploading
              ? 'Uploading...'
              : 'Add images, videos, or files to your project'}
          </p>
        </div>
      </div>
    </div>
  )
}

export type { MediaFile }

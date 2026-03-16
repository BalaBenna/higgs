'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ImageIcon, Video, FileAudio, Loader2, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-headers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type MediaType = 'image' | 'video' | 'audio'

interface LibraryItem {
  url: string
  id?: string
  name?: string
  prompt?: string
  type?: string
}

interface MediaLibraryPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string, name?: string) => void
  mediaType: MediaType
}

const MEDIA_LABELS: Record<MediaType, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
}

const MEDIA_ICONS: Record<MediaType, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: FileAudio,
}

function resolveUrl(item: Record<string, unknown>): string {
  return (
    (item.public_url as string) ||
    ((item.metadata as Record<string, unknown>)?.public_url as string) ||
    (item.storage_path
      ? (item.storage_path as string).startsWith('http')
        ? (item.storage_path as string)
        : `/api/file/${item.storage_path}`
      : '') ||
    ''
  )
}

function isMediaType(name: string, type: MediaType): boolean {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (type === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
  if (type === 'video') return ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)
  if (type === 'audio') return ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)
  return false
}

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  mediaType,
}: MediaLibraryPickerProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | undefined>()
  const [generated, setGenerated] = useState<LibraryItem[]>([])
  const [uploads, setUploads] = useState<LibraryItem[]>([])
  const [loadingGenerated, setLoadingGenerated] = useState(false)
  const [loadingUploads, setLoadingUploads] = useState(false)
  const [tab, setTab] = useState('generated')

  const Icon = MEDIA_ICONS[mediaType]

  const fetchGenerated = useCallback(async () => {
    setLoadingGenerated(true)
    try {
      const headers = await getAuthHeaders()
      const contentType = mediaType === 'audio' ? '' : mediaType
      const res = await fetch(
        `/api/my-content?type=${contentType}&limit=100`,
        { headers },
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setGenerated(
        (data.items || [])
          .filter((item: Record<string, unknown>) => {
            const url = resolveUrl(item)
            return url && url.length > 0
          })
          .map((item: Record<string, unknown>) => ({
            url: resolveUrl(item),
            id: item.id as string,
            name: (item.filename as string) || (item.storage_path as string)?.split('/').pop() || '',
            prompt: (item.prompt as string) || '',
            type: item.type as string,
          })),
      )
    } catch {
      setGenerated([])
    } finally {
      setLoadingGenerated(false)
    }
  }, [mediaType])

  const fetchUploads = useCallback(async () => {
    setLoadingUploads(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/uploads?limit=100', { headers })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUploads(
        (data.items || [])
          .filter((item: Record<string, unknown>) => {
            const name = (item.name as string) || ''
            return isMediaType(name, mediaType)
          })
          .map((item: Record<string, unknown>) => ({
            url: item.url as string,
            name: item.name as string,
          })),
      )
    } catch {
      setUploads([])
    } finally {
      setLoadingUploads(false)
    }
  }, [mediaType])

  useEffect(() => {
    if (open) {
      setSelected(null)
      setSelectedName(undefined)
      fetchGenerated()
      fetchUploads()
    }
  }, [open, fetchGenerated, fetchUploads])

  const handleSelect = (url: string, name?: string) => {
    if (selected === url) {
      setSelected(null)
      setSelectedName(undefined)
    } else {
      setSelected(url)
      setSelectedName(name)
    }
  }

  const handleDeleteGenerated = async (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.id) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/my-content/${item.id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Delete failed')
      setGenerated((prev) => prev.filter((g) => g.id !== item.id))
      if (selected === item.url) setSelected(null)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleDeleteUpload = async (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.name) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/uploads/${encodeURIComponent(item.name)}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Delete failed')
      setUploads((prev) => prev.filter((u) => u.name !== item.name))
      if (selected === item.url) setSelected(null)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected, selectedName)
      onOpenChange(false)
    }
  }

  const renderGrid = (
    items: LibraryItem[],
    loading: boolean,
    onDelete: (item: LibraryItem, e: React.MouseEvent) => void,
  ) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Icon className="h-10 w-10 mb-2" />
          <p className="text-sm">No {MEDIA_LABELS[mediaType].toLowerCase()}s found</p>
        </div>
      )
    }

    if (mediaType === 'audio') {
      return (
        <div className="space-y-2">
          {items.map((item) => {
            const isSelected = selected === item.url
            return (
              <div
                key={item.url}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all group',
                  isSelected
                    ? 'border-[hsl(var(--neon))] bg-[hsl(var(--neon))]/5'
                    : 'border-border hover:border-muted-foreground/30',
                )}
                onClick={() => handleSelect(item.url, item.name)}
              >
                <FileAudio className={cn('h-5 w-5 flex-shrink-0', isSelected ? 'text-[hsl(var(--neon))]' : 'text-muted-foreground')} />
                <span className="text-sm truncate flex-1">{item.name || 'Audio file'}</span>
                {isSelected && (
                  <div className="bg-[hsl(var(--neon))] rounded-full p-0.5">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                )}
                <button
                  className="bg-red-600/80 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => onDelete(item, e)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className={cn(
        'grid gap-2',
        mediaType === 'video' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6',
      )}>
        {items.map((item) => {
          const isSelected = selected === item.url
          return (
            <div
              key={item.url}
              className={cn(
                'relative rounded-lg overflow-hidden border-2 transition-all group cursor-pointer',
                mediaType === 'video' ? 'aspect-video' : 'aspect-square',
                isSelected
                  ? 'border-[hsl(var(--neon))] ring-2 ring-[hsl(var(--neon))]/30'
                  : 'border-transparent hover:border-muted-foreground/30',
              )}
              onClick={() => handleSelect(item.url, item.name)}
            >
              {mediaType === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.name || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              {isSelected && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-[hsl(var(--neon))] rounded-full p-1">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                </div>
              )}
              <button
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => onDelete(item, e)}
                title="Delete"
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
              {item.prompt && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[10px] text-white/80 truncate">{item.prompt}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // For audio, skip generated tab (no generated audio content)
  const showGeneratedTab = mediaType !== 'audio'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose {MEDIA_LABELS[mediaType]} from Library</DialogTitle>
          <DialogDescription>
            Select a {MEDIA_LABELS[mediaType].toLowerCase()} from your library
          </DialogDescription>
        </DialogHeader>

        {showGeneratedTab ? (
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex-1 min-h-0 flex flex-col"
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="generated" className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                Generated
              </TabsTrigger>
              <TabsTrigger value="uploads" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Uploads
              </TabsTrigger>
            </TabsList>

            <div
              className="flex-1 min-h-0 mt-2 overflow-y-auto pr-1"
              style={{ maxHeight: 'calc(85vh - 210px)' }}
            >
              <TabsContent value="generated" className="mt-0">
                {renderGrid(generated, loadingGenerated, handleDeleteGenerated)}
              </TabsContent>
              <TabsContent value="uploads" className="mt-0">
                {renderGrid(uploads, loadingUploads, handleDeleteUpload)}
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div
            className="flex-1 min-h-0 overflow-y-auto pr-1"
            style={{ maxHeight: 'calc(85vh - 210px)' }}
          >
            {renderGrid(uploads, loadingUploads, handleDeleteUpload)}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {selected ? '1 selected' : 'None selected'}
          </p>
          <Button variant="neon" disabled={!selected} onClick={handleConfirm}>
            Use Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

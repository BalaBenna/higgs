'use client'

import { useState, useEffect } from 'react'
import { ImageIcon, Video, Trash2, Calendar, Wand2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider'
import { getAuthHeaders } from '@/lib/auth-headers'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface ContentItem {
  id: string
  type: 'image' | 'video'
  filename: string
  public_url: string
  storage_path?: string
  prompt: string
  model: string
  provider: string
  aspect_ratio: string
  width: number
  height: number
  created_at: string
  metadata?: {
    public_url?: string
    feature_type?: string
    input_images?: string[]
  }
}

function resolveMediaUrl(item: ContentItem): string {
  if (item.public_url) return item.public_url
  if (item.metadata?.public_url) return item.metadata.public_url
  if (item.storage_path?.startsWith('/api/file/')) return item.storage_path
  if (item.storage_path && !item.storage_path.startsWith('http')) {
    return `/api/file/${item.storage_path}`
  }
  return item.storage_path || ''
}

function formatCreatedAt(dateValue?: string): string {
  if (!dateValue) return 'Unknown date'
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return 'Unknown date'
  return parsed.toLocaleDateString()
}

export default function MyContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  const fetchContent = async () => {
    setLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const typeParam = filter !== 'all' ? `?type=${filter}` : ''
      const response = await fetch(`/api/my-content${typeParam}`, {
        headers: authHeaders,
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to fetch content')
      }
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [filter])

  const handleDelete = async (id: string) => {
    try {
      const authHeaders = await getAuthHeaders()
      const response = await fetch(`/api/my-content/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!response.ok) throw new Error('Failed to delete')
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success('Content deleted')
    } catch {
      toast.error('Failed to delete content')
    }
  }

  const handleDownload = async (item: ContentItem) => {
    const url = resolveMediaUrl(item)
    if (!url) return
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = item.type === 'video' ? 'mp4' : 'png'
      const filename = item.filename || `${item.id}.${ext}`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast.error('Failed to download')
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Content</h1>
          <p className="mt-1 text-muted-foreground">
            Your generated images and videos
          </p>
        </div>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'image' | 'video')}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Images
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60">
          <Wand2 className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No content yet. Start generating!</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const mediaUrl = resolveMediaUrl(item)
              return (
                <div
                  key={item.id}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-border/80"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Media */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl}
                        alt={item.prompt || 'Generated image'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }}
                      />
                    )}
                    {/* Type badge */}
                    <Badge
                      className="absolute left-2 top-2 text-[10px]"
                      variant={item.type === 'video' ? 'default' : 'secondary'}
                    >
                      {item.type === 'video' ? (
                        <Video className="mr-1 h-3 w-3" />
                      ) : (
                        <ImageIcon className="mr-1 h-3 w-3" />
                      )}
                      {item.type}
                    </Badge>
                    {/* Action buttons */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(item)
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm text-foreground/90">
                      {item.prompt || 'No prompt'}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.model || item.provider}</span>
                      <span className="opacity-40">|</span>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatCreatedAt(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Enlarged view dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden">
          <VisuallyHidden.Root>
            <DialogTitle>Content preview</DialogTitle>
          </VisuallyHidden.Root>
          {selectedItem && (() => {
            const url = resolveMediaUrl(selectedItem)
            const isUpscale =
              (selectedItem.metadata?.feature_type === 'upscale' ||
                selectedItem.metadata?.feature_type === 'creative_upscale') &&
              selectedItem.metadata?.input_images?.length

            return (
              <div className="flex flex-col">
                {isUpscale ? (
                  <div className="p-4">
                    <ImageComparisonSlider
                      beforeSrc={selectedItem.metadata!.input_images![0]}
                      afterSrc={url}
                      beforeLabel="Original"
                      afterLabel="Upscaled"
                    />
                  </div>
                ) : selectedItem.type === 'video' ? (
                  <video
                    src={url}
                    className="w-full"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={selectedItem.prompt || 'Generated image'}
                    className="w-full h-auto"
                  />
                )}
                <div className="flex items-center justify-between border-t border-border p-3">
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {selectedItem.prompt || selectedItem.filename || 'Generated content'}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleDownload(selectedItem)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

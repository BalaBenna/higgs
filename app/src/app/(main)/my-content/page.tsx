'use client'

import { useState, useEffect } from 'react'
import { ImageIcon, Video, Trash2, Calendar, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAuthHeaders } from '@/lib/auth-headers'

interface ContentItem {
  id: string
  type: 'image' | 'video'
  filename: string
  public_url: string
  prompt: string
  model: string
  provider: string
  aspect_ratio: string
  width: number
  height: number
  created_at: string
}

export default function MyContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  const fetchContent = async () => {
    setLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const typeParam = filter !== 'all' ? `?type=${filter}` : ''
      const response = await fetch(`/api/my-content${typeParam}`, {
        headers: authHeaders,
      })
      if (!response.ok) throw new Error('Failed to fetch content')
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      toast.error('Failed to load content')
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
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-border/80"
              >
                {/* Media */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.public_url}
                      alt={item.prompt || 'Generated image'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.public_url}
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
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

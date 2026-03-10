'use client'

import { useState, useEffect, useCallback } from 'react'
import { ImageIcon, Download, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAuthHeaders } from '@/lib/auth-headers'

interface HistoryItem {
    id: string
    type: 'image' | 'video'
    storage_path?: string
    prompt: string
    model: string
    created_at: string
    public_url?: string
    metadata?: {
        public_url?: string
        feature_type?: string
        input_images?: string[]
    }
}

function resolveUrl(item: HistoryItem): string {
    if (item.public_url) return item.public_url
    if (item.metadata?.public_url) return item.metadata.public_url
    if (item.storage_path?.startsWith('/api/file/')) return item.storage_path
    if (item.storage_path && !item.storage_path.startsWith('http')) {
        return `/api/file/${item.storage_path}`
    }
    return item.storage_path || ''
}

function formatDate(dateValue?: string): string {
    if (!dateValue) return ''
    const d = new Date(dateValue)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function HistoryDialog({
    open,
    onOpenChange,
    featureType,
    contentType,
    title,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    featureType?: string
    contentType?: 'image' | 'video'
    title: string
}) {
    const [items, setItems] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(false)

    const fetchHistory = useCallback(async () => {
        setLoading(true)
        try {
            const headers = await getAuthHeaders()
            const params = new URLSearchParams()
            if (featureType) params.set('feature_type', featureType)
            if (contentType) params.set('type', contentType)
            const qs = params.toString()
            const res = await fetch(
                `/api/my-content${qs ? `?${qs}` : ''}`,
                { headers }
            )
            if (!res.ok) throw new Error('Failed to fetch history')
            const data = await res.json()
            setItems(data.items || [])
        } catch {
            toast.error('Failed to load history')
        } finally {
            setLoading(false)
        }
    }, [featureType, contentType])

    useEffect(() => {
        if (open) fetchHistory()
    }, [open, fetchHistory])

    const handleDownload = async (item: HistoryItem) => {
        const url = resolveUrl(item)
        if (!url) return
        try {
            const res = await fetch(url)
            const blob = await res.blob()
            const ext = item.type === 'video' ? 'mp4' : 'png'
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${item.id}.${ext}`
            a.click()
            URL.revokeObjectURL(a.href)
        } catch {
            toast.error('Failed to download')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogTitle>{title} History</DialogTitle>
                <ScrollArea className="h-[65vh]">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No history yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
                            {items.map((item) => {
                                const url = resolveUrl(item)
                                return (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-lg overflow-hidden border border-border bg-card"
                                    >
                                        {item.type === 'video' ? (
                                            <video
                                                src={url}
                                                className="w-full aspect-square object-cover"
                                                muted
                                                loop
                                                onMouseEnter={(e) => e.currentTarget.play()}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.pause()
                                                    e.currentTarget.currentTime = 0
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={url}
                                                alt={item.prompt || 'Generated'}
                                                className="w-full aspect-square object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            {item.prompt && (
                                                <p className="text-xs text-white line-clamp-2 mb-2">
                                                    {item.prompt}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-white/70 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(item.created_at)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-white hover:bg-white/20"
                                                    onClick={() => handleDownload(item)}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

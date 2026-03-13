'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ImageIcon, Loader2, Upload, Trash2 } from 'lucide-react'
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

interface LibraryImage {
    url: string
    id?: string
    name?: string
    prompt?: string
}

interface ImageLibraryPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (urls: string[]) => void
    maxSelect?: number
    currentCount?: number
}

export function ImageLibraryPicker({
    open,
    onOpenChange,
    onSelect,
    maxSelect = 5,
    currentCount = 0,
}: ImageLibraryPickerProps) {
    const remaining = maxSelect - currentCount
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [generated, setGenerated] = useState<LibraryImage[]>([])
    const [uploads, setUploads] = useState<LibraryImage[]>([])
    const [loadingGenerated, setLoadingGenerated] = useState(false)
    const [loadingUploads, setLoadingUploads] = useState(false)
    const [tab, setTab] = useState('generated')

    const fetchGenerated = useCallback(async () => {
        setLoadingGenerated(true)
        try {
            const headers = await getAuthHeaders()
            const res = await fetch('/api/my-content?type=image&limit=100', { headers })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setGenerated(
                (data.items || [])
                    .filter(
                        (item: Record<string, unknown>) =>
                            item.public_url ||
                            (item.metadata as Record<string, unknown>)?.public_url,
                    )
                    .map((item: Record<string, unknown>) => ({
                        url:
                            (item.public_url as string) ||
                            ((item.metadata as Record<string, unknown>)?.public_url as string) ||
                            '',
                        id: item.id as string,
                        name: (item.filename as string) || '',
                        prompt: (item.prompt as string) || '',
                    })),
            )
        } catch {
            setGenerated([])
        } finally {
            setLoadingGenerated(false)
        }
    }, [])

    const fetchUploads = useCallback(async () => {
        setLoadingUploads(true)
        try {
            const headers = await getAuthHeaders()
            const res = await fetch('/api/uploads?limit=100', { headers })
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setUploads(
                (data.items || []).map((item: Record<string, unknown>) => ({
                    url: item.url as string,
                    name: item.name as string,
                })),
            )
        } catch {
            setUploads([])
        } finally {
            setLoadingUploads(false)
        }
    }, [])

    useEffect(() => {
        if (open) {
            setSelected(new Set())
            fetchGenerated()
            fetchUploads()
        }
    }, [open, fetchGenerated, fetchUploads])

    const toggleSelect = (url: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(url)) {
                next.delete(url)
            } else if (next.size < remaining) {
                next.add(url)
            }
            return next
        })
    }

    const handleDeleteGenerated = async (img: LibraryImage, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!img.id) return
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`/api/my-content/${img.id}`, {
                method: 'DELETE',
                headers,
            })
            if (!res.ok) throw new Error('Delete failed')
            setGenerated((prev) => prev.filter((g) => g.id !== img.id))
            setSelected((prev) => {
                const next = new Set(prev)
                next.delete(img.url)
                return next
            })
            toast.success('Image deleted')
        } catch {
            toast.error('Failed to delete image')
        }
    }

    const handleDeleteUpload = async (img: LibraryImage, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!img.name) return
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`/api/uploads/${encodeURIComponent(img.name)}`, {
                method: 'DELETE',
                headers,
            })
            if (!res.ok) throw new Error('Delete failed')
            setUploads((prev) => prev.filter((u) => u.name !== img.name))
            setSelected((prev) => {
                const next = new Set(prev)
                next.delete(img.url)
                return next
            })
            toast.success('Image deleted')
        } catch {
            toast.error('Failed to delete image')
        }
    }

    const handleConfirm = () => {
        onSelect(Array.from(selected))
        onOpenChange(false)
    }

    const renderGrid = (
        images: LibraryImage[],
        loading: boolean,
        onDelete: (img: LibraryImage, e: React.MouseEvent) => void,
    ) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )
        }
        if (images.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm">No images found</p>
                </div>
            )
        }
        return (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {images.map((img) => {
                    const isSelected = selected.has(img.url)
                    const disabled = !isSelected && selected.size >= remaining
                    return (
                        <div
                            key={img.url}
                            className={cn(
                                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all group cursor-pointer',
                                isSelected
                                    ? 'border-[hsl(var(--neon))] ring-2 ring-[hsl(var(--neon))]/30'
                                    : 'border-transparent hover:border-muted-foreground/30',
                                disabled && !isSelected && 'opacity-40 cursor-not-allowed',
                            )}
                            onClick={() => !disabled && toggleSelect(img.url)}
                        >
                            <img
                                src={img.url}
                                alt={img.name || ''}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* Selection checkmark */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <div className="bg-[hsl(var(--neon))] rounded-full p-1">
                                        <Check className="h-4 w-4 text-black" />
                                    </div>
                                </div>
                            )}
                            {/* Delete button */}
                            <button
                                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => onDelete(img, e)}
                                title="Delete image"
                            >
                                <Trash2 className="h-3 w-3 text-white" />
                            </button>
                            {/* Prompt label */}
                            {img.prompt && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                    <p className="text-[10px] text-white/80 truncate">{img.prompt}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Choose from Library</DialogTitle>
                    <DialogDescription>
                        Select up to {remaining} image{remaining !== 1 ? 's' : ''} from your
                        library
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="flex-1 min-h-0 flex flex-col"
                >
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="generated" className="gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5" />
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

                <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                        {selected.size} selected · {remaining - selected.size} more available
                    </p>
                    <Button variant="neon" disabled={selected.size === 0} onClick={handleConfirm}>
                        Add {selected.size > 0 ? `${selected.size} ` : ''}Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

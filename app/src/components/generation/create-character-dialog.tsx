'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    useCharacters,
    useCreateCharacter,
    useAddCharacterImages,
    useGenerateCharacterPreviews,
} from '@/hooks/use-characters'

const STYLES = [
    'Realistic',
    'Anime',
    '3D',
    'Cartoon',
    'Cinematic',
    'Fantasy',
    'Cyberpunk',
    'Watercolor',
]

interface CreateCharacterDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** URL of the image to use as reference */
    referenceImageUrl: string
    /** Optional prompt to prefill */
    promptSuggestion?: string
}

export function CreateCharacterDialog({
    open,
    onOpenChange,
    referenceImageUrl,
    promptSuggestion,
}: CreateCharacterDialogProps) {
    const { data: characters = [] } = useCharacters()
    const createCharacter = useCreateCharacter()
    const addImages = useAddCharacterImages()
    const generatePreviews = useGenerateCharacterPreviews()

    const [tab, setTab] = useState<string>('new')
    const [name, setName] = useState('')
    const [style, setStyle] = useState('Realistic')
    const [description, setDescription] = useState(promptSuggestion || '')
    const [selectedCharacterId, setSelectedCharacterId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const reset = () => {
        setName('')
        setStyle('Realistic')
        setDescription(promptSuggestion || '')
        setSelectedCharacterId('')
        setTab('new')
    }

    const handleCreateNew = async () => {
        if (!name.trim()) {
            toast.error('Please enter a character name')
            return
        }
        setIsSubmitting(true)
        try {
            const character = await createCharacter.mutateAsync({
                name: name.trim(),
                style,
                description,
                reference_images: [referenceImageUrl],
            })
            onOpenChange(false)
            reset()
            toast.success(`Character "${character.name}" created!`)

            toast.info('Generating style previews…')
            generatePreviews.mutate(character.id, {
                onSuccess: () => toast.success('Preview images ready!'),
                onError: () => toast.error('Some previews failed to generate'),
            })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create character')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddToExisting = async () => {
        if (!selectedCharacterId) {
            toast.error('Please select a character')
            return
        }
        setIsSubmitting(true)
        try {
            await addImages.mutateAsync({
                characterId: selectedCharacterId,
                urls: [referenceImageUrl],
            })
            onOpenChange(false)
            reset()
            toast.success('Image added to character!')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to add image')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Character from Image</DialogTitle>
                </DialogHeader>

                {/* Preview */}
                <div className="flex justify-center">
                    <img
                        src={referenceImageUrl}
                        alt="Reference"
                        className="max-h-32 rounded-lg object-contain"
                    />
                </div>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Create New</TabsTrigger>
                        <TabsTrigger value="existing" disabled={characters.length === 0}>
                            Add to Existing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="new" className="space-y-3 mt-3">
                        <Input
                            placeholder="Character name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Select value={style} onValueChange={setStyle}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STYLES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Textarea
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[50px] resize-none"
                        />
                        <Button
                            variant="neon"
                            className="w-full gap-2"
                            onClick={handleCreateNew}
                            disabled={!name.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Create Character
                        </Button>
                    </TabsContent>

                    <TabsContent value="existing" className="space-y-3 mt-3">
                        <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a character" />
                            </SelectTrigger>
                            <SelectContent>
                                {characters.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} ({c.style})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="neon"
                            className="w-full gap-2"
                            onClick={handleAddToExisting}
                            disabled={!selectedCharacterId || isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Add to Character
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

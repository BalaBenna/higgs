'use client'

import { User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useCharacters, type Character } from '@/hooks/use-characters'

interface CharacterPickerProps {
    value: string | null
    onChange: (character: Character | null) => void
    className?: string
}

export function CharacterPicker({ value, onChange, className }: CharacterPickerProps) {
    const { data: characters = [] } = useCharacters()

    if (characters.length === 0) return null

    return (
        <Select
            value={value ?? 'none'}
            onValueChange={(v) => {
                if (v === 'none') {
                    onChange(null)
                } else {
                    const c = characters.find((ch) => ch.id === v)
                    if (c) onChange(c)
                }
            }}
        >
            <SelectTrigger className={className}>
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Character" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">No character</SelectItem>
                {characters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                            {(c.reference_images || [])[0]?.url ? (
                                <img
                                    src={c.reference_images[0].url}
                                    alt={c.name}
                                    className="h-5 w-5 rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{c.name}</span>
                            <span className="text-xs text-muted-foreground">({c.style})</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRequiredAuthHeaders } from '@/lib/auth-headers'

export interface CharacterRefImage {
    url: string
    filename: string
}

export interface Character {
    id: string
    user_id: string
    name: string
    style: string
    description: string
    reference_images: CharacterRefImage[]
    created_at: string
    updated_at: string
}

interface PreviewImage {
    url: string
    style: string
    prompt: string
    type?: string
}

interface PreviewResult {
    character_id: string
    media_type?: string
    images: PreviewImage[]
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useCharacters() {
    return useQuery<Character[]>({
        queryKey: ['characters'],
        queryFn: async () => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(`${backendUrl}/api/character/list`, { headers })
            if (!res.ok) throw new Error('Failed to load characters')
            return res.json()
        },
    })
}

export function useCharacter(characterId: string | null) {
    return useQuery<Character>({
        queryKey: ['characters', characterId],
        enabled: !!characterId,
        queryFn: async () => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(`${backendUrl}/api/character/${characterId}`, { headers })
            if (!res.ok) throw new Error('Character not found')
            return res.json()
        },
    })
}

export function useCharacterGenerations(characterId: string | null) {
    return useQuery({
        queryKey: ['character-generations', characterId],
        enabled: !!characterId,
        queryFn: async () => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(`${backendUrl}/api/character/${characterId}/generations`, {
                headers,
            })
            if (!res.ok) throw new Error('Failed to load generations')
            return res.json()
        },
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateCharacter() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            name: string
            style?: string
            description?: string
            reference_images?: string[]
        }): Promise<Character> => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(`${backendUrl}/api/character/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({
                    name: params.name,
                    style: params.style || 'Realistic',
                    description: params.description || '',
                    reference_images: params.reference_images || [],
                }),
            })
            if (!res.ok) {
                const err = await res.text()
                throw new Error(err || 'Failed to create character')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['characters'] })
        },
    })
}

export function useUpdateCharacter() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            characterId: string
            name?: string
            style?: string
            description?: string
            reference_images?: string[]
        }) => {
            const headers = await getRequiredAuthHeaders()
            const body: Record<string, unknown> = {}
            if (params.name !== undefined) body.name = params.name
            if (params.style !== undefined) body.style = params.style
            if (params.description !== undefined) body.description = params.description
            if (params.reference_images !== undefined) body.reference_images = params.reference_images

            const res = await fetch(`${backendUrl}/api/character/${params.characterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error('Failed to update character')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['characters'] })
        },
    })
}

export function useDeleteCharacter() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (characterId: string) => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(`${backendUrl}/api/character/${characterId}`, {
                method: 'DELETE',
                headers,
            })
            if (!res.ok) throw new Error('Failed to delete character')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['characters'] })
        },
    })
}

export function useAddCharacterImages() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { characterId: string; urls: string[] }) => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(
                `${backendUrl}/api/character/${params.characterId}/images`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({ urls: params.urls }),
                }
            )
            if (!res.ok) throw new Error('Failed to add images')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['characters'] })
        },
    })
}

export function useGenerateCharacterPreviews() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            characterId: string
            toolId?: string
            mediaType?: string
            prompt?: string
            aspectRatio?: string
        }): Promise<PreviewResult> => {
            const headers = await getRequiredAuthHeaders()
            const res = await fetch(
                `${backendUrl}/api/character/${params.characterId}/generate-previews`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: JSON.stringify({
                        tool_id: params.toolId,
                        media_type: params.mediaType || 'image',
                        prompt: params.prompt,
                        aspect_ratio: params.aspectRatio || '1:1',
                    }),
                },
            )
            if (!res.ok) {
                const err = await res.text()
                throw new Error(err || 'Preview generation failed')
            }
            return res.json()
        },
        onSuccess: (_data, params) => {
            queryClient.invalidateQueries({ queryKey: ['characters'] })
            queryClient.invalidateQueries({
                queryKey: ['character-generations', params.characterId],
            })
            queryClient.invalidateQueries({ queryKey: ['my-content'] })
        },
    })
}

// ---------------------------------------------------------------------------
// Available tools (models with valid API keys)
// ---------------------------------------------------------------------------

export function useAvailableTools() {
    return useQuery<Record<string, { type: string; provider: string }>>({
        queryKey: ['available-tools'],
        staleTime: 60_000,
        queryFn: async () => {
            const res = await fetch(`${backendUrl}/api/config/available-tools`)
            if (!res.ok) return {}
            return res.json()
        },
    })
}

'use client'

import { STYLE_DATA, type StyleId } from '@/lib/remotion/types'

const STYLE_DESCRIPTIONS: Record<StyleId, string> = {
  minimal: 'Clean, minimal design with whitespace',
  corporate: 'Professional, data-driven layouts',
  fashion: 'Bold editorial with dramatic flair',
  marketing: 'Vibrant, attention-grabbing motion',
}

const STYLE_GRADIENTS: Record<StyleId, string> = {
  minimal: 'from-gray-100 to-gray-300',
  corporate: 'from-blue-900 to-blue-700',
  fashion: 'from-pink-600 to-purple-800',
  marketing: 'from-orange-400 to-red-500',
}

interface StyleSelectorProps {
  value?: StyleId
  onChange: (style: StyleId) => void
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Style</label>
      <div className="grid grid-cols-2 gap-2">
        {STYLE_DATA.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={`relative rounded-lg border p-3 text-left transition-all hover:border-neon/50 ${
              value === style.id
                ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                : 'border-border bg-card hover:bg-accent/5'
            }`}
          >
            <div
              className={`mb-2 h-8 w-full rounded bg-gradient-to-r ${STYLE_GRADIENTS[style.id]}`}
            />
            <p className="text-sm font-medium">{style.label}</p>
            <p className="text-xs text-muted-foreground">
              {STYLE_DESCRIPTIONS[style.id]}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

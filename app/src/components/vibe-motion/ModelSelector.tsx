'use client'

import { MODEL_DATA, type ModelId } from '@/lib/remotion/types'

const MODEL_GRADIENTS: Record<ModelId, string> = {
  'gpt-4o': 'from-green-400 to-emerald-600',
  'gpt-4o-mini': 'from-green-300 to-teal-500',
  'gemini-2.5-pro': 'from-blue-400 to-indigo-600',
  'gemini-2.0-flash-exp': 'from-sky-400 to-blue-500',
  'grok-2': 'from-orange-400 to-red-500',
  'grok-2-vision': 'from-orange-300 to-red-400',
}

interface ModelSelectorProps {
  value: ModelId
  onChange: (model: ModelId) => void
  availableModelIds?: string[]
}

export function ModelSelector({ value, onChange, availableModelIds }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">AI Model</label>
      <div className="grid grid-cols-2 gap-2">
        {MODEL_DATA.map((model) => {
          const isAvailable = !availableModelIds || availableModelIds.includes(model.id)
          return (
            <button
              key={model.id}
              onClick={() => isAvailable && onChange(model.id)}
              disabled={!isAvailable}
              className={`relative rounded-lg border p-3 text-left transition-all ${
                !isAvailable
                  ? 'border-border/50 bg-card/50 opacity-50 cursor-not-allowed'
                  : value === model.id
                    ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                    : 'border-border bg-card hover:bg-accent/5 hover:border-neon/50'
              }`}
            >
              <div
                className={`mb-2 h-8 w-full rounded bg-gradient-to-r ${MODEL_GRADIENTS[model.id]} ${!isAvailable ? 'opacity-40' : ''}`}
              />
              <p className="text-sm font-medium">{model.label}</p>
              <p className="text-[11px] text-muted-foreground/70">{model.provider}</p>
              <p className="text-xs text-muted-foreground">{model.description}</p>
              {!isAvailable && (
                <p className="text-[10px] text-yellow-500/70 mt-1">API key required</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { MODEL_DATA, type ModelId } from '@/lib/remotion/types'

const MODEL_GRADIENTS: Record<ModelId, string> = {
  'gpt-4o': 'from-green-400 to-emerald-600',
  'gemini-2.5-pro': 'from-blue-400 to-indigo-600',
}

interface ModelSelectorProps {
  value: ModelId
  onChange: (model: ModelId) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">AI Model</label>
      <div className="grid grid-cols-2 gap-2">
        {MODEL_DATA.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`relative rounded-lg border p-3 text-left transition-all hover:border-neon/50 ${
              value === model.id
                ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                : 'border-border bg-card hover:bg-accent/5'
            }`}
          >
            <div
              className={`mb-2 h-8 w-full rounded bg-gradient-to-r ${MODEL_GRADIENTS[model.id]}`}
            />
            <p className="text-sm font-medium">{model.label}</p>
            <p className="text-[11px] text-muted-foreground/70">{model.provider}</p>
            <p className="text-xs text-muted-foreground">{model.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

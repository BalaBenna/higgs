'use client'

import { ASPECT_RATIO_DATA, type AspectRatioId } from '@/lib/remotion/types'

interface AspectRatioSelectorProps {
  value: AspectRatioId
  onChange: (ratio: AspectRatioId) => void
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Aspect Ratio</label>
      <div className="grid grid-cols-4 gap-2">
        {ASPECT_RATIO_DATA.map((ratio) => {
          const previewW = 40
          const previewH = (ratio.height / ratio.width) * previewW
          const maxH = 48
          const displayW = previewH > maxH ? (previewW * maxH) / previewH : previewW
          const displayH = previewH > maxH ? maxH : previewH

          return (
            <button
              key={ratio.id}
              onClick={() => onChange(ratio.id)}
              className={`relative rounded-lg border p-3 text-center transition-all hover:border-neon/50 ${
                value === ratio.id
                  ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                  : 'border-border bg-card hover:bg-accent/5'
              }`}
            >
              <div className="flex justify-center mb-2">
                <div
                  className="rounded border border-foreground/20 bg-foreground/5"
                  style={{ width: displayW, height: displayH }}
                />
              </div>
              <p className="text-xs font-medium">{ratio.label}</p>
              <p className="text-[10px] text-muted-foreground">{ratio.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'

const DURATION_OPTIONS = [
  { id: 0, label: 'Auto' },
  { id: 5, label: '5 sec' },
  { id: 10, label: '10 sec' },
  { id: 15, label: '15 sec' },
  { id: 30, label: '30 sec' },
]

interface DurationSelectorProps {
  value: number
  onChange: (duration: number) => void
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Duration</label>
      <div className="flex gap-2">
        {DURATION_OPTIONS.map((opt) => (
          <Button
            key={opt.id}
            variant={value === opt.id ? 'secondary' : 'outline'}
            size="sm"
            className={`flex-1 ${
              value === opt.id ? 'border-neon/50 bg-neon/10' : ''
            }`}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

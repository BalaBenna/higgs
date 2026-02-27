'use client'

import { TRANSITION_DATA, TRANSITION_DIRECTION_DATA, type TransitionId, type TransitionDirection } from '@/lib/remotion/types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface TransitionSelectorProps {
  value: TransitionId
  direction: TransitionDirection
  onChange: (transition: TransitionId) => void
  onDirectionChange: (direction: TransitionDirection) => void
}

export function TransitionSelector({ value, direction, onChange, onDirectionChange }: TransitionSelectorProps) {
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false)
  
  const selectedTransition = TRANSITION_DATA.find(t => t.id === value)
  const needsDirection = selectedTransition?.hasDirection

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Transition</label>
      <div className="grid grid-cols-3 gap-2">
        {TRANSITION_DATA.map((transition) => (
          <button
            key={transition.id}
            onClick={() => onChange(transition.id)}
            className={`rounded-lg border p-3 text-left transition-all hover:border-neon/50 ${
              value === transition.id
                ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                : 'border-border bg-card hover:bg-accent/5'
            }`}
          >
            <p className="text-sm font-medium">{transition.label}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-1">
              {transition.description}
            </p>
          </button>
        ))}
      </div>
      
      {needsDirection && (
        <div className="relative mt-2">
          <button
            onClick={() => setShowDirectionDropdown(!showDirectionDropdown)}
            className="w-full rounded-lg border border-border bg-card p-2.5 text-left text-sm flex items-center justify-between hover:border-neon/50 transition-all"
          >
            <span className="text-muted-foreground">Direction: </span>
            <span className="font-medium">{TRANSITION_DIRECTION_DATA.find(d => d.id === direction)?.label}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDirectionDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDirectionDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg z-10 overflow-hidden">
              {TRANSITION_DIRECTION_DATA.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => {
                    onDirectionChange(dir.id)
                    setShowDirectionDropdown(false)
                  }}
                  className={`w-full p-2.5 text-left text-sm hover:bg-accent/10 transition-colors ${
                    direction === dir.id ? 'bg-neon/10 text-neon' : ''
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

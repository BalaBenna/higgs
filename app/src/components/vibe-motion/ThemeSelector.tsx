'use client'

import { THEME_DATA, type ThemeId } from '@/lib/remotion/types'

interface ThemeSelectorProps {
  value?: ThemeId
  onChange: (theme: ThemeId) => void
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Theme</label>
      <div className="grid grid-cols-3 gap-2">
        {THEME_DATA.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`rounded-lg border p-3 text-center transition-all hover:border-neon/50 ${
              value === theme.id
                ? 'border-neon bg-neon/10 ring-1 ring-neon/30'
                : 'border-border bg-card hover:bg-accent/5'
            }`}
          >
            <div className="mb-2 flex justify-center gap-1">
              {[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.background].map(
                (color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
            <p className="text-xs font-medium">{theme.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

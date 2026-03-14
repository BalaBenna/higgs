'use client'

const DIRECTIONS = [
  { id: 'top', label: 'Top', azimuth: 0, elevation: 90 },
  { id: 'front', label: 'Front', azimuth: 0, elevation: 0 },
  { id: 'right', label: 'Right', azimuth: 90, elevation: 0 },
  { id: 'left', label: 'Left', azimuth: 270, elevation: 0 },
  { id: 'back', label: 'Back', azimuth: 180, elevation: 0 },
  { id: 'bottom', label: 'Bottom', azimuth: 0, elevation: -90 },
] as const

interface QuickSelectGridProps {
  azimuth: number
  elevation: number
  onChange: (azimuth: number, elevation: number) => void
}

function isActive(
  dir: (typeof DIRECTIONS)[number],
  azimuth: number,
  elevation: number
): boolean {
  if (dir.id === 'top') return elevation > 60
  if (dir.id === 'bottom') return elevation < -60
  if (Math.abs(elevation) > 60) return false
  const a = ((azimuth % 360) + 360) % 360
  if (dir.id === 'front') return a >= 315 || a < 45
  if (dir.id === 'right') return a >= 45 && a < 135
  if (dir.id === 'back') return a >= 135 && a < 225
  if (dir.id === 'left') return a >= 225 && a < 315
  return false
}

export function QuickSelectGrid({
  azimuth,
  elevation,
  onChange,
}: QuickSelectGridProps) {
  return (
    <div>
      <p className="text-[11px] text-white/50 mb-2 font-medium uppercase tracking-wider">
        Quick select
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {DIRECTIONS.map((dir) => {
          const active = isActive(dir, azimuth, elevation)
          return (
            <button
              key={dir.id}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                active
                  ? 'border-[#c8ff00]/50 bg-[#c8ff00]/10 text-[#c8ff00]'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white/80'
              }`}
              onClick={() => onChange(dir.azimuth, dir.elevation)}
            >
              {dir.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

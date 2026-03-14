'use client'

import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

interface LightSettingsProps {
  intensity: number
  onIntensityChange: (v: number) => void
  colorTemp: number
  onColorTempChange: (v: number) => void
  brightness: number
  onBrightnessChange: (v: number) => void
  lightMode: 'soft' | 'hard'
  onLightModeChange: (v: 'soft' | 'hard') => void
}

function colorTempLabel(kelvin: number): string {
  if (kelvin <= 3500) return 'Warm'
  if (kelvin <= 4500) return 'Warm White'
  if (kelvin <= 5500) return 'Neutral'
  if (kelvin <= 6500) return 'Cool White'
  return 'Cool'
}

function colorTempColor(kelvin: number): string {
  if (kelvin <= 3000) return '#ff9329'
  if (kelvin <= 4000) return '#ffc58f'
  if (kelvin <= 5000) return '#fff1e0'
  if (kelvin <= 6000) return '#ffffff'
  if (kelvin <= 6500) return '#d4e4ff'
  return '#a6c8ff'
}

export function LightSettings({
  intensity,
  onIntensityChange,
  colorTemp,
  onColorTempChange,
  brightness,
  onBrightnessChange,
  lightMode,
  onLightModeChange,
}: LightSettingsProps) {
  return (
    <div>
      <p className="text-[11px] text-white/50 mb-3 font-medium uppercase tracking-wider">
        Light settings
      </p>
      <div className="space-y-4">
        {/* Intensity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Intensity</span>
            <Badge
              variant="secondary"
              className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20 text-[10px] px-1.5 py-0"
            >
              {intensity}
            </Badge>
          </div>
          <Slider
            value={[intensity]}
            onValueChange={([v]) => onIntensityChange(v)}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Color Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Color Temperature</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colorTempColor(colorTemp) }}
              />
              <span className="text-[10px] text-white/50">
                {colorTemp}K · {colorTempLabel(colorTemp)}
              </span>
            </div>
          </div>
          <Slider
            value={[colorTemp]}
            onValueChange={([v]) => onColorTempChange(v)}
            min={3000}
            max={7000}
            step={100}
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-orange-400/60">Warm</span>
            <span className="text-[10px] text-blue-300/60">Cool</span>
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Brightness</span>
            <span className="text-[10px] text-white/50">{brightness}%</span>
          </div>
          <Slider
            value={[brightness]}
            onValueChange={([v]) => onBrightnessChange(v)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Light Quality */}
        <div className="space-y-2">
          <span className="text-xs text-white/70">Light Quality</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              className={`rounded-lg py-2 text-center transition-all border text-xs font-medium ${
                lightMode === 'soft'
                  ? 'border-[#c8ff00]/50 bg-[#c8ff00]/10 text-[#c8ff00]'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/20'
              }`}
              onClick={() => onLightModeChange('soft')}
            >
              Soft
            </button>
            <button
              className={`rounded-lg py-2 text-center transition-all border text-xs font-medium ${
                lightMode === 'hard'
                  ? 'border-[#c8ff00]/50 bg-[#c8ff00]/10 text-[#c8ff00]'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/20'
              }`}
              onClick={() => onLightModeChange('hard')}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

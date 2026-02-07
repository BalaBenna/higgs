'use client'

import * as React from 'react'
import { useState } from 'react'
import { RefreshCw, Sparkles, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Icon components
const UpscaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="size-7 mr-2">
    <path
      d="M9.16602 11.46C9.16602 10.1943 10.1923 9.16797 11.458 9.16797H17.083V5.62695C17.083 5.05163 16.6163 4.58496 16.041 4.58496H3.95801C3.3827 4.58496 2.91602 5.05164 2.91602 5.62695V14.377C2.91619 14.9521 3.38282 15.418 3.95801 15.418H9.16602V11.46ZM10.416 15.418H16.041C16.6162 15.418 17.0828 14.9521 17.083 14.377V10.418H11.458C10.8827 10.418 10.416 10.8846 10.416 11.46V15.418ZM18.333 14.377C18.3328 15.6424 17.3066 16.668 16.041 16.668H3.95801C2.69246 16.668 1.66619 15.6425 1.66602 14.377V5.62695C1.66602 4.36127 2.69236 3.33496 3.95801 3.33496H16.041C17.3067 3.33496 18.333 4.36128 18.333 5.62695V14.377Z"
      fill="currentColor"
    />
  </svg>
)

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path
      d="M7.99976 2.16699L7.99976 1.66699H7.99973L7.99976 2.16699ZM13.8337 8L14.3337 8.00003V7.99997L13.8337 8ZM7.99976 13.834L7.99973 14.334H7.99976L7.99976 13.834ZM2.35034 9.45801L1.86605 9.58234L1.86613 9.58266L2.35034 9.45801ZM2.83472 9.33398L2.95874 9.81836L2.95966 9.81812L2.83472 9.33398ZM7.99976 12.834L7.99973 13.334H7.99976L7.99976 12.834ZM12.8337 8L13.3337 8.00003V7.99997L12.8337 8ZM7.99976 3.16699L7.99976 2.66699H7.99973L7.99976 3.16699ZM4.08765 5.16699L3.68293 4.87338C3.57256 5.02552 3.55683 5.2267 3.64222 5.39414C3.72761 5.56158 3.89969 5.66699 4.08765 5.66699V5.16699ZM5.66675 5.16699L5.71506 4.66933C5.69901 4.66777 5.68288 4.66699 5.66675 4.66699V5.16699ZM5.76733 5.17676L5.86748 4.68689C5.85035 4.68339 5.83305 4.68079 5.81565 4.6791L5.76733 5.17676ZM6.16675 5.66699L6.66675 5.66731V5.66699H6.16675ZM5.76733 6.15723L5.81565 6.65489C5.83301 6.6532 5.85028 6.65061 5.86737 6.64712L5.76733 6.15723ZM5.66675 6.16699V6.66699C5.68288 6.66699 5.69901 6.66621 5.71506 6.66465L5.66675 6.16699ZM2.99976 6.16699L2.99949 6.66699H2.99976V6.16699ZM2.49976 5.66699H1.99976L1.99976 5.66731L2.49976 5.66699ZM2.49976 3L1.99976 2.99968V3H2.49976ZM2.99976 2.5L2.9998 2L2.99949 2L2.99976 2.5ZM3.49976 3H3.99976L3.99976 2.99968L3.49976 3ZM3.49976 4.29395H2.99976C2.99976 4.50493 3.1322 4.69322 3.33077 4.76452C3.52934 4.83583 3.75131 4.77482 3.88553 4.61203L3.49976 4.29395ZM2.70972 8.84961L2.58509 8.36539L2.58467 8.3655L2.70972 8.84961ZM7.99976 2.16699L7.99975 2.66699C10.9452 2.66701 13.3336 5.05474 13.3337 8.00003L13.8337 8L14.3337 7.99997C14.3335 4.50227 11.4973 1.66702 7.99976 1.66699L7.99976 2.16699ZM13.8337 8L13.3337 7.99997C13.3336 10.9454 10.9451 13.334 7.99975 13.334L7.99976 13.834L7.99976 14.334C11.4975 14.334 14.3335 11.4976 14.3337 8.00003L13.8337 8Z"
      fill="currentColor"
    />
  </svg>
)

const TopazIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M12.0005 6H6.00031V12.0002H12.0005V6Z" />
    <path d="M18.0001 0.000488281H11.9999V6.00066H18.0001V0.000488281Z" />
    <path d="M6.00003 11.9995H-0.00012207V17.9997H6.00003V11.9995Z" />
  </svg>
)

const StandardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none">
    <path
      d="M8.25 3.75H5.75C4.64543 3.75 3.75 4.64543 3.75 5.75V8.25M15.75 3.75H18.25C19.3546 3.75 20.25 4.64543 20.25 5.75V8.25M20.25 15.75V18.25C20.25 19.3546 19.3546 20.25 18.25 20.25H15.75M8.25 20.25H5.75C4.64543 20.25 3.75 19.3546 3.75 18.25V15.75"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CreditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="size-4!">
    <path
      d="M11.8525 4.21651L11.7221 3.2387C11.6906 3.00226 11.4889 2.82568 11.2504 2.82568C11.0118 2.82568 10.8102 3.00226 10.7786 3.23869L10.6483 4.21651C10.2658 7.0847 8.00939 9.34115 5.14119 9.72358L4.16338 9.85396C3.92694 9.88549 3.75037 10.0872 3.75037 10.3257C3.75037 10.5642 3.92694 10.7659 4.16338 10.7974L5.14119 10.9278C8.00938 11.3102 10.2658 13.5667 10.6483 16.4349L10.7786 17.4127C10.8102 17.6491 11.0118 17.8257 11.2504 17.8257C11.4889 17.8257 11.6906 17.6491 11.7221 17.4127L11.8525 16.4349C12.2349 13.5667 14.4913 11.3102 17.3595 10.9278L18.3374 10.7974C18.5738 10.7659 18.7504 10.5642 18.7504 10.3257C18.7504 10.0872 18.5738 9.88549 18.3374 9.85396L17.3595 9.72358C14.4913 9.34115 12.2349 7.0847 11.8525 4.21651Z"
      fill="currentColor"
    />
    <path
      d="M4.6519 14.7568L4.82063 14.2084C4.84491 14.1295 4.91781 14.0757 5.00037 14.0757C5.08292 14.0757 5.15582 14.1295 5.1801 14.2084L5.34883 14.7568C5.56525 15.4602 6.11587 16.0108 6.81925 16.2272L7.36762 16.3959C7.44652 16.4202 7.50037 16.4931 7.50037 16.5757C7.50037 16.6582 7.44652 16.7311 7.36762 16.7554L6.81926 16.9241C6.11587 17.1406 5.56525 17.6912 5.34883 18.3946L5.1801 18.9429C5.15582 19.0218 5.08292 19.0757 5.00037 19.0757C4.91781 19.0757 4.84491 19.0218 4.82063 18.9429L4.65191 18.3946C4.43548 17.6912 3.88486 17.1406 3.18147 16.9241L2.63311 16.7554C2.55421 16.7311 2.50037 16.6582 2.50037 16.5757C2.50037 16.4931 2.55421 16.4202 2.63311 16.3959L3.18148 16.2272C3.88486 16.0108 4.43548 15.4602 4.6519 14.7568Z"
      fill="currentColor"
    />
  </svg>
)

interface ModelOption {
  value: string
  label: string
  description: string
  icon: React.ReactNode
}

interface PresetOption {
  value: string
  label: string
  description: string
}

const MODELS: ModelOption[] = [
  {
    value: 'standard',
    label: 'Topaz',
    description: 'The default model for general-purpose use.',
    icon: <TopazIcon />,
  },
  {
    value: 'generative',
    label: 'Topaz Generative',
    description: 'AI-powered enhancement with generative capabilities.',
    icon: <TopazIcon />,
  },
]

const PRESETS: PresetOption[] = [
  { value: 'Standard V2', label: 'Standard', description: 'The default model for general-purpose use.' },
  { value: 'High Fidelity V2', label: 'High Fidelity v2', description: 'Preserves original details with high accuracy.' },
  { value: 'Text Refine', label: 'Text Refine', description: 'Optimized for images with text content.' },
  { value: 'CGI', label: 'Art & CG', description: 'Best for CGI, renders, and digital art.' },
  { value: 'Low Resolution V2', label: 'Low res', description: 'Optimized for very low resolution inputs.' },
]

const SCALE_FACTORS = ['x1', 'x2', 'x4', 'x8', 'x16'] as const

interface UpscalePanelProps {
  onSubmit: (settings: UpscaleSettings) => void
  isProcessing?: boolean
  creditsCost?: number
  className?: string
}

export interface UpscaleSettings {
  model: string
  scaleFactor: typeof SCALE_FACTORS[number]
  preset: string
  sharpness: number
  denoise: number
  faceEnhancement: boolean
}

export function UpscalePanel({
  onSubmit,
  isProcessing = false,
  creditsCost = 2,
  className,
}: UpscalePanelProps) {
  const [model, setModel] = useState('standard')
  const [scaleFactor, setScaleFactor] = useState<typeof SCALE_FACTORS[number]>('x1')
  const [preset, setPreset] = useState('Standard V2')
  const [sharpness, setSharpness] = useState(30)
  const [denoise, setDenoise] = useState(20)
  const [faceEnhancement, setFaceEnhancement] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(true)

  const handleReset = () => {
    setModel('standard')
    setScaleFactor('x1')
    setPreset('Standard V2')
    setSharpness(30)
    setDenoise(20)
    setFaceEnhancement(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      model,
      scaleFactor,
      preset,
      sharpness,
      denoise,
      faceEnhancement,
    })
  }

  const selectedModel = MODELS.find((m) => m.value === model)
  const selectedPreset = PRESETS.find((p) => p.value === preset)

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'animate-in slide-in-from-right-full duration-300 relative bg-[rgba(27,27,27,1)] border border-white/5 rounded-2xl flex flex-col h-full w-[336px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <UpscaleIcon />
          <p className="text-lg font-bold leading-7 tracking-tight">Upscale</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center text-sm font-medium gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ResetIcon />
          Reset
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="relative flex-1 min-h-0">
        <div className="h-full overflow-y-auto py-0 p-4 pb-32">
          {/* Model Select */}
          <div className="mt-4 mb-3">
            <p className="text-xs text-white/40 mb-2">Model</p>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full rounded-xl bg-white/[0.04] border-0 p-1 h-auto hover:bg-white/[0.08]">
                <SelectValue>
                  <div className="flex items-center">
                    <div className="size-[50px] mr-1 grid justify-center items-center rounded-lg bg-white/[0.08] text-primary">
                      {selectedModel?.icon}
                    </div>
                    <div className="flex flex-col w-[180px] pl-1 text-left">
                      <span className="mb-1 font-medium text-xs truncate">{selectedModel?.label}</span>
                      <span className="text-xs text-white/40 truncate">{selectedModel?.description}</span>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center">
                      <div className="size-8 mr-2 grid justify-center items-center rounded-lg bg-white/[0.08]">
                        {m.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale Factor */}
          <div className="flex gap-1.5 flex-col mb-4">
            <div className="text-sm font-medium text-white/60">Scale factor</div>
            <div className="w-full bg-white/[0.04] rounded-xl p-0.5 flex flex-wrap gap-0.5">
              {SCALE_FACTORS.map((factor) => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => setScaleFactor(factor)}
                  className={cn(
                    'px-2.5 py-3 h-10 grow rounded-[10px] focus:outline-none text-sm font-semibold transition-colors duration-200',
                    scaleFactor === factor
                      ? 'bg-white text-black'
                      : 'bg-transparent hover:bg-white/[0.08] text-white'
                  )}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="my-2">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex justify-between w-full items-center py-2"
            >
              <span className="text-sm font-semibold">Advanced Settings</span>
              {advancedOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {advancedOpen && (
              <div className="pt-2 space-y-4">
                {/* Preset */}
                <div className="flex gap-1.5 flex-col">
                  <div className="text-sm font-medium text-white/60">Preset</div>
                  <Select value={preset} onValueChange={setPreset}>
                    <SelectTrigger className="w-full rounded-xl bg-white/[0.04] border-0 p-1 h-auto hover:bg-white/[0.08]">
                      <SelectValue>
                        <div className="flex items-center">
                          <div className="size-[50px] mr-1 grid justify-center items-center rounded-lg bg-white/[0.08]">
                            <StandardIcon />
                          </div>
                          <div className="flex flex-col w-[180px] pl-1 text-left">
                            <span className="mb-1 font-medium text-xs truncate">{selectedPreset?.label}</span>
                            <span className="text-xs text-white/40 truncate">{selectedPreset?.description}</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{p.label}</span>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sharpness */}
                <div className="flex gap-1.5 flex-col">
                  <div className="flex items-center text-sm font-medium gap-1 text-white/60">
                    Sharpness
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="focus:outline-none">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Controls edge enhancement. Higher values create sharper details.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative w-full h-9 rounded-[10px] overflow-hidden bg-white/[0.04]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-sm">
                      {sharpness}
                    </span>
                    <div
                      className="absolute h-full bg-white/10"
                      style={{ width: `${sharpness}%` }}
                    />
                    <Slider
                      value={[sharpness]}
                      onValueChange={([v]) => setSharpness(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="h-full absolute inset-0 opacity-0"
                    />
                  </div>
                </div>

                {/* Denoise */}
                <div className="flex gap-1.5 flex-col">
                  <div className="flex items-center text-sm font-medium gap-1 text-white/60">
                    Denoise
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="focus:outline-none">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Removes noise and grain. Higher values apply more smoothing.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative w-full h-9 rounded-[10px] overflow-hidden bg-white/[0.04]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-sm">
                      {denoise}
                    </span>
                    <div
                      className="absolute h-full bg-white/10"
                      style={{ width: `${denoise}%` }}
                    />
                    <Slider
                      value={[denoise]}
                      onValueChange={([v]) => setDenoise(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="h-full absolute inset-0 opacity-0"
                    />
                  </div>
                </div>

                {/* Face Enhancement */}
                <div className="flex items-center justify-between mt-5">
                  <label className="text-sm font-semibold">Face enhancement</label>
                  <Switch
                    checked={faceEnhancement}
                    onCheckedChange={setFaceEnhancement}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-[calc(100%-32px)] absolute z-20 bottom-4 left-4 h-12 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground font-medium"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <span className="relative flex items-center">
            Upscale
            <span className="ml-2 rounded-[10px] px-1.5 py-0.5 h-[26px] flex justify-center items-center bg-black/10">
              <CreditIcon />
              <span className="ml-1 text-sm">{creditsCost}</span>
            </span>
          </span>
        )}
      </Button>
    </form>
  )
}

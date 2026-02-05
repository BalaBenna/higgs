'use client'

import { useState } from 'react'
import { MousePointer, ChevronDown, Loader2, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

interface ClickToAdUrlStepProps {
  mode: 'video' | 'image'
  url: string
  onUrlChange: (url: string) => void
  autoAnalyze: boolean
  onAutoAnalyzeChange: (value: boolean) => void
  additionalContext: string
  onAdditionalContextChange: (value: string) => void
  onContinue: () => void
  isLoading: boolean
}

export function ClickToAdUrlStep({
  mode,
  url,
  onUrlChange,
  autoAnalyze,
  onAutoAnalyzeChange,
  additionalContext,
  onAdditionalContextChange,
  onContinue,
  isLoading,
}: ClickToAdUrlStepProps) {
  const [showContext, setShowContext] = useState(false)

  const heroText =
    mode === 'video'
      ? 'TURN ANY PRODUCT INTO A VIDEO AD'
      : 'TURN ANY PRODUCT INTO AN IMAGE AD'

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 text-neon border border-neon/20">
            <MousePointer className="h-4 w-4" />
            <span className="text-sm font-medium">Click to Ad</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight" data-testid="hero-text">
            {heroText}
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Paste a product URL and we&apos;ll automatically extract product details and generate
            {mode === 'video' ? ' a video ad' : ' image ads'} for you.
          </p>
        </div>

        {/* URL Input */}
        <div className="space-y-4">
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="url"
              placeholder="Paste product URL here... (e.g., https://example.com/product)"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-card text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
              data-testid="url-input"
            />
          </div>

          {/* Auto-analyze checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-analyze"
              checked={autoAnalyze}
              onCheckedChange={(checked) => onAutoAnalyzeChange(checked === true)}
              data-testid="auto-analyze-checkbox"
            />
            <label htmlFor="auto-analyze" className="text-sm text-muted-foreground cursor-pointer">
              Automatically analyze content
            </label>
          </div>

          {/* Additional context */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowContext(!showContext)}
              data-testid="additional-context-toggle"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showContext ? 'rotate-180' : ''}`}
              />
              Additional context
            </Button>
            {showContext && (
              <Textarea
                placeholder="Add any additional context about the product or ad style..."
                value={additionalContext}
                onChange={(e) => onAdditionalContextChange(e.target.value)}
                className="mt-2 min-h-[80px] resize-none"
                data-testid="additional-context-input"
              />
            )}
          </div>

          {/* Continue button */}
          <Button
            variant="neon"
            size="lg"
            className="w-full h-14 text-base"
            disabled={!url.trim() || isLoading}
            onClick={onContinue}
            data-testid="continue-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing product...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

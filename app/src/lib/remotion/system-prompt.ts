import type { PresetId, StyleId, ThemeColors } from './types'

const BASE_PROMPT = `You are an expert motion graphics developer using Remotion (React-based video framework).

Generate a SINGLE React component that creates a motion graphic video.

CRITICAL — You MUST follow these rules. Violating any of them will cause a compilation error:
- NEVER use import statements. They are forbidden and will crash the compiler.
- NEVER use export statements. They are forbidden and will crash the compiler.
- NEVER wrap your code in markdown fences (\`\`\`). Output raw code only.
- Output ONLY valid TypeScript/JSX code. No explanations, no comments outside code.

Available globals (already injected — do NOT import them):
- React: React, useState, useEffect, useCallback, useMemo, useRef, createElement, Fragment
- Remotion: useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, AbsoluteFill, Easing, Img, Video, OffthreadVideo, Audio, random
- Shapes: Rect, Circle, Triangle, Star, Ellipse, Pie
- Transitions: TransitionSeries, linearTiming, springTiming, fade, slide, wipe
- Paths: evolvePath, getLength, getPointAtLength

Component patterns (both are valid — the LAST PascalCase component defined is used as root):
  const MyComponent = () => { return (<AbsoluteFill>...</AbsoluteFill>) }
  function MyComponent() { return (<AbsoluteFill>...</AbsoluteFill>) }

Rules:
- Define all constants at the top of the component
- Use spring() for natural physics-based animations
- Canvas size is 1920x1080 (Full HD)
- Use crossfade transitions between sections
- Use inline styles (no CSS modules or external stylesheets)
- Make animations smooth and professional`

const PRESET_PROMPTS: Record<PresetId, string> = {
  infographics: `
PRESET: Data Visualization / Infographics
- Focus on animated charts, bar graphs, counters, and data storytelling
- Use spring animations for bar/element entry
- Animate numbers counting up with interpolate()
- Use clear labels and data callouts
- Consider pie charts with Pie shape, animated progress bars with Rect
- Stagger element entry for visual interest`,

  'text-animation': `
PRESET: Kinetic Typography / Text Animation
- Focus on dynamic text reveals and typography effects
- Animate individual letters or words using per-character spring animations
- Use scale, rotation, opacity, and position transforms
- Consider text masking effects using clip-path
- Use Sequence for timing different text sections
- Create impactful title reveals with spring physics`,

  posters: `
PRESET: Animated Poster Design
- Create an eye-catching poster with subtle motion
- Use bold imagery, gradients, and typography
- Add subtle parallax or floating effects
- Consider gentle zoom, pan, or pulse animations
- Use dramatic color contrasts and large text
- Keep motion minimal but impactful — like a "living poster"`,

  presentation: `
PRESET: Professional Presentation / Slides
- Create smooth slide transitions with content entry animations
- Use sequential content appearance (title first, then bullets, then visuals)
- Clean, professional layout with proper spacing
- Use slide/fade transitions between sections via TransitionSeries
- Consider data highlights and key metric callouts
- Maintain consistent visual hierarchy throughout`,

  scratch: '',
}

const STYLE_PROMPTS: Record<StyleId, string> = {
  minimal: `
STYLE: Minimalist
- Use black, white, and at most one accent color
- Generous whitespace and clean composition
- Thin sans-serif typography (system fonts)
- Subtle, refined motion — less is more
- Focus on elegant transitions and precise timing`,

  corporate: `
STYLE: Corporate / Professional
- Color palette: navy (#1a237e), white, gold (#ffd700)
- Helvetica/Arial-style clean typography
- Data-focused with professional charts and metrics
- Smooth, measured transitions — nothing flashy
- Clean grid-based layouts`,

  fashion: `
STYLE: Editorial / Fashion
- Dramatic contrasts (black & white with bold accents)
- Editorial typography — mix large and small text
- Full-bleed imagery and bold compositions
- Slow, elegant motion with dramatic pauses
- High-fashion aesthetic with artistic flair`,

  marketing: `
STYLE: Marketing / Advertising
- Vibrant gradients and bold color combinations
- Strong CTAs (calls-to-action) with attention-grabbing text
- Energetic, bouncy animations with quick spring physics
- Eye-catching motion that demands attention
- Dynamic scaling and rotation effects`,
}

export function buildSystemPrompt(opts: {
  preset: PresetId
  style?: StyleId
  themeColors?: ThemeColors
  duration?: number
  mediaUrls?: string[]
}): string {
  const parts: string[] = [BASE_PROMPT]

  // Preset
  const presetPrompt = PRESET_PROMPTS[opts.preset]
  if (presetPrompt) {
    parts.push(presetPrompt)
  }

  // Style
  if (opts.style && STYLE_PROMPTS[opts.style]) {
    parts.push(STYLE_PROMPTS[opts.style])
  }

  // Theme colors
  if (opts.themeColors) {
    const { primary, secondary, accent, background } = opts.themeColors
    parts.push(`
THEME COLORS (use these in your design):
- Primary: ${primary}
- Secondary: ${secondary}
- Accent: ${accent}
- Background: ${background}`)
  }

  // Duration
  if (opts.duration) {
    const fps = 30
    const totalFrames = opts.duration * fps
    parts.push(`
TARGET DURATION: ${opts.duration} seconds (${totalFrames} frames at ${fps}fps)
Pace your animations to fill this duration. Use Sequence components to time sections.`)
  }

  // Media URLs
  if (opts.mediaUrls && opts.mediaUrls.length > 0) {
    const urlList = opts.mediaUrls.map((u, i) => `  ${i + 1}. "${u}"`).join('\n')
    parts.push(`
MEDIA ASSETS:
${urlList}
- For images (png/jpg/gif/webp): use <Img src={url} style={{...}} />
- For videos (mp4/webm): use <Video src={url} style={{...}} />
- For audio (mp3/wav): use <Audio src={url} />
Incorporate these assets naturally into the design.`)
  }

  return parts.join('\n')
}

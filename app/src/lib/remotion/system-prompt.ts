import type { AspectRatioId, PresetId, StyleId, ThemeColors } from './types'

const BASE_PROMPT = `You are an expert motion graphics developer using Remotion (React-based video framework).

Generate a SINGLE React component that creates a motion graphic video.

CRITICAL — You MUST follow these rules. Violating any of them will cause a compilation error:
- NEVER use import statements. They are forbidden and will crash the compiler.
- NEVER use export statements. They are forbidden and will crash the compiler.
- NEVER wrap your code in markdown fences (\`\`\`). Output raw code only.
- Output ONLY valid TypeScript/JSX code. No explanations, no comments outside code.

CRITICAL ANIMATION RULES (from Remotion official guidelines):
- All animations MUST be driven by useCurrentFrame(). CSS transitions/animations are FORBIDDEN.
- Tailwind animation classes are FORBIDDEN — they will not render correctly.
- Always calculate time in seconds: const startFrame = 1 * fps (using fps from useVideoConfig())
- Always use extrapolateRight: 'clamp' with interpolate() to prevent overshooting.
- Use spring() for organic motion. NEVER use CSS keyframes.
- NEVER use setTimeout, setInterval, requestAnimationFrame, or any imperative timing — Remotion is declarative and frame-based.

SPRING PRESETS (use the right one for context):
- Smooth reveal (no bounce): { damping: 200 }
- Snappy UI motion: { damping: 20, stiffness: 200 }
- Playful/energetic: { damping: 8 }
- Heavy/cinematic: { damping: 15, stiffness: 80, mass: 2 }

Available globals (already injected — do NOT import them):
- React: React, useState, useEffect, useCallback, useMemo, useRef, createElement, Fragment
- Remotion: useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Series, AbsoluteFill, Easing, Img, Video, OffthreadVideo, Audio, random
- Shapes: Rect, Circle, Triangle, Star, Ellipse, Pie
- Transitions: TransitionSeries (with TransitionSeries.Sequence and TransitionSeries.Transition), linearTiming, springTiming, fade, slide, wipe, flip, clockWipe
- Paths: evolvePath, getLength, getPointAtLength
- Noise: noise3D

Component patterns (both are valid — the LAST PascalCase component defined is used as root):
  const MyComponent = () => { return (<AbsoluteFill>...</AbsoluteFill>) }
  function MyComponent() { return (<AbsoluteFill>...</AbsoluteFill>) }

SEQUENCING PATTERNS:
- <Series> for non-overlapping sequential content: each <Series.Sequence durationInFrames={N}> plays one after the other automatically.
- <Sequence from={startFrame}> for timed element entry at a specific frame.
- <TransitionSeries> for scene transitions with visual effects between sections.

TransitionSeries usage (CRITICAL — wrong children will crash):
- <TransitionSeries> ONLY accepts <TransitionSeries.Sequence> and <TransitionSeries.Transition> as direct children.
- Do NOT put <Sequence>, <AbsoluteFill>, <div>, or any other element directly inside <TransitionSeries>.
- Correct pattern:
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={90}>
      <AbsoluteFill>...</AbsoluteFill>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide()} timing={springTiming({ durationInFrames: 30 })} />
    <TransitionSeries.Sequence durationInFrames={90}>
      <AbsoluteFill>...</AbsoluteFill>
    </TransitionSeries.Sequence>
  </TransitionSeries>

TRANSITIONS AVAILABLE:
- fade() — crossfade between scenes
- slide({ direction: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }) — directional slide
- wipe({ direction: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }) — directional wipe
- flip({ direction: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }) — 3D flip between scenes
- clockWipe() — clock-hand sweep reveal
- Timing: linearTiming({ durationInFrames: N }), springTiming({ config: { damping: 200 } })

noise3D usage:
- noise3D('seed-string', x, y, z) returns a value between -1 and 1
- Use for organic motion: const offset = noise3D('particle', i * 0.1, frame * 0.01, 0) * amplitude

Rules:
- Define all constants at the top of the component
- Use spring() for natural physics-based animations
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
- Stagger element entry for visual interest

REFERENCE PATTERN — Staggered bar chart:
  const STAGGER = 5;
  data.map((item, i) => {
    const progress = spring({ frame, fps, delay: i * STAGGER, config: { damping: 18, stiffness: 80 } });
    return <div style={{ height: \`\${progress * item.value}%\`, ... }} />;
  });

REFERENCE PATTERN — Animated counter:
  const count = Math.round(interpolate(frame, [0, 2*fps], [0, targetValue], { extrapolateRight: 'clamp' }));

REFERENCE PATTERN — Circular progress:
  const circumference = 2 * Math.PI * radius;
  const progress = spring({ frame, fps, config: { damping: 200 } });
  <circle r={radius} cx={cx} cy={cy}
    style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }} />`,

  'text-animation': `
PRESET: Kinetic Typography / Text Animation
- Focus on dynamic text reveals and typography effects
- Animate individual letters or words using per-character spring animations
- Use scale, rotation, opacity, and position transforms
- Consider text masking effects using clip-path
- Use Sequence for timing different text sections
- Create impactful title reveals with spring physics

REFERENCE PATTERN — Typewriter effect:
  const visibleChars = Math.floor(interpolate(frame, [0, text.length * 2], [0, text.length], { extrapolateRight: 'clamp' }));
  <span>{text.slice(0, visibleChars)}</span>

REFERENCE PATTERN — Per-character stagger:
  text.split('').map((char, i) => {
    const y = spring({ frame, fps, delay: i * 3, config: { damping: 12 } });
    const opacity = interpolate(y, [0, 1], [0, 1]);
    return <span style={{ display: 'inline-block', transform: \`translateY(\${(1-y) * 40}px)\`, opacity }}>{char}</span>;
  });

REFERENCE PATTERN — Word highlight:
  const scaleX = spring({ frame: frame - highlightDelay, fps, config: { damping: 15 } });
  <span style={{ position: 'relative' }}>
    {word}
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, background: accent, transform: \`scaleX(\${scaleX})\`, transformOrigin: 'left' }} />
  </span>`,

  posters: `
PRESET: Animated Poster Design
- Create an eye-catching poster with subtle motion
- Use bold imagery, gradients, and typography
- Add subtle parallax or floating effects
- Consider gentle zoom, pan, or pulse animations
- Use dramatic color contrasts and large text
- Keep motion minimal but impactful — like a "living poster"

REFERENCE PATTERN — Parallax depth layers:
  const scroll = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: 'clamp' });
  // Background moves slowly, foreground faster
  <div style={{ transform: \`translateY(\${-scroll * 0.3}px)\` }}>background</div>
  <div style={{ transform: \`translateY(\${-scroll * 0.8}px)\` }}>foreground</div>

REFERENCE PATTERN — Ken Burns zoom:
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15], { extrapolateRight: 'clamp' });
  const x = interpolate(frame, [0, durationInFrames], [0, -30], { extrapolateRight: 'clamp' });
  <div style={{ transform: \`scale(\${scale}) translateX(\${x}px)\` }}>...</div>

REFERENCE PATTERN — Floating particles with noise:
  Array.from({ length: 20 }).map((_, i) => {
    const x = noise3D('x', i, frame * 0.005, 0) * 200 + baseX;
    const y = noise3D('y', i, frame * 0.005, 0) * 200 + baseY;
    return <div style={{ position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />;
  });`,

  presentation: `
PRESET: Professional Presentation / Slides
- Create smooth slide transitions with content entry animations
- Use sequential content appearance (title first, then bullets, then visuals)
- Clean, professional layout with proper spacing
- Use TransitionSeries with TransitionSeries.Sequence and TransitionSeries.Transition for slide/fade transitions between sections
- Consider data highlights and key metric callouts
- Maintain consistent visual hierarchy throughout

REFERENCE PATTERN — Staggered bullet points:
  const BULLET_STAGGER = 8;
  bullets.map((text, i) => {
    const enter = spring({ frame, fps, delay: titleDelay + i * BULLET_STAGGER, config: { damping: 20, stiffness: 200 } });
    return <div style={{ opacity: enter, transform: \`translateX(\${(1 - enter) * 30}px)\` }}>{text}</div>;
  });

REFERENCE PATTERN — Slide deck with transitions:
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={framesPerSlide}><Slide1 /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence durationInFrames={framesPerSlide}><Slide2 /></TransitionSeries.Sequence>
  </TransitionSeries>`,

  scratch: '',

  'social-media-ad': `
PRESET: Social Media Ad / Marketing Clip
- Create attention-grabbing, fast-paced motion with bold visuals
- Use quick cuts, wipes, and dynamic scale bounces
- Include a strong CTA (call-to-action) with pulse animation
- Bold typography, vibrant gradients, and high contrast
- Front-load the hook: first 1 second must be visually striking

REFERENCE PATTERN — Bounce entrance:
  const scale = spring({ frame, fps, config: { damping: 8 } });
  <div style={{ transform: \`scale(\${scale})\` }}>SALE</div>

REFERENCE PATTERN — CTA pulse:
  const pulse = Math.sin(frame * 0.15) * 0.05 + 1;
  <div style={{ transform: \`scale(\${pulse})\`, background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', padding: '20px 40px', borderRadius: 12, color: '#fff', fontWeight: 'bold', fontSize: 48 }}>
    Shop Now
  </div>

REFERENCE PATTERN — Bold color wipe reveal:
  const wipeProgress = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  <div style={{ clipPath: \`inset(0 \${(1 - wipeProgress) * 100}% 0 0)\` }}>content</div>`,

  'logo-animation': `
PRESET: Logo Animation / Brand Intro
- Create a professional logo reveal or brand intro animation
- Focus on clean, impactful entrance with spring physics
- Consider SVG path drawing with evolvePath
- Use scale + rotation entrance for geometric logos
- Add glow/shadow effects animating in
- End on a clean, held final state

REFERENCE PATTERN — SVG path drawing:
  const progress = interpolate(frame, [0, 3*fps], [0, 1], { extrapolateRight: 'clamp' });
  const pathData = evolvePath(progress, 'M10 80 Q 52.5 10, 95 80 T 180 80');
  <svg><path d={pathData.d} strokeDasharray={pathData.strokeDasharray} strokeDashoffset={pathData.strokeDashoffset} /></svg>

REFERENCE PATTERN — Scale + rotate entrance:
  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const rotate = interpolate(frame, [0, fps], [180, 0], { extrapolateRight: 'clamp' });
  <div style={{ transform: \`scale(\${scale}) rotate(\${rotate}deg)\` }}>LOGO</div>

REFERENCE PATTERN — Glow reveal:
  const glowIntensity = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  <div style={{ filter: \`drop-shadow(0 0 \${glowIntensity * 20}px rgba(100,200,255,\${glowIntensity * 0.8}))\` }}>LOGO</div>`,

  'product-showcase': `
PRESET: Product Showcase / Feature Highlight
- Showcase a product with animated feature callouts
- Use zoom highlights on specific features
- Include comparison layouts or before/after reveals
- Price/value callouts with spring emphasis
- Clean, modern aesthetic with clear information hierarchy

REFERENCE PATTERN — Feature zoom highlight:
  const zoomScale = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const zoomX = interpolate(zoomScale, [0, 1], [0, -focusX]);
  <div style={{ transform: \`scale(\${1 + zoomScale * 0.5}) translate(\${zoomX}px, \${zoomY}px)\` }}>product</div>

REFERENCE PATTERN — Price callout with spring:
  const priceScale = spring({ frame: frame - priceDelay, fps, config: { damping: 8 } });
  <div style={{ transform: \`scale(\${priceScale})\`, fontSize: 72, fontWeight: 'bold' }}>$99</div>

REFERENCE PATTERN — Comparison slider reveal:
  const revealX = interpolate(frame, [startFrame, startFrame + 30], [0, 100], { extrapolateRight: 'clamp' });
  <div style={{ clipPath: \`inset(0 0 0 \${revealX}%)\` }}>after</div>`,

  countdown: `
PRESET: Countdown / Timer Animation
- Create an engaging countdown sequence with number transitions
- Animate number changes with scale, flip, or morph effects
- Include circular or linear progress visualization
- Build urgency: increase animation intensity as count decreases
- Add pulsing or shaking effects for final seconds

REFERENCE PATTERN — Number flip:
  const { fps, durationInFrames } = useVideoConfig();
  const totalSeconds = Math.floor(durationInFrames / fps);
  const currentSecond = totalSeconds - Math.floor(frame / fps);
  const withinSecond = (frame % fps) / fps;
  const flipY = interpolate(withinSecond, [0, 0.1], [0, -180], { extrapolateRight: 'clamp' });
  <div style={{ fontSize: 200, fontWeight: 'bold', transform: \`rotateX(\${flipY}deg)\`, perspective: 500 }}>{currentSecond}</div>

REFERENCE PATTERN — Circular progress:
  const totalFrames = durationInFrames;
  const progress = frame / totalFrames;
  const circumference = 2 * Math.PI * 120;
  <svg><circle cx={150} cy={150} r={120} fill="none" stroke="#ff4444" strokeWidth={8}
    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} /></svg>

REFERENCE PATTERN — Urgency pulse on final seconds:
  const isUrgent = currentSecond <= 3;
  const urgencyScale = isUrgent ? 1 + Math.sin(frame * 0.3) * 0.1 : 1;
  const urgencyColor = isUrgent ? '#ff0000' : '#ffffff';`,
}

const STYLE_PROMPTS: Record<StyleId, string> = {
  minimal: `
STYLE: Minimalist
- Colors: Black (#000), white (#fff), one accent color only
- Spacing: 80px margins minimum, generous whitespace
- Typography: system sans-serif (font-family: system-ui), weights 300 and 600 only
- Motion intensity: LOW — use spring({ damping: 200 }) for everything
- Transitions: fade() only, linearTiming({ durationInFrames: 20 })
- No gradients. No shadows. No borders thicker than 1px.
- Let negative space do the heavy lifting`,

  corporate: `
STYLE: Corporate / Professional
- Color palette: navy (#1a237e), white (#ffffff), gold (#ffd700), slate (#64748b)
- Typography: system sans-serif, clean Helvetica/Arial style, weights 400/700
- Data-focused: professional charts, metrics, and KPI callouts
- Motion intensity: MEDIUM — spring({ damping: 20, stiffness: 200 }) for snappy but professional
- Transitions: slide({ direction: 'from-right' }) with springTiming
- Clean grid-based layouts with consistent 40px gutters
- Subtle box shadows for depth: 0 2px 8px rgba(0,0,0,0.1)`,

  fashion: `
STYLE: Editorial / Fashion
- Dramatic contrasts: black (#000) and white (#fff) with one bold accent (red, gold, or electric blue)
- Typography: mix large serif-style headings (font-family: Georgia, serif) with small sans-serif body text
- Editorial layouts: asymmetric compositions, full-bleed imagery, overlapping elements
- Motion intensity: SLOW & DRAMATIC — spring({ damping: 15, stiffness: 80, mass: 2 }) for heavy, cinematic motion
- Transitions: fade() with long linearTiming({ durationInFrames: 45 })
- Add dramatic pauses: hold key frames for 30+ frames before next animation
- Letter-spacing: 0.2em on headings for editorial feel`,

  marketing: `
STYLE: Marketing / Advertising
- Vibrant gradients: use linear-gradient with bold color pairs (orange→red, blue→purple, green→cyan)
- Typography: bold sans-serif, weights 700/900, large sizes (60px+ for headlines)
- Motion intensity: HIGH — spring({ damping: 8 }) for bouncy, energetic entrances
- Transitions: slide() and wipe() with springTiming for dynamic feel
- Scale effects: interpolate to [0.8, 1.1, 1.0] for overshoot bounce entry
- Animated gradient backgrounds: shift gradient angle over time using interpolate
- Strong CTAs: pulsing buttons, glowing borders, attention-grabbing scale animations
- High contrast text with text-shadow for readability over gradients`,
}

const QUALITY_STANDARDS = `
QUALITY STANDARDS — Your output must meet these criteria:
1. EVERY visible element must animate (entry, emphasis, or exit). No static elements.
2. Use minimum 3-5 distinct animation phases across the timeline.
3. Layer animations: background motion + content animations + accent/detail animations.
4. Stagger element entries by 3-8 frames for visual rhythm.
5. Include subtle continuous background motion (gradient shift, particle float, slow zoom).
6. Use spring() for primary motion, interpolate() with Easing for secondary.
7. Add exit animations before transitions or before new content enters.
8. Text should animate in (scale, fade, slide) — never just appear.
9. Use color as animation: animate opacity, gradients, or accent colors.
10. Professional pacing: intro (20%), main content (60%), outro/resolve (20%).`

function getCanvasSizePrompt(
  width: number,
  height: number,
  ratio: AspectRatioId
): string {
  let layoutGuidance = ''
  switch (ratio) {
    case '9:16':
      layoutGuidance =
        'VERTICAL LAYOUT: Stack content vertically. Use full-height backgrounds. Larger text (min 60px headings). Center-aligned content. Think mobile-first.'
      break
    case '1:1':
      layoutGuidance =
        'SQUARE LAYOUT: Center-focused composition. Equal padding on all sides (min 60px). Balanced visual weight. Works great for centered text + shapes.'
      break
    case '4:5':
      layoutGuidance =
        'TALL LAYOUT: Slight vertical emphasis. Good for text-heavy content with image/graphic above. Center-aligned with 60px horizontal padding.'
      break
    case '16:9':
    default:
      layoutGuidance =
        'WIDESCREEN LAYOUT: Cinematic horizontal flow. Side-by-side layouts work well. Use the full width for impact.'
      break
  }

  return `
CANVAS SIZE: ${width}x${height} (${ratio})
Design for this exact canvas dimension. All absolute positions must fit within these bounds.
${layoutGuidance}`
}

export function buildSystemPrompt(opts: {
  preset: PresetId
  style?: StyleId
  themeColors?: ThemeColors
  duration?: number
  mediaUrls?: string[]
  width?: number
  height?: number
  aspectRatio?: AspectRatioId
}): string {
  const parts: string[] = [BASE_PROMPT]

  // Canvas size
  const width = opts.width ?? 1920
  const height = opts.height ?? 1080
  const ratio = opts.aspectRatio ?? '16:9'
  parts.push(getCanvasSizePrompt(width, height, ratio))

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
Pace your animations to fill this duration. Use Sequence or Series components to time sections.
Distribute content across the full timeline — do not cluster all animations at the start.`)
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

  // Quality standards always appended
  parts.push(QUALITY_STANDARDS)

  return parts.join('\n')
}

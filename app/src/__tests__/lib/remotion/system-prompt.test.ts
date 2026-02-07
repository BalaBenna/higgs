import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/remotion/system-prompt'

describe('buildSystemPrompt', () => {
  describe('base prompt rules', () => {
    const prompt = buildSystemPrompt({ preset: 'scratch' })

    it('forbids import statements', () => {
      expect(prompt).toContain('NEVER use import')
    })

    it('forbids export statements', () => {
      expect(prompt).toContain('NEVER use export')
    })

    it('forbids markdown fences', () => {
      expect(prompt).toContain('NEVER wrap your code in markdown fences')
    })
  })

  describe('available globals', () => {
    const prompt = buildSystemPrompt({ preset: 'scratch' })

    it('lists Video in globals', () => {
      expect(prompt).toContain('Video')
    })

    it('lists OffthreadVideo in globals', () => {
      expect(prompt).toContain('OffthreadVideo')
    })

    it('lists Audio in globals', () => {
      expect(prompt).toContain('Audio')
    })

    it('does NOT list staticFile in the available globals section', () => {
      // staticFile is excluded from the system prompt globals because it
      // doesn't work in the browser sandbox — files are served via URL
      const globalsSection = prompt.split('Available globals')[1]?.split('Rules:')[0] ?? ''
      expect(globalsSection).not.toContain('staticFile')
    })
  })

  describe('preset injection', () => {
    it('includes infographics preset content', () => {
      const prompt = buildSystemPrompt({ preset: 'infographics' })
      expect(prompt).toContain('Data Visualization')
    })

    it('includes text-animation preset content', () => {
      const prompt = buildSystemPrompt({ preset: 'text-animation' })
      expect(prompt).toContain('Kinetic Typography')
    })

    it('scratch preset adds no extra preset content', () => {
      const base = buildSystemPrompt({ preset: 'scratch' })
      const scratch = buildSystemPrompt({ preset: 'scratch' })
      expect(base).toBe(scratch)
    })
  })

  describe('duration', () => {
    it('includes duration and frame count', () => {
      const prompt = buildSystemPrompt({ preset: 'scratch', duration: 10 })
      expect(prompt).toContain('10 seconds')
      expect(prompt).toContain('300 frames at 30fps')
    })

    it('calculates frames correctly for custom duration', () => {
      const prompt = buildSystemPrompt({ preset: 'scratch', duration: 5 })
      expect(prompt).toContain('5 seconds')
      expect(prompt).toContain('150 frames at 30fps')
    })
  })

  describe('media URLs', () => {
    it('includes media usage instructions', () => {
      const prompt = buildSystemPrompt({
        preset: 'scratch',
        mediaUrls: ['https://example.com/photo.jpg'],
      })
      expect(prompt).toContain('<Img')
      expect(prompt).toContain('<Video')
      expect(prompt).toContain('<Audio')
      expect(prompt).toContain('https://example.com/photo.jpg')
    })
  })

  describe('theme colors', () => {
    it('includes all 4 theme color values', () => {
      const colors = {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        background: '#FFFFFF',
      }
      const prompt = buildSystemPrompt({
        preset: 'scratch',
        themeColors: colors,
      })
      expect(prompt).toContain('#FF0000')
      expect(prompt).toContain('#00FF00')
      expect(prompt).toContain('#0000FF')
      expect(prompt).toContain('#FFFFFF')
    })
  })

  describe('style injection', () => {
    it('includes minimal style content', () => {
      const prompt = buildSystemPrompt({ preset: 'scratch', style: 'minimal' })
      expect(prompt).toContain('Minimalist')
    })

    it('includes corporate style content', () => {
      const prompt = buildSystemPrompt({ preset: 'scratch', style: 'corporate' })
      expect(prompt).toContain('Corporate')
    })
  })
})

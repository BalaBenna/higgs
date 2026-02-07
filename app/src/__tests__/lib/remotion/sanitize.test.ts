import { describe, it, expect } from 'vitest'
import { stripMarkdownFences, extractComponentCode } from '@/lib/remotion/sanitize'

describe('stripMarkdownFences', () => {
  it('removes ```tsx fences', () => {
    const input = '```tsx\nconst x = 1\n```'
    expect(stripMarkdownFences(input)).toBe('const x = 1')
  })

  it('removes ```jsx fences', () => {
    const input = '```jsx\nconst x = 1\n```'
    expect(stripMarkdownFences(input)).toBe('const x = 1')
  })

  it('removes plain ``` fences', () => {
    const input = '```\nconst x = 1\n```'
    expect(stripMarkdownFences(input)).toBe('const x = 1')
  })

  it('returns code unchanged when no fences present', () => {
    const input = 'const x = 1'
    expect(stripMarkdownFences(input)).toBe('const x = 1')
  })

  it('trims surrounding whitespace', () => {
    const input = '  ```tsx\n  code  \n```  '
    expect(stripMarkdownFences(input)).toBe('code')
  })
})

describe('extractComponentCode', () => {
  describe('import removal', () => {
    it('removes single-line default import', () => {
      const input = "import React from 'react'\nconst x = 1"
      expect(extractComponentCode(input)).toBe('const x = 1')
    })

    it('removes single-line named import', () => {
      const input = "import { useState } from 'react'\nconst x = 1"
      expect(extractComponentCode(input)).toBe('const x = 1')
    })

    it('removes multi-line import', () => {
      const input = "import {\n  Foo,\n  Bar,\n} from 'mod'\nconst x = 1"
      expect(extractComponentCode(input)).toBe('const x = 1')
    })

    it('removes side-effect import', () => {
      const input = "import './styles.css'\nconst x = 1"
      expect(extractComponentCode(input)).toBe('const x = 1')
    })

    it('removes multiple imports leaving only code', () => {
      const input = [
        "import React from 'react'",
        "import { useState } from 'react'",
        "import { Sequence } from 'remotion'",
        '',
        'const MyComp = () => <div />',
      ].join('\n')
      expect(extractComponentCode(input)).toBe('const MyComp = () => <div />')
    })

    it('known edge case: removes string containing import-like pattern', () => {
      // This documents the known false-positive: the non-anchored regex
      // will match import-like patterns inside strings. This is acceptable
      // because LLM-generated Remotion code virtually never has such strings.
      const input = 'const msg = "import data from \'file\'"'
      const result = extractComponentCode(input)
      expect(result).not.toContain('import')
    })
  })

  describe('export removal', () => {
    it('removes export default from function', () => {
      const input = 'export default function Foo() { return null }'
      expect(extractComponentCode(input)).toBe('function Foo() { return null }')
    })

    it('removes export from const', () => {
      const input = 'export const Foo = () => null'
      expect(extractComponentCode(input)).toBe('const Foo = () => null')
    })

    it('removes export from function declaration', () => {
      const input = 'export function Foo() { return null }'
      expect(extractComponentCode(input)).toBe('function Foo() { return null }')
    })

    it('does NOT remove "export" mid-line (anchored to ^)', () => {
      const input = 'const label = "export this"'
      expect(extractComponentCode(input)).toBe('const label = "export this"')
    })
  })

  describe('full pipeline', () => {
    it('strips fences, imports, and exports together', () => {
      const input = [
        '```tsx',
        "import React from 'react'",
        "import { AbsoluteFill } from 'remotion'",
        '',
        'export default function MyComponent() {',
        '  return <AbsoluteFill>Hello</AbsoluteFill>',
        '}',
        '```',
      ].join('\n')

      const result = extractComponentCode(input)
      expect(result).not.toContain('import')
      expect(result).not.toContain('export')
      expect(result).not.toContain('```')
      expect(result).toContain('function MyComponent()')
      expect(result).toContain('<AbsoluteFill>Hello</AbsoluteFill>')
    })
  })
})

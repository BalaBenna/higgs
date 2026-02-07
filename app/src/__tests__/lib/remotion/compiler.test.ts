import { describe, it, expect } from 'vitest'
import { compileCode } from '@/lib/remotion/compiler'

describe('compileCode', () => {
  it('returns null Component for empty input', async () => {
    const result = await compileCode('')
    expect(result.Component).toBeNull()
    expect(result.error).toBeNull()
  })

  it('returns null Component for whitespace input', async () => {
    const result = await compileCode('   \n  ')
    expect(result.Component).toBeNull()
    expect(result.error).toBeNull()
  })

  it('compiles an arrow function component', async () => {
    const code = `const MyComponent = () => {
  const frame = useCurrentFrame()
  return React.createElement('div', null, 'Frame: ' + frame)
}`
    const result = await compileCode(code)
    expect(result.error).toBeNull()
    expect(typeof result.Component).toBe('function')
  })

  it('compiles a named function component', async () => {
    const code = `function MyComponent() {
  return React.createElement('div', null, 'Hello')
}`
    const result = await compileCode(code)
    expect(result.error).toBeNull()
    expect(typeof result.Component).toBe('function')
  })

  it('returns the last PascalCase component when helpers are present', async () => {
    const code = `const Helper = () => React.createElement('span', null, 'helper')

const MainComponent = () => {
  return React.createElement('div', null, React.createElement(Helper))
}`
    const result = await compileCode(code)
    expect(result.error).toBeNull()
    expect(typeof result.Component).toBe('function')
  })

  it('compiles full LLM output with fences and imports', async () => {
    const code = [
      '```tsx',
      "import React from 'react'",
      "import { useCurrentFrame, AbsoluteFill } from 'remotion'",
      '',
      'export default function MyMotion() {',
      '  const frame = useCurrentFrame()',
      "  return React.createElement(AbsoluteFill, null, 'frame ' + frame)",
      '}',
      '```',
    ].join('\n')

    const result = await compileCode(code)
    expect(result.error).toBeNull()
    expect(typeof result.Component).toBe('function')
  })

  it('returns error for syntax errors', async () => {
    const code = 'const MyComponent = () => { return <div'
    const result = await compileCode(code)
    expect(result.Component).toBeNull()
    expect(result.error).toBeTruthy()
    expect(typeof result.error).toBe('string')
  })

  it('returns error when no component is produced', async () => {
    // A PascalCase const that evaluates to a non-function value
    const code = 'const Widget = 42'
    const result = await compileCode(code)
    expect(result.Component).toBeNull()
    expect(result.error).toContain('did not produce a valid React component')
  })
})

import { describe, it, expect } from 'vitest'
import { AVAILABLE_MODULES, getFlatModuleExports } from '@/lib/remotion/available-modules'

describe('AVAILABLE_MODULES', () => {
  it('has a remotion module', () => {
    expect(AVAILABLE_MODULES).toHaveProperty('remotion')
  })

  it('remotion module contains Video', () => {
    expect(AVAILABLE_MODULES.remotion).toHaveProperty('Video')
  })

  it('remotion module contains OffthreadVideo', () => {
    expect(AVAILABLE_MODULES.remotion).toHaveProperty('OffthreadVideo')
  })

  it('remotion module contains Audio', () => {
    expect(AVAILABLE_MODULES.remotion).toHaveProperty('Audio')
  })

  it('has react module with hooks', () => {
    expect(AVAILABLE_MODULES.react).toHaveProperty('useState')
    expect(AVAILABLE_MODULES.react).toHaveProperty('useEffect')
    expect(AVAILABLE_MODULES.react).toHaveProperty('useCallback')
    expect(AVAILABLE_MODULES.react).toHaveProperty('useMemo')
    expect(AVAILABLE_MODULES.react).toHaveProperty('useRef')
  })

  it('has shapes module', () => {
    const shapes = AVAILABLE_MODULES['@remotion/shapes']
    expect(shapes).toBeDefined()
    expect(shapes).toHaveProperty('Rect')
    expect(shapes).toHaveProperty('Circle')
    expect(shapes).toHaveProperty('Triangle')
    expect(shapes).toHaveProperty('Star')
    expect(shapes).toHaveProperty('Ellipse')
    expect(shapes).toHaveProperty('Pie')
  })

  it('has transitions module', () => {
    const transitions = AVAILABLE_MODULES['@remotion/transitions']
    expect(transitions).toBeDefined()
    expect(transitions).toHaveProperty('TransitionSeries')
    expect(transitions).toHaveProperty('linearTiming')
    expect(transitions).toHaveProperty('springTiming')
  })

  it('has paths module', () => {
    const paths = AVAILABLE_MODULES['@remotion/paths']
    expect(paths).toBeDefined()
    expect(paths).toHaveProperty('evolvePath')
    expect(paths).toHaveProperty('getLength')
    expect(paths).toHaveProperty('getPointAtLength')
  })
})

describe('getFlatModuleExports', () => {
  const flat = getFlatModuleExports()

  it('includes Remotion core exports', () => {
    expect(flat).toHaveProperty('useCurrentFrame')
    expect(flat).toHaveProperty('useVideoConfig')
    expect(flat).toHaveProperty('interpolate')
    expect(flat).toHaveProperty('spring')
    expect(flat).toHaveProperty('Sequence')
    expect(flat).toHaveProperty('AbsoluteFill')
    expect(flat).toHaveProperty('Video')
    expect(flat).toHaveProperty('Audio')
  })

  it('includes shape exports', () => {
    expect(flat).toHaveProperty('Rect')
    expect(flat).toHaveProperty('Circle')
    expect(flat).toHaveProperty('Triangle')
  })

  it('includes transition exports', () => {
    expect(flat).toHaveProperty('TransitionSeries')
    expect(flat).toHaveProperty('fade')
    expect(flat).toHaveProperty('slide')
    expect(flat).toHaveProperty('wipe')
  })

  it('includes paths exports', () => {
    expect(flat).toHaveProperty('evolvePath')
    expect(flat).toHaveProperty('getLength')
    expect(flat).toHaveProperty('getPointAtLength')
  })

  it('includes React hooks', () => {
    expect(flat).toHaveProperty('useState')
    expect(flat).toHaveProperty('useEffect')
    expect(flat).toHaveProperty('useCallback')
    expect(flat).toHaveProperty('useMemo')
    expect(flat).toHaveProperty('useRef')
    expect(flat).toHaveProperty('createElement')
    expect(flat).toHaveProperty('Fragment')
  })

  it('excludes the "default" key', () => {
    expect(flat).not.toHaveProperty('default')
  })

  it('all values are defined', () => {
    for (const [key, value] of Object.entries(flat)) {
      expect(value, `${key} should be defined`).toBeDefined()
    }
  })
})

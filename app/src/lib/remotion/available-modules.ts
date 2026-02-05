import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  Easing,
  Img,
  staticFile,
  random,
} from 'remotion'

import {
  Rect,
  Circle,
  Triangle,
  Star,
  Ellipse,
  Pie,
} from '@remotion/shapes'

import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'

import {
  evolvePath,
  getLength,
  getPointAtLength,
} from '@remotion/paths'

/**
 * Map of module specifiers to their exports.
 * Used by the compiler to inject dependencies into evaluated code.
 */
export const AVAILABLE_MODULES: Record<string, Record<string, unknown>> = {
  react: {
    default: React,
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useRef: React.useRef,
    createElement: React.createElement,
    Fragment: React.Fragment,
  },
  remotion: {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Sequence,
    AbsoluteFill,
    Easing,
    Img,
    staticFile,
    random,
  },
  '@remotion/shapes': {
    Rect,
    Circle,
    Triangle,
    Star,
    Ellipse,
    Pie,
  },
  '@remotion/transitions': {
    TransitionSeries,
    linearTiming,
    springTiming,
  },
  '@remotion/transitions/fade': { fade },
  '@remotion/transitions/slide': { slide },
  '@remotion/transitions/wipe': { wipe },
  '@remotion/paths': {
    evolvePath,
    getLength,
    getPointAtLength,
  },
}

/**
 * Flat map of all available identifiers for injection into the global scope
 * of compiled code.
 */
export function getFlatModuleExports(): Record<string, unknown> {
  const flat: Record<string, unknown> = {}
  for (const mod of Object.values(AVAILABLE_MODULES)) {
    for (const [key, value] of Object.entries(mod)) {
      if (key !== 'default') {
        flat[key] = value
      }
    }
  }
  return flat
}

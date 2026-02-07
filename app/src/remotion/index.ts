import React from 'react'
import { Composition } from 'remotion'
import { DynamicComposition } from './DynamicComposition'

export const RemotionRoot: React.FC = () =>
  React.createElement(Composition, {
    id: 'DynamicMotion',
    component: DynamicComposition,
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 300,
    defaultProps: {
      code: '',
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 300,
    },
  })

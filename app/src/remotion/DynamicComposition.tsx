import React, { useState, useEffect } from 'react'
import { AbsoluteFill } from 'remotion'
import { compileCode } from '@/lib/remotion/compiler'

export const DynamicComposition: React.FC<Record<string, unknown>> = (props) => {
  const code = (props.code as string) || ''
  const [Component, setComponent] = useState<React.FC | null>(null)

  useEffect(() => {
    if (!code) return
    compileCode(code).then((result) => {
      if (result.Component) setComponent(() => result.Component)
    })
  }, [code])

  if (!Component) return <AbsoluteFill style={{ background: '#000' }} />
  return <Component />
}

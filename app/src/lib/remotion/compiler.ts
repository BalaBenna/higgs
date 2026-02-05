import React from 'react'
import { extractComponentCode } from './sanitize'
import { getFlatModuleExports, AVAILABLE_MODULES } from './available-modules'
import type { CompilationResult } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let babelModule: any = null

async function loadBabel() {
  if (babelModule) return babelModule
  // @ts-expect-error - @babel/standalone doesn't have proper TS types for dynamic import
  babelModule = await import('@babel/standalone')
  return babelModule
}

function createRequire() {
  return function require(specifier: string) {
    const mod = AVAILABLE_MODULES[specifier]
    if (mod) return mod
    throw new Error(`Module "${specifier}" is not available in the Remotion sandbox.`)
  }
}

/**
 * Compile LLM-generated code into a React component.
 *
 * This uses the same client-side Babel compilation approach as the official
 * Remotion template-prompt-to-motion-graphics repo. The code is AI-generated
 * (not user-supplied) and runs only in the client browser.
 *
 * Steps:
 * 1. Clean the raw code (strip fences, imports, exports)
 * 2. Transpile with Babel (react + typescript presets)
 * 3. Execute with injected Remotion dependencies
 * 4. Return the component or an error
 */
export async function compileCode(rawCode: string): Promise<CompilationResult> {
  if (!rawCode.trim()) {
    return { Component: null, error: null }
  }

  try {
    const babel = await loadBabel()
    const cleaned = extractComponentCode(rawCode)
    const wrappedCode = wrapForEvaluation(cleaned)

    const transpiled = babel.transform(wrappedCode, {
      presets: ['react', 'typescript'],
      filename: 'motion-component.tsx',
    })

    if (!transpiled?.code) {
      return { Component: null, error: 'Babel transpilation returned empty result.' }
    }

    const flatExports = getFlatModuleExports()
    const require = createRequire()

    const scopeKeys = [...Object.keys(flatExports), 'React', 'require']
    const scopeValues = [
      ...Object.values(flatExports),
      React,
      require,
    ]

    // Execute the transpiled AI-generated Remotion component code.
    // This is the standard approach from Remotion's official
    // template-prompt-to-motion-graphics — AI code is compiled client-side
    // with Babel and evaluated with injected Remotion module dependencies.
    const factory = new Function(...scopeKeys, transpiled.code) // eslint-disable-line no-new-func
    const result = factory(...scopeValues)

    if (typeof result === 'function') {
      return { Component: result, error: null }
    }

    if (result && typeof result === 'object' && typeof result.default === 'function') {
      return { Component: result.default, error: null }
    }

    return {
      Component: null,
      error: 'The generated code did not produce a valid React component.',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { Component: null, error: message }
  }
}

/**
 * Wrap user code so the last variable declaration (the component) is returned.
 */
function wrapForEvaluation(code: string): string {
  const constMatches = [...code.matchAll(/(?:const|let|var)\s+([A-Z]\w*)\s*=/g)]
  if (constMatches.length > 0) {
    const lastMatch = constMatches[constMatches.length - 1]
    const componentName = lastMatch[1]
    return `${code}\nreturn ${componentName};`
  }

  if (code.trim().startsWith('(') || code.trim().startsWith('function')) {
    return `return (${code.trim()});`
  }

  return `return (${code});`
}

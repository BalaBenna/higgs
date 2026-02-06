/**
 * Strip markdown code fences from LLM output.
 * e.g. ```tsx\n...\n``` -> ...
 */
export function stripMarkdownFences(raw: string): string {
  let code = raw.trim()
  // Remove opening fence (```tsx, ```jsx, ```typescript, ```javascript, ```)
  code = code.replace(/^```(?:tsx|jsx|typescript|javascript|ts|js)?\s*\n?/, '')
  // Remove closing fence
  code = code.replace(/\n?```\s*$/, '')
  return code.trim()
}

/**
 * Remove import statements since all modules are injected at runtime.
 * Handles multi-line imports like:
 *   import {
 *     Foo,
 *     Bar,
 *   } from 'module'
 */
function removeImports(code: string): string {
  // Multi-line and single-line named/default imports: import ... from '...'
  code = code.replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]*['"];?\s*/g, '')
  // Side-effect imports: import '...'
  code = code.replace(/import\s+['"][^'"]*['"];?\s*/g, '')
  return code
}

/**
 * Remove export keywords since we evaluate and capture the component directly.
 * Uses line-anchored patterns to avoid mangling string content.
 */
function removeExports(code: string): string {
  code = code.replace(/^export\s+default\s+/gm, '')
  code = code.replace(
    /^export\s+(?=(?:const|let|var|function|class|type|interface|enum|abstract)\s)/gm,
    ''
  )
  return code
}

/**
 * Extract a single arrow function component from the code.
 * Handles both `const Component = () => { ... }` and direct arrow function syntax.
 */
export function extractComponentCode(raw: string): string {
  let code = stripMarkdownFences(raw)
  code = removeImports(code)
  code = removeExports(code)
  return code.trim()
}

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
 */
function removeImports(code: string): string {
  return code
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      // Remove single-line imports
      if (trimmed.startsWith('import ') && trimmed.includes(' from ')) return false
      if (trimmed.startsWith('import {') && trimmed.includes(' from ')) return false
      return true
    })
    .join('\n')
}

/**
 * Remove export keywords since we evaluate and capture the component directly.
 */
function removeExports(code: string): string {
  return code
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '')
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

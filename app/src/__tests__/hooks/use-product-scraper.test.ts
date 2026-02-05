import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useProductScraper } from '@/hooks/use-product-scraper'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useProductScraper', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns structured data on successful scrape', async () => {
    const mockData = {
      product_name: 'Test Product',
      product_description: 'A great product',
      images: ['https://example.com/img1.jpg'],
      favicon: 'https://example.com/favicon.ico',
      site_name: 'Example',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { result } = renderHook(() => useProductScraper(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ url: 'https://example.com/product' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.product_name).toBe('Test Product')
  })

  it('handles 400 error for invalid URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { result } = renderHook(() => useProductScraper(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ url: 'not-a-url' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Invalid URL')
  })

  it('handles network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useProductScraper(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ url: 'https://example.com' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network error')
  })

  it('sets isPending to true during request', async () => {
    let resolveResponse: (value: Response) => void
    const pendingPromise = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })

    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(pendingPromise)

    const { result } = renderHook(() => useProductScraper(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ url: 'https://example.com' })

    await waitFor(() => expect(result.current.isPending).toBe(true))

    resolveResponse!(
      new Response(JSON.stringify({ product_name: '', product_description: '', images: [], favicon: '', site_name: '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await waitFor(() => expect(result.current.isPending).toBe(false))
  })
})

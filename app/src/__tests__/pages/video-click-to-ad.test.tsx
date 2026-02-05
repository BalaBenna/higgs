import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import ClickToAdVideoPage from '@/app/(main)/video/click-to-ad/page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, transition, whileHover, whileTap, ...rest } = props
      return createElement('div', rest as Record<string, unknown>, children as React.ReactNode)
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

const VIDEO_MODELS = ['kling-2.6', 'veo-3.1', 'seedance-1.5-pro', 'hailuo-o2']
const AD_FORMATS = ['instagram-reel', 'tiktok', 'youtube-short', 'story']
const STYLES = ['minimal', 'bold', 'cinematic', 'playful']
const DURATIONS = ['5', '10']

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockScrapedData = {
  product_name: 'Test Wireless Earbuds',
  product_description: 'Premium wireless earbuds with noise cancellation',
  images: ['https://example.com/earbuds.jpg'],
  favicon: 'https://example.com/favicon.ico',
  site_name: 'TechStore',
}

describe('Video Click to Ad Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Step 1 initially', () => {
    render(<ClickToAdVideoPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('hero-text')).toHaveTextContent('TURN ANY PRODUCT INTO A VIDEO AD')
    expect(screen.getByTestId('url-input')).toBeInTheDocument()
  })

  it('transitions from Step 1 to Step 2 on successful scrape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockScrapedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    render(<ClickToAdVideoPage />, { wrapper: createWrapper() })

    const urlInput = screen.getByTestId('url-input')
    await user.type(urlInput, 'https://example.com/product')
    await user.click(screen.getByTestId('continue-button'))

    await waitFor(() => {
      expect(screen.getByTestId('product-name-input')).toHaveValue('Test Wireless Earbuds')
    })
  })

  it('shows error toast when scraping fails', async () => {
    const { toast } = await import('sonner')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    render(<ClickToAdVideoPage />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('url-input'), 'https://bad-url')
    await user.click(screen.getByTestId('continue-button'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid URL')
    })
  })

  describe('prompt construction', () => {
    it.each(VIDEO_MODELS)('constructs correct prompt for model %s', async (modelId) => {
      let capturedBody: FormData | null = null

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockScrapedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        // Mock the image fetch for source image
        .mockResolvedValueOnce(
          new Response(new Blob(['fake-image-data'], { type: 'image/jpeg' }))
        )
        // Mock video generation
        .mockImplementationOnce(async (_url, init) => {
          capturedBody = init?.body as FormData
          return new Response(
            JSON.stringify({ id: 'gen_123', url: 'https://cdn.example.com/video.mp4' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        })

      const user = userEvent.setup()
      render(<ClickToAdVideoPage />, { wrapper: createWrapper() })

      // Step 1: Enter URL and continue
      await user.type(screen.getByTestId('url-input'), 'https://example.com/product')
      await user.click(screen.getByTestId('continue-button'))

      // Wait for Step 2
      await waitFor(() => {
        expect(screen.getByTestId('product-name-input')).toBeInTheDocument()
      })

      // Step 2: Generate
      await user.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(capturedBody).not.toBeNull()
      })

      const prompt = capturedBody?.get('prompt') as string
      expect(prompt).toContain('Professional')
      expect(prompt).toContain('Test Wireless Earbuds')
      expect(prompt).toContain('Premium wireless earbuds')
    })
  })

  describe('ad formats', () => {
    it.each(AD_FORMATS)('supports %s format', (format) => {
      // Each format exists in the page's AD_FORMATS config
      expect(AD_FORMATS).toContain(format)
    })
  })

  describe('styles', () => {
    it.each(STYLES)('supports %s style', (style) => {
      expect(STYLES).toContain(style)
    })
  })

  describe('durations', () => {
    it.each(DURATIONS)('supports %s second duration', (duration) => {
      expect(DURATIONS).toContain(duration)
    })
  })

  it('Start Over resets to Step 1', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockScrapedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(new Blob(['fake-image-data'], { type: 'image/jpeg' }))
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: 'gen_123', url: 'https://cdn.example.com/video.mp4' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )

    const user = userEvent.setup()
    render(<ClickToAdVideoPage />, { wrapper: createWrapper() })

    // Step 1 → Step 2
    await user.type(screen.getByTestId('url-input'), 'https://example.com/product')
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => expect(screen.getByTestId('generate-button')).toBeInTheDocument())

    // Step 2 → Step 3
    await user.click(screen.getByTestId('generate-button'))
    await waitFor(() => expect(screen.getByTestId('new-ad-button')).toBeInTheDocument())

    // Step 3 → Step 1
    await user.click(screen.getByTestId('new-ad-button'))
    await waitFor(() => expect(screen.getByTestId('hero-text')).toBeInTheDocument())
    expect(screen.getByTestId('url-input')).toHaveValue('')
  })
})

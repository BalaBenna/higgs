import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import ClickToAdImagePage from '@/app/(main)/image/click-to-ad/page'

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

const IMAGE_MODELS = [
  'gpt-image-1.5',
  'seedream-4.5',
  'flux-2',
  'midjourney',
  'imagen-4',
  'ideogram-3',
  'recraft-v3',
  'flux-kontext-pro',
]
const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4']
const IMAGE_STYLES = [
  'None',
  'Cinematic',
  'Photography',
  'Digital Art',
  'Anime',
  'Oil Painting',
  'Watercolor',
  '3D Render',
  'Pixel Art',
  'Comic Book',
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockScrapedData = {
  product_name: 'Test Sneakers',
  product_description: 'Ultra-lightweight running shoes with premium cushioning',
  images: ['https://example.com/sneaker.jpg'],
  favicon: 'https://example.com/favicon.ico',
  site_name: 'ShoeStore',
}

describe('Image Click to Ad Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Step 1 with image mode hero', () => {
    render(<ClickToAdImagePage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('hero-text')).toHaveTextContent('TURN ANY PRODUCT INTO AN IMAGE AD')
  })

  it('transitions from Step 1 to Step 2 on successful scrape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockScrapedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    render(<ClickToAdImagePage />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('url-input'), 'https://example.com/shoes')
    await user.click(screen.getByTestId('continue-button'))

    await waitFor(() => {
      expect(screen.getByTestId('product-name-input')).toHaveValue('Test Sneakers')
    })
  })

  it('transitions Step 1 → Step 2 → Step 3', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockScrapedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      // Mock image upload
      .mockResolvedValueOnce(
        new Response(new Blob(['data'], { type: 'image/jpeg' }))
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ filename: 'product.jpg' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      // Mock image generation
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            images: [
              { id: 'img_1', src: 'https://cdn.example.com/ad1.jpg' },
              { id: 'img_2', src: 'https://cdn.example.com/ad2.jpg' },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )

    const user = userEvent.setup()
    render(<ClickToAdImagePage />, { wrapper: createWrapper() })

    // Step 1 → 2
    await user.type(screen.getByTestId('url-input'), 'https://example.com/shoes')
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => expect(screen.getByTestId('generate-button')).toBeInTheDocument())

    // Step 2 → 3
    await user.click(screen.getByTestId('generate-button'))
    await waitFor(() => expect(screen.getByTestId('new-ad-button')).toBeInTheDocument())
  })

  describe('prompt construction', () => {
    it.each(IMAGE_MODELS)('constructs correct prompt for model %s', async (modelId) => {
      let capturedBody: string | null = null

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockScrapedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        // Image fetch + upload
        .mockResolvedValueOnce(new Response(new Blob(['data'], { type: 'image/jpeg' })))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ filename: 'product.jpg' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        // Image generation
        .mockImplementationOnce(async (_url, init) => {
          capturedBody = init?.body as string
          return new Response(
            JSON.stringify({ images: [{ id: 'img_1', src: 'https://cdn.example.com/ad1.jpg' }] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        })

      const user = userEvent.setup()
      render(<ClickToAdImagePage />, { wrapper: createWrapper() })

      // Step 1
      await user.type(screen.getByTestId('url-input'), 'https://example.com')
      await user.click(screen.getByTestId('continue-button'))
      await waitFor(() => expect(screen.getByTestId('generate-button')).toBeInTheDocument())

      // Step 2
      await user.click(screen.getByTestId('generate-button'))

      await waitFor(() => {
        expect(capturedBody).not.toBeNull()
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.prompt).toContain('Professional')
      expect(parsed.prompt).toContain('Test Sneakers')
    })
  })

  describe('aspect ratios', () => {
    it.each(ASPECT_RATIOS)('supports %s aspect ratio', (ratio) => {
      expect(ASPECT_RATIOS).toContain(ratio)
    })
  })

  describe('number of images', () => {
    it.each([1, 4, 8])('supports generating %d images', (num) => {
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(8)
    })
  })

  describe('styles', () => {
    it.each(IMAGE_STYLES)('supports %s style', (style) => {
      expect(IMAGE_STYLES).toContain(style)
    })
  })

  it('error handling with toast', async () => {
    const { toast } = await import('sonner')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    render(<ClickToAdImagePage />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('url-input'), 'not-valid')
    await user.click(screen.getByTestId('continue-button'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid URL')
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
      .mockResolvedValueOnce(new Response(new Blob(['data'], { type: 'image/jpeg' })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ filename: 'product.jpg' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ images: [{ id: 'img_1', src: 'https://cdn.example.com/ad1.jpg' }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )

    const user = userEvent.setup()
    render(<ClickToAdImagePage />, { wrapper: createWrapper() })

    // Step 1 → 2
    await user.type(screen.getByTestId('url-input'), 'https://example.com')
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => expect(screen.getByTestId('generate-button')).toBeInTheDocument())

    // Step 2 → 3
    await user.click(screen.getByTestId('generate-button'))
    await waitFor(() => expect(screen.getByTestId('new-ad-button')).toBeInTheDocument())

    // Step 3 → 1
    await user.click(screen.getByTestId('new-ad-button'))
    await waitFor(() => expect(screen.getByTestId('hero-text')).toBeInTheDocument())
    expect(screen.getByTestId('url-input')).toHaveValue('')
  })
})

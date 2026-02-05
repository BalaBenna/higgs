import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClickToAdProductKit, type ProductKitData } from '@/components/click-to-ad/ClickToAdProductKit'

const mockProduct: ProductKitData = {
  productName: 'Test Product',
  productDescription: 'A great product for testing',
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  selectedImages: ['https://example.com/img1.jpg'],
  favicon: 'https://example.com/favicon.ico',
  siteName: 'TestStore',
}

const videoModels = [
  { id: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', quality: 'High' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
]

const imageModels = [
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI' },
  { id: 'flux-2', name: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new' },
]

const defaultVideoConfig = {
  model: 'kling-2.6',
  adFormat: 'instagram-reel',
  duration: '5',
  style: 'cinematic',
}

const defaultImageConfig = {
  model: 'gpt-image-1.5',
  aspectRatio: '1:1',
  numImages: 4,
  imageStyle: 'None',
}

describe('ClickToAdProductKit', () => {
  it('renders product name from scraped data', () => {
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    const input = screen.getByTestId('product-name-input')
    expect(input).toHaveValue('Test Product')
  })

  it('renders product description from scraped data', () => {
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    const textarea = screen.getByTestId('product-description-input')
    expect(textarea).toHaveValue('A great product for testing')
  })

  it('product name is editable', async () => {
    const onProductChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={onProductChange}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )

    const input = screen.getByTestId('product-name-input')
    await user.clear(input)
    await user.type(input, 'New Name')
    expect(onProductChange).toHaveBeenCalled()
  })

  it('image grid renders with correct count', () => {
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    const grid = screen.getByTestId('image-grid')
    expect(grid).toBeInTheDocument()
    const buttons = screen.getAllByTestId('image-select-button')
    expect(buttons.length).toBe(2)
  })

  it('clicking image toggles selection', async () => {
    const onProductChange = vi.fn()
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={onProductChange}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    const buttons = screen.getAllByTestId('image-select-button')
    fireEvent.click(buttons[1]) // Click the unselected image
    expect(onProductChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedImages: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      })
    )
  })

  it('shows model selector for video mode', () => {
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })

  it('shows model selector for image mode', () => {
    render(
      <ClickToAdProductKit
        mode="image"
        product={mockProduct}
        onProductChange={vi.fn()}
        imageConfig={defaultImageConfig}
        onImageConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={false}
        imageModels={imageModels}
      />
    )
    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })

  it('back button calls onBack', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={onBack}
        onGenerate={vi.fn()}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    await user.click(screen.getByTestId('back-button'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('generate button calls onGenerate', async () => {
    const onGenerate = vi.fn()
    const user = userEvent.setup()
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={onGenerate}
        isGenerating={false}
        videoModels={videoModels}
      />
    )
    await user.click(screen.getByTestId('generate-button'))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('shows generating state', () => {
    render(
      <ClickToAdProductKit
        mode="video"
        product={mockProduct}
        onProductChange={vi.fn()}
        videoConfig={defaultVideoConfig}
        onVideoConfigChange={vi.fn()}
        onBack={vi.fn()}
        onGenerate={vi.fn()}
        isGenerating={true}
        videoModels={videoModels}
      />
    )
    expect(screen.getByTestId('generate-button')).toBeDisabled()
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })
})

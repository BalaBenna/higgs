import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClickToAdUrlStep } from '@/components/click-to-ad/ClickToAdUrlStep'

const defaultProps = {
  mode: 'video' as const,
  url: '',
  onUrlChange: vi.fn(),
  autoAnalyze: true,
  onAutoAnalyzeChange: vi.fn(),
  additionalContext: '',
  onAdditionalContextChange: vi.fn(),
  onContinue: vi.fn(),
  isLoading: false,
}

describe('ClickToAdUrlStep', () => {
  it('renders correct hero text for video mode', () => {
    render(<ClickToAdUrlStep {...defaultProps} mode="video" />)
    expect(screen.getByTestId('hero-text')).toHaveTextContent('TURN ANY PRODUCT INTO A VIDEO AD')
  })

  it('renders correct hero text for image mode', () => {
    render(<ClickToAdUrlStep {...defaultProps} mode="image" />)
    expect(screen.getByTestId('hero-text')).toHaveTextContent('TURN ANY PRODUCT INTO AN IMAGE AD')
  })

  it('renders URL input with placeholder', () => {
    render(<ClickToAdUrlStep {...defaultProps} />)
    const input = screen.getByTestId('url-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('product URL'))
  })

  it('continue button is disabled when URL is empty', () => {
    render(<ClickToAdUrlStep {...defaultProps} url="" />)
    expect(screen.getByTestId('continue-button')).toBeDisabled()
  })

  it('continue button is enabled when URL has value', () => {
    render(<ClickToAdUrlStep {...defaultProps} url="https://example.com" />)
    expect(screen.getByTestId('continue-button')).not.toBeDisabled()
  })

  it('auto-analyze checkbox toggles', async () => {
    const onAutoAnalyzeChange = vi.fn()
    render(
      <ClickToAdUrlStep
        {...defaultProps}
        autoAnalyze={true}
        onAutoAnalyzeChange={onAutoAnalyzeChange}
      />
    )
    const checkbox = screen.getByTestId('auto-analyze-checkbox')
    fireEvent.click(checkbox)
    expect(onAutoAnalyzeChange).toHaveBeenCalledWith(false)
  })

  it('additional context section expands and collapses', async () => {
    const user = userEvent.setup()
    render(<ClickToAdUrlStep {...defaultProps} />)

    // Initially hidden
    expect(screen.queryByTestId('additional-context-input')).not.toBeInTheDocument()

    // Click to expand
    await user.click(screen.getByTestId('additional-context-toggle'))
    expect(screen.getByTestId('additional-context-input')).toBeInTheDocument()

    // Click to collapse
    await user.click(screen.getByTestId('additional-context-toggle'))
    expect(screen.queryByTestId('additional-context-input')).not.toBeInTheDocument()
  })

  it('calls onContinue when button is clicked', async () => {
    const onContinue = vi.fn()
    const user = userEvent.setup()
    render(
      <ClickToAdUrlStep {...defaultProps} url="https://example.com" onContinue={onContinue} />
    )
    await user.click(screen.getByTestId('continue-button'))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when isLoading is true', () => {
    render(<ClickToAdUrlStep {...defaultProps} url="https://example.com" isLoading={true} />)
    expect(screen.getByTestId('continue-button')).toBeDisabled()
    expect(screen.getByText('Analyzing product...')).toBeInTheDocument()
  })
})

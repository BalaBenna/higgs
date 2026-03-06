'use client'

import { useMutation } from '@tanstack/react-query'
import { getRequiredAuthHeaders } from '@/lib/auth-headers'

interface ScrapeProductParams {
  url: string
  autoAnalyze?: boolean
}

function normalizeProductUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export interface ProductData {
  product_name: string
  product_description: string
  images: string[]
  favicon: string
  site_name: string
}

export function useProductScraper() {
  return useMutation({
    mutationFn: async (params: ScrapeProductParams): Promise<ProductData> => {
      const normalizedUrl = normalizeProductUrl(params.url)
      const authHeaders = await getRequiredAuthHeaders()
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          url: normalizedUrl,
          auto_analyze: params.autoAnalyze ?? true,
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Failed to scrape product'
        try {
          const errorText = await response.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMsg = errorData.detail || errorMsg
          } catch {
            errorMsg = errorText || errorMsg
          }
        } catch { }
        throw new Error(errorMsg)
      }

      return response.json()
    },
  })
}

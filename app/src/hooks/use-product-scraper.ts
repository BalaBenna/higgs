'use client'

import { useMutation } from '@tanstack/react-query'

interface ScrapeProductParams {
  url: string
  autoAnalyze?: boolean
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
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: params.url,
          auto_analyze: params.autoAnalyze ?? true,
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Failed to scrape product'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorMsg
        } catch {
          errorMsg = (await response.text()) || errorMsg
        }
        throw new Error(errorMsg)
      }

      return response.json()
    },
  })
}

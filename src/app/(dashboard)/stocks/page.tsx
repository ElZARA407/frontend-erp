// src/app/(dashboard)/stocks/page.tsx
import type { Metadata } from 'next'
import { StocksView } from '@/components/features/stocks/stocks-view'

export const metadata: Metadata = { title: 'Stocks' }

export default function StocksPage() {
  return <StocksView />
}
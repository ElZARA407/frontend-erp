// src/app/(dashboard)/production/page.tsx
import type { Metadata } from 'next'
import { ProductionView } from '@/components/features/production/production-view'

export const metadata: Metadata = { title: 'Production' }

export default function ProductionPage() {
  return <ProductionView />
}
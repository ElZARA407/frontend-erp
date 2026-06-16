// src/app/(dashboard)/catalogue/page.tsx
import type { Metadata } from 'next'
import { CatalogueView } from '@/components/features/catalogue/catalogue-view'

export const metadata: Metadata = {
  title: 'Catalogue',
}

export default function CataloguePage() {
  return <CatalogueView />
}
// src/app/(dashboard)/factures/page.tsx
import type { Metadata } from 'next'
import { FacturesView } from '@/components/features/factures/factures-view'

export const metadata: Metadata = { title: 'Factures' }

export default function FacturesPage() {
  return <FacturesView />
}
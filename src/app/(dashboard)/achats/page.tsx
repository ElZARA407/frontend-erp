// src/app/(dashboard)/achats/page.tsx
import type { Metadata } from 'next'
import { AchatsView } from '@/components/features/achats/achats-view'

export const metadata: Metadata = { title: 'Achats / Bons de réception' }

export default function AchatsPage() {
  return <AchatsView />
}
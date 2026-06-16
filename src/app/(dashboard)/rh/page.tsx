// src/app/(dashboard)/rh/page.tsx
import type { Metadata } from 'next'
import { RhView } from '@/components/features/rh/rh-view'

export const metadata: Metadata = {
  title: 'RH',
}

export default function RhPage() {
  return <RhView />
}
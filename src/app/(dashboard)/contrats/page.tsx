// src/app/(dashboard)/contrats/page.tsx
import type { Metadata } from 'next'
import { ContratsView } from '@/components/features/contrats/contrats-view'

export const metadata: Metadata = {
  title: 'Contrats',
}

export default function ContratsPage() {
  return <ContratsView />
}
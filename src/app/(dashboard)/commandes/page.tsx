// src/app/(dashboard)/commandes/page.tsx
import type { Metadata } from 'next'
import { CommandesView } from '@/components/features/commandes/commandes-view'

export const metadata: Metadata = { title: 'Commandes' }

export default function CommandesPage() {
  return <CommandesView />
}
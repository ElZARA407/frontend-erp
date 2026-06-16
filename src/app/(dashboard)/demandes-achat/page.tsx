// src/app/(dashboard)/demandes-achat/page.tsx
import type { Metadata } from 'next'
import { DemandesAchatView } from '@/components/features/demandes-achat/demandes-achat-view'

export const metadata: Metadata = {
  title: 'Demandes d’achat',
}

export default function DemandesAchatPage() {
  return <DemandesAchatView />
}
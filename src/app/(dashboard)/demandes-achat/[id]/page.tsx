// src/app/(dashboard)/demandes-achat/[id]/page.tsx
import type { Metadata } from 'next'
import { DemandeAchatDetailView } from '@/components/features/demandes-achat/demande-achat-detail-view'

export const metadata: Metadata = {
  title: 'Demande d’achat détail',
}

export default async function DemandeAchatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <DemandeAchatDetailView demandeId={Number(id)} />
}
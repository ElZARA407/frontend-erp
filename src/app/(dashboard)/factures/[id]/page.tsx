import type { Metadata } from 'next'
import { FactureDetailView } from '@/components/features/factures/facture-detail-view'

export const metadata: Metadata = {
  title: 'Détail facture',
}

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FactureDetailView factureId={Number(id)} />
}
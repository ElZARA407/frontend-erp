import type { Metadata } from 'next'
import { VenteDirecteDetailView } from '@/components/features/ventes-directes/vente-directe-detail-view'

export const metadata: Metadata = {
  title: 'Détail vente directe',
}

export default async function VenteDirecteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VenteDirecteDetailView venteId={Number(id)} />
}
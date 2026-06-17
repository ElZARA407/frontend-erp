import type { Metadata } from 'next'
import { BonSortieDetailView } from '@/components/features/bons-sortie/bon-sortie-detail-view'

export const metadata: Metadata = {
  title: 'Détail bon de sortie',
}

export default async function BonSortieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BonSortieDetailView bonId={Number(id)} />
}
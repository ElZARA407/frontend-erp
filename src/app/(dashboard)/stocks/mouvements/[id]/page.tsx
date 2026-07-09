import type { Metadata } from 'next'
import { MouvementStockDetailView } from '@/components/features/stocks/mouvement-stock-detail-view'

export const metadata: Metadata = {
  title: 'Mouvement de stock',
}

export default async function MouvementStockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <MouvementStockDetailView mouvementId={Number(id)} />
}
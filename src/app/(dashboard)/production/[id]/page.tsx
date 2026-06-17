import type { Metadata } from 'next'
import { ProductionDetailView } from '@/components/features/production/bp-detail-view'

export const metadata: Metadata = {
  title: 'Détail production',
}

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductionDetailView bpId={Number(id)} />
}
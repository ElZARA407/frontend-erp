import type { Metadata } from 'next'
import { BtDetailView } from '@/components/features/recyclage/bt-detail-view'

export const metadata: Metadata = {
  title: 'Détail BT',
}

export default async function RecyclageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BtDetailView btId={Number(id)} />
}
// src/app/(dashboard)/achats/[id]/page.tsx
import type { Metadata } from 'next'
import { AchatDetailView } from '@/components/features/achats/achat-detail-view'

export const metadata: Metadata = {
  title: 'Bon de réception détail',
}

export default async function AchatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AchatDetailView achatId={Number(id)} />
}
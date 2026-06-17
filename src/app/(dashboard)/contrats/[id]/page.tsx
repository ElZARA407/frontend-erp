// src/app/(dashboard)/contrats/[id]/page.tsx
import type { Metadata } from 'next'
import { ContratDetailView } from '@/components/features/contrats/contrat-detail-view'

export const metadata: Metadata = {
  title: 'Contrat détail',
}

export default async function ContratDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ContratDetailView contratId={Number(id)} />
}
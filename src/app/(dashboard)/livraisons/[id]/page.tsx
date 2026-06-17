// src/app/(dashboard)/livraisons/[id]/page.tsx
import type { Metadata } from 'next'
import { LivraisonDetailView } from '@/components/features/livraisons/livraison-detail-view'

export const metadata: Metadata = {
  title: 'Livraison détail',
}

export default async function LivraisonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <LivraisonDetailView livraisonId={Number(id)} />
}
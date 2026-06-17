// src/app/(dashboard)/fournisseurs/[id]/page.tsx
import type { Metadata } from 'next'
import { FournisseurDetailView } from '@/components/features/fournisseurs/fournisseur-detail-view'

export const metadata: Metadata = {
  title: 'Fournisseur détail',
}

export default async function FournisseurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <FournisseurDetailView fournisseurId={Number(id)} />
}
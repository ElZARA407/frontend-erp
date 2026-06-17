// src/app/(dashboard)/commandes/[id]/page.tsx
import type { Metadata } from 'next'
import { CommandeDetailView } from '@/components/features/commandes/commande-detail-view'

export const metadata: Metadata = {
  title: 'Commande détail',
}

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <CommandeDetailView commandeId={Number(id)} />
}
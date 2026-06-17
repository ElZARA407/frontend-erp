// src/app/(dashboard)/clients/[id]/page.tsx
import type { Metadata } from 'next'
import { ClientDetailView } from '@/components/features/clients/client-detail-view'

export const metadata: Metadata = {
  title: 'Client détail',
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ClientDetailView clientId={Number(id)} />
}
// src/app/(dashboard)/clients/page.tsx
import type { Metadata } from 'next'
import { ClientsView } from '@/components/features/clients/clients-view'

export const metadata: Metadata = { title: 'Clients' }

export default function ClientsPage() {
  return <ClientsView />
}
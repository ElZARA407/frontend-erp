import type { Metadata } from 'next'
import { VentesDirectesView } from '@/components/features/ventes-directes/ventes-directes-view'

export const metadata: Metadata = {
  title: 'Ventes directes',
}

export default function VentesDirectesPage() {
  return <VentesDirectesView />
}
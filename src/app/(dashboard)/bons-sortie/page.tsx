import type { Metadata } from 'next'
import { BonsSortieView } from '@/components/features/bons-sortie/bons-sortie-view'

export const metadata: Metadata = {
  title: 'Bons de sortie',
}

export default function BonsSortiePage() {
  return <BonsSortieView />
}
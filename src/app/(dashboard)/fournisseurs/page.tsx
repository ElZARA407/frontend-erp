// src/app/(dashboard)/fournisseurs/page.tsx
import type { Metadata } from 'next'
import { FournisseursView } from '@/components/features/fournisseurs/fournisseurs-view'

export const metadata: Metadata = {
  title: 'Fournisseurs',
}

export default function FournisseursPage() {
  return <FournisseursView />
}
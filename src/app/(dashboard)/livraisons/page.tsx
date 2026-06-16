// src/app/(dashboard)/livraisons/page.tsx
import type { Metadata } from 'next'
import { LivraisonsView } from '@/components/features/livraisons/livraisons-view'

export const metadata: Metadata = { title: 'Livraisons' }

export default function LivraisonsPage() {
  return <LivraisonsView />
}
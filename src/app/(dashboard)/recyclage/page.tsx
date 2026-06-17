import type { Metadata } from 'next'
import { RecyclageView } from '@/components/features/recyclage/recyclage-view'

export const metadata: Metadata = {
  title: 'Recyclage',
}

export default function RecyclagePage() {
  return <RecyclageView />
}
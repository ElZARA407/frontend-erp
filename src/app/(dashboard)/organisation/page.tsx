// src/app/(dashboard)/organisation/page.tsx
import type { Metadata } from 'next'
import { OrganisationView } from '@/components/features/organisation/organisation-view'

export const metadata: Metadata = {
  title: 'Organisation',
}

export default function OrganisationPage() {
  return <OrganisationView />
}
// src/app/(dashboard)/recyclage/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Recyclage' }

export default function RecyclagePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-steel-900">Recyclage / Broyage</h1>
        <p className="mt-0.5 text-sm text-steel-500">Bons de transformation matières</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-surface-border py-24 text-steel-400">
        <p className="text-sm">Module recyclage — Même architecture que Production</p>
      </div>
    </div>
  )
}
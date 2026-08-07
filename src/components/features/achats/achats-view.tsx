// src/components/features/achats/achats-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Eye, Package, Plus } from 'lucide-react'
import { useAchats, useValiderAchat } from '@/lib/hooks/use-achats'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { AchatForm } from './achat-form'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import type { JournalAchat } from '@/lib/types'
import { FileDown } from 'lucide-react'
import {  usePdfExport } from '@/lib/hooks/use-pdf-export'
import { useRouter } from 'next/navigation'

export function AchatsView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const {exportPdf, isExporting} = usePdfExport()
  const router = useRouter()

  const { data, isLoading } = useAchats({
    statut: statut || undefined,
    page,
    per_page: 20,
  })
  const { mutate: valider, isPending } = useValiderAchat()

  const paginate = data?.data
  const brs = Array.isArray(paginate?.data) ? paginate.data : []

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'valide', label: 'Validés' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de réception"
        subtitle={`${paginate?.total ?? 0} BR achat${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau BR
          </Button>
        }
      />

      <div className="flex w-fit overflow-hidden rounded-md border border-surface-border text-xs">
        {statutOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setStatut(value)
              setPage(1)
            }}
            className={
              statut === value
                ? 'bg-steel-700 px-3 py-1.5 font-medium text-white'
                : 'bg-white px-3 py-1.5 text-steel-600 hover:bg-surface-subtle'
            }
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : brs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <Package className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucun bon de réception</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Numéro', 'Fournisseur', 'Site', 'Date', 'Total', 'Statut', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {brs.map((br: JournalAchat) => (
                <tr key={br.id} className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                  onClick={() => router.push(`/achats/${br.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="ref-code">{br.numero}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-steel-800">
                    {br.fournisseur?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {br.location?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {formatDate(br.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="amount">{formatMGA(br.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(br.statut)} dot>
                      {br.statut === 'valide' ? 'Validé' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">

                    <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FileDown className="h-3.5 w-3.5" />}
                      loading={isExporting('br', br.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        exportPdf({ type: 'br', document: br })}}
                    >
                      PDF
                    </Button>
                      {br.statut === 'brouillon' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                          loading={isPending}
                          onClick={(event) => {
                            event.stopPropagation()
                            valider(br.id)}}
                        >
                          Valider
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {paginate && (
          <Pagination
            currentPage={paginate.current_page ?? page}
            lastPage={paginate.last_page}
            total={paginate.total}
            from={paginate.from ?? 0}
            to={paginate.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouveau bon de réception"
        size="xl"
      >
        <AchatForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}
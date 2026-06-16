// src/components/features/achats/achats-view.tsx
'use client'
import { useState } from 'react'
import { useAchats, useValiderAchat } from '@/lib/hooks/use-achats'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { Package, CheckCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import type { JournalAchat } from '@/lib/types'

export function AchatsView() {
  const [page, setPage]     = useState(1)
  const [statut, setStatut] = useState<string>('')

  const { data, isLoading }       = useAchats({ statut: statut || undefined, page, per_page: 20 })
  const { mutate: valider, isPending } = useValiderAchat()

  const brs      = data?.data.data ?? []
  const paginate = data?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de Réception"
        subtitle="Achats de matières premières"
      />

      <div className="flex rounded-md border border-surface-border overflow-hidden text-xs w-fit">
        {[
          { value: '',         label: 'Tous'       },
          { value: 'brouillon',label: 'Brouillons' },
          { value: 'valide',   label: 'Validés'    },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatut(value); setPage(1) }}
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
          <TableSkeleton rows={10} cols={6} />
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {brs.map((br: JournalAchat) => (
                <tr key={br.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="px-4 py-3"><span className="ref-code">{br.numero}</span></td>
                  <td className="px-4 py-3 font-medium text-steel-800">{br.fournisseur?.nom ?? '—'}</td>
                  <td className="px-4 py-3 text-steel-600">{br.location?.nom ?? '—'}</td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(br.date)}</td>
                  <td className="px-4 py-3"><span className="amount">{formatMGA(br.total)}</span></td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(br.statut)} dot>
                      {br.statut === 'valide' ? 'Validé' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {br.statut === 'brouillon' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                          loading={isPending}
                          onClick={() => valider(br.id)}
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
            currentPage={paginate.current_page}
            lastPage={paginate.last_page}
            total={paginate.total}
            from={paginate.from ?? 0}
            to={paginate.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}
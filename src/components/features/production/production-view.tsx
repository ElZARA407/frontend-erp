'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Eye, Factory, Plus } from 'lucide-react'
import { useBonsProduction, useClotureBP } from '@/lib/hooks/use-production'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { BpForm } from './bp-form'
import { formatDate, formatMGA, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import type { BonProduction } from '@/lib/types'

export function ProductionView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useBonsProduction({
    statut: statut || undefined,
    page,
    per_page: 20,
  })
  const { mutate: cloture, isPending: closing } = useClotureBP()

  const pagination = data?.data
  const bps = Array.isArray(pagination?.data) ? pagination.data : []

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'ouvert', label: 'Ouverts' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'cloture', label: 'Clôturés' },
    { value: 'annule', label: 'Annulés' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de production"
        subtitle={`${pagination?.total ?? 0} bon${(pagination?.total ?? 0) > 1 ? 's' : ''} de fabrication`}
        actions={
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau BP
          </Button>
        }
      />

      <div className="flex w-fit overflow-hidden rounded-md border border-surface-border text-xs">
        {statutOptions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
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
          <TableSkeleton rows={10} cols={9} />
        ) : bps.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Factory className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun bon de production</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Produit', 'Site', 'Date', 'Cible', 'Produite', 'Taux', 'Coût', 'Statut', ''].map((h) => (
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
                {bps.map((bp: BonProduction) => (
                  <tr key={bp.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <span className="ref-code">{bp.numero}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate font-medium text-steel-800" title={bp.produit?.designation}>
                      {bp.produit?.designation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{bp.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(bp.date)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatQty(bp.quantite_cible)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatQty(bp.quantite_produite)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-subtle">
                          <div
                            className="h-full rounded-full bg-steel-600 transition-all"
                            style={{ width: `${Math.min(100, bp.taux_realisation)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-steel-600">
                          {formatPercent(bp.taux_realisation)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="amount">{formatMGA(bp.cout_total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(bp.statut.valeur)} dot>
                        {bp.statut.libelle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {bp.statut.valeur === 'en_cours' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={closing}
                            icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                            onClick={() => cloture(bp.id)}
                          >
                            Clôturer
                          </Button>
                        )}
                        <Link href={`/production/${bp.id}`}>
                          <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />}>
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.current_page ?? page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from ?? 0}
            to={pagination.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouveau bon de production"
        size="md"
      >
        <BpForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}
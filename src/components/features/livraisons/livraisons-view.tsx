// src/components/features/livraisons/livraisons-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Eye, Truck } from 'lucide-react'
import { useLivraisons, useConfirmerLivraison } from '@/lib/hooks/use-livraisons'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, getStatutColor } from '@/lib/utils'
import type { Livraison } from '@/lib/types'

export function LivraisonsView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')

  const { data, isLoading } = useLivraisons({
    statut: statut || undefined,
    page,
    per_page: 20,
  })
  const { mutate: confirmer, isPending } = useConfirmerLivraison()

  const paginate = data?.data
  const livraisons = Array.isArray(paginate?.data) ? paginate.data : []

  const statutOptions = [
    { value: '', label: 'Toutes' },
    { value: 'prepare', label: 'Préparées' },
    { value: 'livre', label: 'Livrées' },
    { value: 'retourne', label: 'Retournées' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Livraisons"
        subtitle={`${paginate?.total ?? 0} livraison${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
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
          <TableSkeleton rows={10} cols={8} />
        ) : livraisons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <Truck className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucune livraison trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Numéro', 'Client', 'Source', 'Date livraison', 'Chauffeur', 'Facturée', 'Statut', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {livraisons.map((livraison: Livraison) => (
                <tr key={livraison.id} className="transition-colors hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <span className="ref-code">{livraison.numero}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-steel-800">
                    {livraison.client?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={livraison.source_type === 'commande' ? 'info' : 'muted'}>
                      {livraison.source_type === 'commande' ? 'Commande' : 'Vente directe'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {formatDate(livraison.date_livraison)}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {livraison.chauffeur ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={livraison.est_facturee ? 'success' : 'muted'} dot>
                      {livraison.est_facturee ? 'Oui' : 'Non'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(livraison.statut)} dot>
                      {livraison.statut === 'prepare'
                        ? 'Préparée'
                        : livraison.statut === 'livre'
                          ? 'Livrée'
                          : 'Retournée'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {livraison.statut === 'prepare' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                          loading={isPending}
                          onClick={() => confirmer(livraison.id)}
                        >
                          Confirmer
                        </Button>
                      )}
                      <Link href={`/livraisons/${livraison.id}`}>
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
    </div>
  )
}
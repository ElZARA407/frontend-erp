// src/components/features/livraisons/livraisons-view.tsx
'use client'
import { useState } from 'react'
import { useLivraisons, useConfirmerLivraison } from '@/lib/hooks/use-livraisons'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, getStatutColor } from '@/lib/utils'
import { Truck, CheckCircle, Receipt } from 'lucide-react'
import type { Livraison } from '@/lib/types'

export function LivraisonsView() {
  const [page, setPage]     = useState(1)
  const [statut, setStatut] = useState<string>('')

  const { data, isLoading }            = useLivraisons({ statut: statut || undefined, page, per_page: 20 })
  const { mutate: confirmer, isPending } = useConfirmerLivraison()

  const livraisons = data?.data.data ?? []
  const paginate   = data?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Livraisons"
        subtitle="Bons de livraison clients"
      />

      <div className="flex rounded-md border border-surface-border overflow-hidden text-xs w-fit">
        {[
          { value: '',         label: 'Toutes'  },
          { value: 'prepare',  label: 'Préparées' },
          { value: 'livre',    label: 'Livrées'   },
          { value: 'retourne', label: 'Retournées'},
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
          <TableSkeleton rows={10} cols={7} />
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {livraisons.map((l: Livraison) => (
                <tr key={l.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="px-4 py-3"><span className="ref-code">{l.numero}</span></td>
                  <td className="px-4 py-3 font-medium text-steel-800">{l.client?.nom ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.source_type === 'commande' ? 'info' : 'muted'}>
                      {l.source_type === 'commande' ? 'Commande' : 'Vente directe'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(l.date_livraison)}</td>
                  <td className="px-4 py-3 text-steel-600">{l.chauffeur ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.est_facturee ? 'success' : 'muted'} dot>
                      {l.est_facturee ? 'Oui' : 'Non'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(l.statut)} dot>
                      {l.statut === 'prepare' ? 'Préparée' :
                       l.statut === 'livre'   ? 'Livrée'   : 'Retournée'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.statut === 'prepare' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                        loading={isPending}
                        onClick={() => confirmer(l.id)}
                      >
                        Confirmer
                      </Button>
                    )}
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
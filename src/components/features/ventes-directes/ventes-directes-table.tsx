'use client'

import { Pencil, RotateCcw, ShoppingCart, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardBody } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import type { usePermissions } from '@/lib/hooks/use-permissions'
import type { VenteDirecte } from '@/lib/ventes-directes.types'
import type { PaginatedResponse } from '@/lib/types'
import { formatLivraisonStatut, formatVenteStatut } from '@/lib/ventes-directes.types'

interface VentesDirectesTableProps {
  ventes: VenteDirecte[]
  isLoading: boolean
  pagination?: PaginatedResponse<VenteDirecte>['data']
  page: number
  onPageChange: (page: number) => void
  permissions: ReturnType<typeof usePermissions>
  cancelling: boolean
  onEdit: (vente: VenteDirecte) => void
  onDeliver: (vente: VenteDirecte) => void
  onAnnuler: (vente: VenteDirecte) => void
}

function canDeliver(vente: VenteDirecte) {
  return (
    vente.statut === 'validee' &&
    Array.isArray(vente.lignes) &&
    vente.lignes.some((ligne) => Number(ligne.quantite_restante ?? ligne.quantite) > 0)
  )
}

export function VentesDirectesTable({
  ventes,
  isLoading,
  pagination,
  onPageChange,
  permissions,
  cancelling,
  onEdit,
  onDeliver,
  onAnnuler,
}: VentesDirectesTableProps) {
  const router = useRouter()

  if (isLoading) return <TableSkeleton rows={10} cols={8} />

  if (ventes.length === 0) {
    return (
      <CardBody>
        <div className="flex flex-col items-center justify-center py-16 text-steel-400">
          <ShoppingCart className="mb-2 h-8 w-8" />
          <p className="text-sm font-medium">Aucune vente directe trouvée</p>
        </div>
      </CardBody>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {['Numéro', 'Client', 'Localisation', 'Date', 'Total', 'BL', 'Statut', ''].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-border">
            {ventes.map((vente) => (
              <tr
                key={vente.id}
                className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                onClick={() => router.push(`/ventes-directes/${vente.id}`)}
              >
                <td className="px-4 py-3">
                  <span className="ref-code">{vente.numero}</span>
                </td>

                <td className="px-4 py-3 font-medium text-steel-800">{vente.client?.nom ?? '—'}</td>

                <td className="px-4 py-3 text-steel-600">{vente.location?.nom ?? '—'}</td>

                <td className="px-4 py-3 text-steel-600">{formatDate(vente.date)}</td>

                <td className="px-4 py-3">
                  <span className="amount">{formatMGA(vente.total)}</span>
                </td>

                <td className="px-4 py-3">
                  {!vente.livraisons?.length ? (
                    <span className="text-xs text-steel-400">Aucun BL</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {vente.livraisons.slice(0, 2).map((livraison) => (
                        <Button
                          key={livraison.id}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            router.push(`/livraisons/${livraison.id}`)
                          }}
                        >
                          {livraison.numero ?? `BL #${livraison.id}`} : {formatLivraisonStatut(livraison.statut)}
                        </Button>
                      ))}

                      {vente.livraisons.length > 2 && (
                        <Badge variant="muted">+{vente.livraisons.length - 2}</Badge>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3">
                  <Badge variant={getStatutColor(vente.statut)} dot>
                    {formatVenteStatut(vente.statut)}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {permissions.canEditDocument('vente_directe', vente.statut).allowed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(vente)
                        }}
                      >
                        {permissions.canEditDocument('vente_directe', vente.statut).label}
                      </Button>
                    )}

                    {canDeliver(vente) && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Truck className="h-3.5 w-3.5" />}
                        onClick={(event) => {
                          event.stopPropagation()
                          onDeliver(vente)
                        }}
                      >
                        Livrer
                      </Button>
                    )}

                    {vente.statut === 'validee' && !vente.livraisons?.length && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                        loading={cancelling}
                        onClick={(event) => {
                          event.stopPropagation()
                          onAnnuler(vente)
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from ?? 0}
          to={pagination.to ?? 0}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
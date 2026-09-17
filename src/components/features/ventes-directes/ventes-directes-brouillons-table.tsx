'use client'

import { CheckCircle2, Eye, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardBody } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatMGA } from '@/lib/utils'
import type { BrouillonDocument } from '@/lib/brouillons.types'
import type { VenteDirectePayload } from '@/lib/ventes-directes.types'
import type { LocalPagination } from '@/lib/ventes-directes.types'

interface ClientRef {
  id: number
  nom: string
}

interface LocationRef {
  id: number
  nom: string
}

interface VentesDirectesBrouillonsTableProps {
  brouillons: BrouillonDocument<VenteDirectePayload>[]
  pagination: LocalPagination
  isLoading: boolean
  clients: ClientRef[]
  locations: LocationRef[]
  page: number
  onPageChange: (page: number) => void
  onEdit: (brouillon: BrouillonDocument<VenteDirectePayload>) => void
  onFinaliser: (brouillon: BrouillonDocument<VenteDirectePayload>) => void
  onSupprimer: (brouillon: BrouillonDocument<VenteDirectePayload>) => void
}

export function VentesDirectesBrouillonsTable({
  brouillons,
  pagination,
  isLoading,
  clients,
  locations,
  onPageChange,
  onEdit,
  onFinaliser,
  onSupprimer,
}: VentesDirectesBrouillonsTableProps) {
  if (isLoading) return <TableSkeleton rows={10} cols={7} />

  if (brouillons.length === 0) {
    return (
      <CardBody>
        <div className="flex flex-col items-center justify-center py-16 text-steel-400">
          <ShoppingCart className="mb-2 h-8 w-8" />
          <p className="text-sm font-medium">Aucun brouillon de vente directe</p>
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
              {['Brouillon', 'Client', 'Localisation', 'Date', 'Total estimé', 'Modifié par', ''].map((header) => (
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
            {brouillons.map((brouillon) => {
              const payload = brouillon.payload

              const total = payload.lignes.reduce(
                (sum, ligne) => sum + Number(ligne.quantite || 0) * Number(ligne.prix_unitaire || 0),
                0,
              )

              const client = clients.find((item) => item.id === Number(payload.client_id))
              const location = locations.find((item) => item.id === Number(payload.location_id))

              return (
                <tr key={brouillon.uuid} className="transition-colors hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <Badge variant="warning" dot>
                      Brouillon
                    </Badge>
                  </td>

                  <td className="px-4 py-3 font-medium text-steel-800">{client?.nom ?? '—'}</td>

                  <td className="px-4 py-3 text-steel-600">{location?.nom ?? '—'}</td>

                  <td className="px-4 py-3 text-steel-600">{formatDate(payload.date)}</td>

                  <td className="px-4 py-3">
                    <span className="amount">{formatMGA(total)}</span>
                  </td>

                  <td className="px-4 py-3 text-steel-600">
                    {brouillon.modificateur?.nom ?? brouillon.createur?.nom ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => onEdit(brouillon)}
                      >
                        Modifier
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        onClick={() => onFinaliser(brouillon)}
                      >
                        Créer et valider
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-3.5 w-3.5 text-red-600" />}
                        onClick={() => onSupprimer(brouillon)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        from={pagination.from}
        to={pagination.to}
        onPageChange={onPageChange}
      />
    </>
  )
}
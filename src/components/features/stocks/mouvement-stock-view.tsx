'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { Eye, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMouvements } from '@/lib/hooks/use-stocks'
import { formatDateTime, formatQty } from '@/lib/utils'
import type { MouvementStock } from '@/lib/types'

type Props = {
  search: string
  locationId: string
  onLocationIdChange: (value: string) => void
  page: number
  onPageChange: (page: number) => void
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const root = value as { data?: unknown }
    if (Array.isArray(root.data)) return root.data as T[]

    if (root.data && typeof root.data === 'object') {
      const nested = root.data as { data?: unknown }
      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }
  return []
}

function getMovementTypeValue(type: MouvementStock['type'] | string | undefined): string {
  if (!type) return ''
  if (typeof type === 'string') return type
  return type.valeur
}

function getMovementTypeLabel(type: MouvementStock['type'] | string | undefined): string {
  if (!type) return '—'
  if (typeof type === 'string') return type
  return type.libelle
}

function movementVariant(type: string) {
  if (type === 'sortie') return 'danger'
  if (type === 'entree' || type === 'retour') return 'success'
  if (type === 'inventaire') return 'warning'
  return 'info'
}

export function MouvementStockView({
  search,
  locationId,
  onLocationIdChange,
  page,
  onPageChange,
}: Props) {
  const { data: locationsData } = useLocations()
  const locations = useMemo(() => normalizeArray<{ id: number; nom: string }>(locationsData), [locationsData])

  const filters = useMemo(
    () => ({
      location_id: locationId ? Number(locationId) : undefined,
      search: search || undefined,
      page,
      per_page: 10,
    }),
    [locationId, search, page],
  )

  const { data, isLoading } = useMouvements(filters)
  const pagination = data?.data
  const mouvements = Array.isArray(pagination?.data) ? pagination.data : []

  useEffect(() => {
    onPageChange(1)
  }, [search, locationId, onPageChange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Select
          label="Location"
          placeholder="Toutes"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          value={locationId}
          onChange={(e) => {
            onLocationIdChange(e.target.value)
            onPageChange(1)
          }}
        />
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={11} />
        ) : mouvements.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <RotateCcw className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun mouvement trouve</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Date', 'Localisation', 'Type', 'Article', 'Classement', 'Quantite', 'Impact', 'Source', 'Motif', 'Utilisateur', 'Action'].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {mouvements.map((m: MouvementStock) => {
                  const typeValue = getMovementTypeValue(m.type)
                  const typeLabel = getMovementTypeLabel(m.type)

                  return (
                    <tr key={m.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-3 text-steel-600">{formatDateTime(m.date_mouvement)}</td>
                      <td className="px-4 py-3 text-steel-600">{m.location?.nom ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={movementVariant(typeValue)} dot>
                          {typeLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-steel-900">
                          {m.entite?.designation ?? m.entite?.nom ?? m.entite?.nomencla ?? '—'}
                        </div>
                        <div className="text-xs text-steel-500">
                          {m.entite?.nomencla ?? m.entite?.reference ?? `#${m.entite_id}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {m.classement?.libelle ?? m.classement?.designation ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(m.quantite)}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {typeValue === 'inventaire'
                          ? formatQty(m.ecart ?? m.impact_stock)
                          : formatQty(m.impact_stock)}
                      </td>
                      <td className="px-4 py-3 text-xs text-steel-500">
                        {m.reference_type} #{m.reference_id}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{m.motif ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">{m.utilisateur?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/stocks/mouvements/${m.id}`}>
                          <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />}>
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && (
        <div className="pt-2">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from ?? 0}
            to={pagination.to ?? 0}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
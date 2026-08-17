'use client'

import { useEffect, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select } from '@/components/ui/select'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMouvements } from '@/lib/hooks/use-stocks'
import { formatDateTime, formatQty } from '@/lib/utils'
import type { MouvementStock } from '@/lib/types'
import { useRouter } from 'next/navigation'

type Props = {
  search: string
  locationId: string
  onLocationIdChange: (value: string) => void
  entiteType: string
  onEntiteTypeChange: (value: string) => void
  entiteId: number | null
  onEntiteIdChange: (value: number | null) => void
  articleOptions: Array<{
    value: string | number
    label: string
    description?: string
  }>
  type: string
  onTypeChange: (value: string) => void
  referenceType: string
  onReferenceTypeChange: (value: string) => void
  motif: string
  onMotifChange: (value: string) => void
  dateDebut: string
  onDateDebutChange: (value: string) => void
  dateFin: string
  onDateFinChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  sortDir: SortDirection
  onSortDirChange: (value: SortDirection) => void
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
  return 'info'
}

const ENTITY_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'produit', label: 'Produit' },
  { value: 'matiere', label: 'Matière' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'entree', label: 'Entrée' },
  { value: 'sortie', label: 'Sortie' },
  { value: 'retour', label: 'Retour' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Toutes' },
  { value: 'livraison', label: 'Livraison' },
  { value: 'vente_directe', label: 'Vente directe' },
  { value: 'bon_sortie', label: 'Bon de sortie' },
  { value: 'journal_achat', label: 'Achat / BR' },
  { value: 'bp_session', label: 'Production' },
  { value: 'bt_session', label: 'Recyclage' },
  { value: 'ajustement_inventaire', label: 'Inventaire' },
]

export function MouvementStockView({
  search,
  locationId,
  onLocationIdChange,
  entiteType,
  onEntiteTypeChange,
  entiteId,
  onEntiteIdChange,
  articleOptions,
  type,
  onTypeChange,
  referenceType,
  onReferenceTypeChange,
  motif,
  onMotifChange,
  dateDebut,
  onDateDebutChange,
  dateFin,
  onDateFinChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
  page,
  onPageChange,
}: Props) {
  const { data: locationsData } = useLocations()
  const locations = useMemo(() => normalizeArray<{ id: number; nom: string }>(locationsData), [locationsData])
  const router = useRouter()

  const filters = useMemo(
    () => ({
      location_id: locationId ? Number(locationId) : undefined,
      entite_type: entiteType || undefined,
      entite_id: entiteId ?? undefined,
      type: type || undefined,
      reference_type: referenceType || undefined,
      motif: motif.trim() || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      search: search || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      per_page: 10,
    }),
    [
      locationId,
      entiteType,
      entiteId,
      type,
      referenceType,
      motif,
      dateDebut,
      dateFin,
      search,
      sortBy,
      sortDir,
      page,
    ],
  )

  const { data, isLoading } = useMouvements(filters)
  const pagination = data?.data
  const mouvements = Array.isArray(pagination?.data) ? pagination.data : []

  useEffect(() => {
    onPageChange(1)
  }, [
    search,
    locationId,
    entiteType,
    entiteId,
    type,
    referenceType,
    motif,
    dateDebut,
    dateFin,
    sortBy,
    sortDir,
    onPageChange,
  ])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        <Select
          label="Localisation"
          placeholder="Toutes"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          value={locationId}
          onChange={(e) => onLocationIdChange(e.target.value)}
        />

        <Select
          label="Article"
          placeholder="Tous"
          options={ENTITY_OPTIONS}
          value={entiteType}
          onChange={(e) => {
            onEntiteTypeChange(e.target.value)
            onEntiteIdChange(null)
          }}
        />

        <SearchableSelect
          label="Produit / matière"
          value={entiteId}
          options={articleOptions}
          placeholder={!entiteType ? 'Choisir un type d’abord' : 'Tous les articles'}
          searchPlaceholder="Rechercher..."
          noOptionsMessage="Aucun article trouvé."
          disabled={!entiteType}
          onValueChange={(value) => onEntiteIdChange(value ? Number(value) : null)}
        />

        <Select
          label="Type mouvement"
          placeholder="Tous"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        <Select
          label="Source métier"
          placeholder="Toutes"
          options={SOURCE_OPTIONS}
          value={referenceType}
          onChange={(e) => onReferenceTypeChange(e.target.value)}
        />

        <Input
          label="Motif"
          placeholder="vente directe, achat, inventaire..."
          value={motif}
          onChange={(e) => onMotifChange(e.target.value)}
        />

        <DateRangeFilter
          dateDebut={dateDebut}
          dateFin={dateFin}
          onDateDebutChange={onDateDebutChange}
          onDateFinChange={onDateFinChange}
        />
        <SortControl
          sortBy={sortBy}
          sortDir={sortDir}
          options={[
            { value: 'date', label: 'Date mouvement' },
            { value: 'quantite', label: 'Quantité' },
            { value: 'type', label: 'Type mouvement' },
            { value: 'motif', label: 'Motif' },
          ]}
          onSortByChange={onSortByChange}
          onSortDirChange={onSortDirChange}
        />
      </div>

      

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={10} />
        ) : mouvements.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <RotateCcw className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun mouvement trouvé</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {[
                    'Date',
                    'Localisation',
                    'Type',
                    'Article',
                    'Classement',
                    'Stock départ',
                    'Quantité',
                    'Impact',
                    'Stock à jour',
                    'Source',
                    'Motif',
                    'Utilisateur',
                  ].map((label) => (
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
                    <tr
                      key={m.id}
                      className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                      onClick={() => router.push(`/stocks/mouvements/${m.id}`)}
                    >
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
                      <td className="px-4 py-3 text-steel-600">
                        {m.stock_depart !== null && m.stock_depart !== undefined ? formatQty(m.stock_depart) : '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(m.quantite)}</td>
                      <td className={typeValue === 'sortie' ? 'px-4 py-3 text-red-600' : 'px-4 py-3 text-emerald-600'}>
                        {formatQty(m.impact_stock)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-steel-900">
                        {m.stock_a_jour !== null && m.stock_a_jour !== undefined ? formatQty(m.stock_a_jour) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-steel-500">
                        <div className="font-medium text-steel-800">
                          {m.source_reference ?? `${m.reference_type} #${m.reference_id}`}
                        </div>
                        <div className="text-[11px] text-steel-400">
                          {m.source_label ?? m.reference_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel-600">{m.motif ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">{m.utilisateur?.nom ?? '—'}</td>
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
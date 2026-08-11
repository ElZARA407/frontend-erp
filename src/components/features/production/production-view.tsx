'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calculator, CheckCircle, Factory, Plus, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAnnulerBP, useBonsProduction, useClotureBP, useMachines } from '@/lib/hooks/use-production'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { BpForm } from './bp-form'
import { formatDate, formatMGA, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import type { BonProduction, Location, Machine } from '@/lib/types'
import type { CatalogueProduct } from '@/lib/catalogue.types'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'

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

export function ProductionView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()
  const permissions = usePermissions()
  const [search, setSearch] = useState('')
  const [produitId, setProduitId] = useState('')
  const [machineId, setMachineId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [confirmAction, setConfirmAction] = useState<null | {
  type: 'annuler' | 'cloturer'
  id: number
}>(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const { data: productsPage } = useProducts({ actif: true, per_page: 300 })
  const { data: machinesData } = useMachines({ actif: true })
  const { data: locationsData } = useLocations()

  const produits = normalizeArray<CatalogueProduct>(productsPage)
  const machines = normalizeArray<Machine>(machinesData)
  const locations = normalizeArray<Location>(locationsData)

  const { data, isLoading } = useBonsProduction({
    search: search.trim() || undefined,
    statut: statut || undefined,
    produit_id: produitId ? Number(produitId) : undefined,
    machine_id: machineId ? Number(machineId) : undefined,
    location_id: locationId ? Number(locationId) : undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 10,
    sort_by: sortBy,
    sort_dir: sortDir,
  })
  const { mutate: clotureBP, isPending: closing } = useClotureBP()
  const { mutate: annulerBP, isPending: cancelling } = useAnnulerBP()

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
        title="Ordre de fabrication"
        subtitle={`${pagination?.total ?? 0} ordre${(pagination?.total ?? 0) > 1 ? 's' : ''} de fabrication`}
        actions={
          permissions.can('validate') && (
          <div className="flex flex-wrap gap-2">
            
            <Link
              href="/production/cout-moyen-produit"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <Calculator className="h-4 w-4" />
              Coût produit
            </Link>

            <Link
              href="/production/cout-moyen-bp"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <Calculator className="h-4 w-4" />
              Coût BP
            </Link>

            <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
              Nouveau BP
            </Button>
            
          </div>
          )
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="w-full md:w-72"
            label="Recherche"
            placeholder="Numéro OF, produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-64"
            label="Produit"
            placeholder="Tous"
            options={produits.map((produit) => ({
              value: produit.id,
              label: produit.designation,
            }))}
            value={produitId}
            onChange={(e) => {
              setProduitId(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-56"
            label="Machine"
            placeholder="Toutes"
            options={machines.map((machine) => ({
              value: machine.id,
              label: machine.nom,
            }))}
            value={machineId}
            onChange={(e) => {
              setMachineId(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-56"
            label="Location"
            placeholder="Toutes"
            options={locations.map((location) => ({
              value: location.id,
              label: location.nom,
            }))}
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value)
              setPage(1)
            }}
          />

          <DateRangeFilter
            className="w-full md:w-[28rem]"
            dateDebut={dateDebut}
            dateFin={dateFin}
            onDateDebutChange={(value) => {
              setDateDebut(value)
              setPage(1)
            }}
            onDateFinChange={(value) => {
              setDateFin(value)
              setPage(1)
            }}
          />
          <SortControl
            sortBy={sortBy}
            sortDir={sortDir}
            options={[
              { value: 'date', label: 'Date OF' },
              { value: 'nom', label: 'Référence OF' },
            ]}
            onSortByChange={(value) => {
              setSortBy(value)
              setPage(1)
            }}
            onSortDirChange={(value) => {
              setSortDir(value)
              setPage(1)
            }}
          />
        </div>

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
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={11} />
        ) : bps.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Factory className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun ordre de fabrication</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Produit', 'Site', 'Machine', 'Date', 'Cible', 'Produite', 'Taux', 'Coût', 'Statut', ''].map((h) => (
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
                  <tr key={bp.id} className="transition-colors hover:bg-surface-muted/60 cursor-pointer"
                    onClick={() => router.push(`/production/${bp.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{bp.numero}</span>
                    </td>
                    <td
                      className="max-w-[180px] truncate px-4 py-3 font-medium text-steel-800"
                      title={bp.produit?.designation}
                    >
                      {bp.produit?.designation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{bp.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-600">{bp.machine?.nom ?? '—'}</td>
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
                        {bp.statut.valeur === 'ouvert' && (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={cancelling}
                            icon={<XCircle className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmAction({ type: 'annuler', id: bp.id })
                            }}
                          >
                            Annuler
                          </Button>
                        )}
                        {bp.statut.valeur === 'en_cours' && bp.taux_realisation >= 100 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={closing}
                            icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmAction({ type: 'cloturer', id: bp.id })
                            }}
                          >
                            Clôturer
                          </Button>         
                        )}
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
        size="wide"
      >
        <BpForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
      <ConfirmationDialog
  open={confirmAction !== null}
  title={confirmAction?.type === 'annuler' ? 'Annulation' : 'Clôture'}
  description={
    confirmAction?.type === 'annuler'
      ? 'Voulez vous vraiment annuler cet ordre de fabrication ?'
      : 'Voulez vous vraiment clôturer cet ordre de fabrication ?'
  }
  confirmLabel="Oui"
  cancelLabel="Non"
  variant={confirmAction?.type === 'annuler' ? 'danger' : 'primary'}
  loading={cancelling || closing}
  onClose={() => setConfirmAction(null)}
  onConfirm={() => {
    if (!confirmAction) return

    if (confirmAction.type === 'annuler') {
      annulerBP(confirmAction.id, {
        onSuccess: () => setConfirmAction(null),
      })
      return
    }

    clotureBP(confirmAction.id, {
      onSuccess: () => setConfirmAction(null),
    })
  }}
/>
    </div>
  )
}
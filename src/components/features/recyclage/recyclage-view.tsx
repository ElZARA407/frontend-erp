'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Factory, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useBonTransformations, useClotureBonTransformation } from '@/lib/hooks/use-recyclage'
import type { BonTransformation, RecyclageLocationRef } from '@/lib/recyclage.types'
import { BtForm } from './bt-form'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

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

export function RecyclageView() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState<string>('')
  const [locationId, setLocationId] = useState('')
  const [matiereBruteId, setMatiereBruteId] = useState('')
  const [machineId, setMachineId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [confirmClotureId, setConfirmClotureId] = useState<number | null>(null)

  const router = useRouter()
  const { data: locationsData } = useLocations()
  const { mutate: clotureBt, isPending: closing } = useClotureBonTransformation()

  const { data, isLoading } = useBonTransformations({
    search: search.trim() || undefined,
    statut: statut || undefined,
    location_id: locationId ? Number(locationId) : undefined,
    matiere_brute_id: matiereBruteId ? Number(matiereBruteId) : undefined,
    machine_id: machineId ? Number(machineId) : undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const locations = normalizeArray<RecyclageLocationRef>(locationsData)
  const pagination = data?.data
  const bts = Array.isArray(pagination?.data) ? pagination.data : []

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
        title="Recyclage / Transformation"
        subtitle={`${pagination?.total ?? 0} bon(s) de transformation`}
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouveau BT
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="w-full md:w-72"
            label="Recherche"
            placeholder="Numéro BT, machine..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-56"
            label="Site"
            placeholder="Tous les sites"
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

          <Input
            className="w-full md:w-56"
            label="Matière brute"
            placeholder="ID matière brute"
            value={matiereBruteId}
            onChange={(e) => {
              setMatiereBruteId(e.target.value)
              setPage(1)
            }}
          />

          <Input
            className="w-full md:w-44"
            label="Machine"
            placeholder="ID machine"
            value={machineId}
            onChange={(e) => {
              setMachineId(e.target.value)
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
        </div>

        <div className="flex w-fit overflow-hidden rounded-md border border-surface-border text-xs">
          {statutOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStatut(option.value)
                setPage(1)
              }}
              className={
                statut === option.value
                  ? 'bg-steel-700 px-3 py-1.5 font-medium text-white'
                  : 'bg-white px-3 py-1.5 text-steel-600 hover:bg-surface-subtle'
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={9} />
        ) : bts.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Factory className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun bon de transformation trouvé</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Date', 'Site', 'Matière brute', 'Machine', 'Prévue', 'Consommée', 'Rendement', 'Statut'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {bts.map((bt: BonTransformation) => (
                  <tr
                    key={bt.id}
                    className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                    onClick={() => router.push(`/recyclage/${bt.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{bt.numero}</span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(bt.date)}</td>
                    <td className="px-4 py-3 text-steel-600">{bt.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {bt.matiere_brute?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{bt.machine?.nom ?? bt.machine_broyage ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-600">{formatQty(bt.quantite_entree)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatQty(bt.quantite_nette_consomme)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatPercent(bt.taux_rendement)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(bt.statut.valeur)} dot>
                        {bt.statut.libelle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {['ouvert', 'en_cours'].includes(bt.statut.valeur) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            loading={closing}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmClotureId(bt.id)
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
            currentPage={pagination.current_page}
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
        title="Nouveau bon de transformation"
        size="lg"
      >
        <BtForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
      <ConfirmationDialog
  open={confirmClotureId !== null}
  title="Clôture"
  description="Voulez vous vraiment clôturer ce bon de transformation ?"
  confirmLabel="Oui"
  cancelLabel="Non"
  loading={closing}
  onClose={() => setConfirmClotureId(null)}
  onConfirm={() => {
    if (!confirmClotureId) return
    clotureBt(confirmClotureId, {
      onSuccess: () => setConfirmClotureId(null),
    })
  }}
/>
    </div>
  )
}
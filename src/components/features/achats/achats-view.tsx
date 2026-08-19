// src/components/features/achats/achats-view.tsx
'use client'

import { useState } from 'react'
import { CheckCircle, FileDown, Package, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAchats, useValiderAchat } from '@/lib/hooks/use-achats'
import { useFournisseurs } from '@/lib/hooks/use-lot3'
import { useLocations } from '@/lib/hooks/use-organisation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { AchatForm } from './achat-form'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import type { JournalAchat, Location } from '@/lib/types'
import type { Fournisseur } from '@/lib/lot3.types'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { TableScroll } from '@/components/ui/table-scroll'

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

export function AchatsView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [fournisseurId, setFournisseurId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const {exportPdf, isExporting} = usePdfExport()
  const router = useRouter()
  const permissions = usePermissions()
const [confirmValidateId, setConfirmValidateId] = useState<number | null>(null)
const [sortBy, setSortBy] = useState('date')
const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const { data: fournisseursPage } = useFournisseurs({ actif: true, per_page: 200 })
  const { data: locationsData } = useLocations()

  const fournisseurs = normalizeArray<Fournisseur>(fournisseursPage)
  const locations = normalizeArray<Location>(locationsData)
  const { data, isLoading } = useAchats({
    search: search.trim() || undefined,
    fournisseur_id: fournisseurId ? Number(fournisseurId) : undefined,
    location_id: locationId ? Number(locationId) : undefined,
    statut: statut || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_dir: sortDir,
  })
  const { mutate: valider, isPending } = useValiderAchat()

  const paginate = data?.data
  const brs = Array.isArray(paginate?.data) ? paginate.data : []

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'valide', label: 'Validés' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de réception"
        subtitle={`${paginate?.total ?? 0} BR achat${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau BR
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="w-full md:w-72"
            label="Recherche"
            placeholder="Numéro BR, véhicule, observation..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-56"
            label="Fournisseur"
            placeholder="Tous"
            options={fournisseurs.map((fournisseur) => ({
              value: fournisseur.id,
              label: fournisseur.nom,
            }))}
            value={fournisseurId}
            onChange={(e) => {
              setFournisseurId(e.target.value)
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
              { value: 'date', label: 'Date' },
              { value: 'nom', label: 'Référence BR' },
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
          <TableSkeleton rows={10} cols={7} />
        ) : brs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <Package className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucun bon de réception</p>
          </div>
        ) : (
          <TableScroll minWidth="920px">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Numéro', 'Fournisseur', 'Site', 'Date', 'Total', 'Statut', ''].map((h) => (
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
              {brs.map((br: JournalAchat) => (
                <tr key={br.id} className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                  onClick={() => router.push(`/achats/${br.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="ref-code">{br.numero}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-steel-800">
                    {br.fournisseur?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {br.location?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {formatDate(br.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="amount">{formatMGA(br.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(br.statut)} dot>
                      {br.statut === 'valide' ? 'Validé' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">

                    <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FileDown className="h-3.5 w-3.5" />}
                      loading={isExporting('br', br.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        exportPdf({ type: 'br', document: br })}}
                    >
                      PDF
                    </Button>
                    {permissions.can('validate') && (
                      br.statut === 'brouillon' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                          loading={isPending}
                          onClick={(event) => {
                            event.stopPropagation()
                            setConfirmValidateId(br.id)
                          }}
                        >
                          Valider
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableScroll>
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

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouveau bon de réception"
        size="xl"
      >
        <AchatForm onSuccess={() => setShowCreate(false)} />
      </Dialog>

      <ConfirmationDialog
        open={confirmValidateId !== null}
        title="Validation"
        description="Voulez vous vraiment valider ce bon de réception ?"
        confirmLabel="Oui"
        cancelLabel="Non"
        loading={isPending}
        onClose={() => setConfirmValidateId(null)}
        onConfirm={() => {
          if (!confirmValidateId) return
          valider(confirmValidateId, {
            onSuccess: () => setConfirmValidateId(null),
          })
        }}
      />
    </div>
  )
}
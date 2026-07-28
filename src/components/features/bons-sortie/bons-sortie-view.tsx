'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, FileDown, Package, Plus, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useLocations } from '@/lib/hooks/use-organisation'
import {
  useBonsSortie,
  useDeleteBonSortie,
  useValiderBonSortie,
} from '@/lib/hooks/use-bons-sortie'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { formatDate, getStatutColor } from '@/lib/utils'
import type { BonSortie } from '@/lib/bons-sortie.types'
import { BonSortieForm } from './bon-sortie-form'

const PAGE_SIZE = 10

const statutOptions = [
  { value: '', label: 'Tous' },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'valide', label: 'Validés' },
]

export function BonsSortieView() {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [locationId, setLocationId] = useState('')
  const [motif, setMotif] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const { data: locationsData } = useLocations()
  const locations = Array.isArray(locationsData) ? locationsData : []

  const filters = useMemo(
    () => ({
      search: search || undefined,
      statut: statut || undefined,
      location_id: locationId ? Number(locationId) : undefined,
      motif: motif || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      page,
      per_page: PAGE_SIZE,
    }),
    [dateDebut, dateFin, locationId, motif, page, search, statut],
  )

  const { data: bonsPage, isLoading } = useBonsSortie(filters)
  const { mutate: validerBonSortie, isPending: validating } = useValiderBonSortie()
  const deleteBonSortie = useDeleteBonSortie()
  const { exportPdf, isExporting } = usePdfExport()

  const bons = Array.isArray(bonsPage?.data?.data) ? bonsPage.data.data : []
  const pagination = bonsPage?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de sortie"
        subtitle="Sorties internes, transferts, échantillons, pertes et destructions"
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouveau bon de sortie
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <Input
          label="Recherche"
          placeholder="Référence, produit, client, motif..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          icon={<Search className="h-3.5 w-3.5" />}
          className="lg:col-span-2"
        />

        <Select
          label="Statut"
          placeholder="Tous"
          options={statutOptions}
          value={statut}
          onChange={(event) => {
            setStatut(event.target.value)
            setPage(1)
          }}
        />

        <Select
          label="Location"
          placeholder="Toutes"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          value={locationId}
          onChange={(event) => {
            setLocationId(event.target.value)
            setPage(1)
          }}
        />

        <Select
          label="Raison"
          placeholder="Toutes"
          options={MOTIFS_SORTIE.map((item) => ({ value: item.value, label: item.label }))}
          value={motif}
          onChange={(event) => {
            setMotif(event.target.value)
            setPage(1)
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Du"
            type="date"
            value={dateDebut}
            onChange={(event) => {
              setDateDebut(event.target.value)
              setPage(1)
            }}
          />
          <Input
            label="Au"
            type="date"
            value={dateFin}
            onChange={(event) => {
              setDateFin(event.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={8} />
        ) : bons.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Package className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun bon de sortie trouvé</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Source', 'Contexte', 'Raison', 'Date', 'Statut', ''].map((label) => (
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
                {bons.map((bon: BonSortie) => (
                  <tr
                    key={bon.id}
                    className="cursor-pointer transition-colors hover:bg-surface-muted/60"
                    onClick={() => router.push(`/bons-sortie/${bon.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{bon.numero}</span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{bon.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-600">
                      {bon.motif === 'transfert'
                        ? bon.destination_location?.nom ?? 'Destination non renseignée'
                        : bon.motif === 'echantillon'
                          ? bon.client?.nom ?? 'Client non renseigné'
                          : bon.motif_detail ?? bon.observations ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {bon.motif_libelle ??
                        MOTIFS_SORTIE.find((item) => item.value === bon.motif)?.label ??
                        bon.motif}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(bon.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(bon.statut)} dot>
                        {bon.statut === 'brouillon' ? 'Brouillon' : 'Validé'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {bon.statut === 'brouillon' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                              loading={validating}
                              onClick={(event) => {
                                event.stopPropagation()
                                validerBonSortie(bon.id)
                              }}
                            >
                              Valider
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-3.5 w-3.5 text-red-600" />}
                              loading={deleteBonSortie.isPending}
                              onClick={(event) => {
                                event.stopPropagation()
                                deleteBonSortie.mutate(bon.id)
                              }}
                            />
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FileDown className="h-3.5 w-3.5" />}
                          loading={isExporting('bon_sortie', bon.id)}
                          onClick={(event) => {
                            event.stopPropagation()
                            exportPdf({ type: 'bon_sortie', document: bon })
                          }}
                        >
                          PDF
                        </Button>
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
        title="Nouveau bon de sortie"
        size="xl"
      >
        <BonSortieForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}
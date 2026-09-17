'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, FileDown, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
} from '@/lib/hooks/use-bons-sortie'
import {
  useBrouillons,
  useDeleteBrouillon,
  useFinaliserBrouillon,
} from '@/lib/hooks/use-brouillons'
import type { BrouillonDocument } from '@/lib/brouillons.types'
import type { BonSortieSchema } from '@/lib/schemas/bons-sortie.schema'
import { createIdempotencyKey } from '@/lib/idempotency'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { formatDate, formatQty, getStatutColor } from '@/lib/utils'
import type { BonSortie } from '@/lib/bons-sortie.types'
import { BonSortieForm } from './bon-sortie-form'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'


const PAGE_SIZE = 10

const statutOptions = [
  { value: 'valides', label: 'BS validés' },
  { value: 'brouillons', label: 'Brouillons' },
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
  const [sortBy, setSortBy] = useState('date')
  const [editingBon, setEditingBon] = useState<BonSortie | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [brouillonSelectionne, setBrouillonSelectionne] = useState<
    BrouillonDocument<BonSortieSchema> | null
  >(null)

  const [confirmBrouillonAction, setConfirmBrouillonAction] = useState<
    | {
        type: 'finaliser' | 'supprimer'
        brouillon: BrouillonDocument<BonSortieSchema>
      }
    | null
  >(null)

  const estModeBrouillons = statut === 'brouillons'

  const { data: locationsData } = useLocations()
  const locations = Array.isArray(locationsData) ? locationsData : []
  const permissions = usePermissions()

  const filters = useMemo(
    () => ({
      search: search || undefined,
      statut: estModeBrouillons ? undefined : 'valide',
      location_id: locationId ? Number(locationId) : undefined,
      motif: motif || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      page,
      per_page: PAGE_SIZE,
      sort_by: sortBy,
      sort_dir: sortDir,
    }),
    [dateDebut, dateFin, locationId, motif, page, search, sortBy, sortDir, estModeBrouillons],
  )

  const { data: bonsPage, isLoading } = useBonsSortie(filters)
  const {
    data: brouillons = [],
    isLoading: isLoadingBrouillons,
  } = useBrouillons<BonSortieSchema>('bon_sortie', estModeBrouillons)

  const deleteBrouillon = useDeleteBrouillon()
  const finaliserBrouillon = useFinaliserBrouillon<BonSortie>()
  const { exportPdf, isExporting } = usePdfExport()

  const bons = Array.isArray(bonsPage?.data?.data) ? bonsPage.data.data : []
  const pagination = bonsPage?.data
  const isLoadingPage = estModeBrouillons
    ? isLoadingBrouillons
    : isLoading

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7 2xl:grid-cols-8">
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
          placeholder=""
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
        <SortControl
          sortBy={sortBy}
          sortDir={sortDir}
          options={[
            { value: 'date', label: 'Date' },
            { value: 'nom', label: 'Référence BS' },
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

      <Card>
        {isLoadingPage ? (
          <TableSkeleton rows={10} cols={8} />
          ) : estModeBrouillons ? (
            brouillons.length === 0 ? (
              <CardBody>
                <div className="flex flex-col items-center justify-center py-16 text-steel-400">
                  <Package className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Aucun brouillon de BS</p>
                </div>
              </CardBody>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Brouillon', 'Source', 'Raison', 'Date', 'Qté', 'Modifié par', ''].map((label) => (
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
                    {brouillons.map((brouillon) => {
                      const payload = brouillon.payload
                      const total = payload.lignes.reduce(
                        (sum, ligne) => sum + Number(ligne.quantite || 0),
                        0,
                      )

                      return (
                        <tr key={brouillon.uuid} className="hover:bg-surface-muted/60">
                          <td className="px-4 py-3">
                            <Badge variant="warning" dot>Brouillon</Badge>
                          </td>

                          <td className="px-4 py-3 text-steel-600">
                            {locations.find(
                              (location) =>
                                location.id === Number(payload.location_id),
                            )?.nom ?? '—'}
                          </td>

                          <td className="px-4 py-3 text-steel-600">
                            {MOTIFS_SORTIE.find(
                              (item) => item.value === payload.motif,
                            )?.label ?? payload.motif}
                          </td>

                          <td className="px-4 py-3 text-steel-600">
                            {formatDate(payload.date)}
                          </td>

                          <td className="px-4 py-3 text-steel-600">
                            {formatQty(total)}
                          </td>

                          <td className="px-4 py-3 text-steel-600">
                            {brouillon.modificateur?.nom ?? '—'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Pencil className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setBrouillonSelectionne(brouillon)
                                  setShowCreate(true)
                                }}
                              >
                                Modifier
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                onClick={() =>
                                  setConfirmBrouillonAction({
                                    type: 'finaliser',
                                    brouillon,
                                  })
                                }
                              >
                                Créer et valider
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5 text-red-600" />}
                                onClick={() =>
                                  setConfirmBrouillonAction({
                                    type: 'supprimer',
                                    brouillon,
                                  })
                                }
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
            )
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

                        {(() => {
                          const editDecision = permissions.canEditDocument('bon_sortie', bon.statut)

                          if (!editDecision.allowed) return null

                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Pencil className="h-3.5 w-3.5" />}
                              onClick={(event) => {
                                event.stopPropagation()
                                setEditingBon(bon)
                              }}
                            >
                              {editDecision.label}
                            </Button>
                          )
                        })()}

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
        <BonSortieForm
          key={brouillonSelectionne?.uuid ?? 'nouveau-bs'}
          brouillonInitial={brouillonSelectionne}
          onSaved={() => {
            setShowCreate(false)
            setBrouillonSelectionne(null)
            setStatut('brouillons')
            setPage(1)
          }}
        />
      </Dialog>
        <Dialog
          open={editingBon !== null}
          onClose={() => setEditingBon(null)}
          title={editingBon ? `Modifier ${editingBon.numero}` : 'Modifier le bon de sortie'}
          size="xl"
        >
          {editingBon && (
            <BonSortieForm
              defaultValues={editingBon}
              correctionAdmin={
                permissions.canEditDocument('bon_sortie', editingBon.statut).mode ===
                'admin_correction'
              }
              onSuccess={() => setEditingBon(null)}
            />
          )}
        </Dialog>

        <ConfirmationDialog
          open={confirmBrouillonAction !== null}
          title={
            confirmBrouillonAction?.type === 'finaliser'
              ? 'Créer et valider le BS'
              : 'Supprimer le brouillon'
          }
          description={
            confirmBrouillonAction?.type === 'finaliser'
              ? 'Le bon de sortie sera créé définitivement, recevra une référence et les mouvements de stock seront enregistrés.'
              : 'Ce brouillon partagé sera supprimé définitivement.'
          }
          confirmLabel={
            confirmBrouillonAction?.type === 'finaliser'
              ? 'Créer et valider'
              : 'Supprimer'
          }
          cancelLabel="Annuler"
          variant={
            confirmBrouillonAction?.type === 'supprimer'
              ? 'danger'
              : 'primary'
          }
          loading={
            finaliserBrouillon.isPending ||
            deleteBrouillon.isPending
          }
          onClose={() => setConfirmBrouillonAction(null)}
          onConfirm={() => {
            if (!confirmBrouillonAction) return

            if (confirmBrouillonAction.type === 'finaliser') {
              finaliserBrouillon.mutate(
                {
                  uuid: confirmBrouillonAction.brouillon.uuid,
                  idempotencyKey: createIdempotencyKey(),
                },
                {
                  onSuccess: () => {
                    setConfirmBrouillonAction(null)
                    setStatut('valides')
                  },
                },
              )
              return
            }

            deleteBrouillon.mutate(
              confirmBrouillonAction.brouillon.uuid,
              {
                onSuccess: () => setConfirmBrouillonAction(null),
              },
            )
          }}
        />
    </div>
  )
}
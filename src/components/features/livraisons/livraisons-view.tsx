'use client'

import { useState } from 'react'
import { CheckCircle, FileDown, FileText, PencilLine, RotateCcw, Trash2, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useAnnulerLivraison,
  useConfirmerLivraison,
  useDeleteLivraisonPreparee,
  useLivraisons,
} from '@/lib/hooks/use-livraisons'
import { useClients } from '@/lib/hooks/use-clients'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { formatDate, getStatutColor } from '@/lib/utils'
import type { Client, Livraison } from '@/lib/types'
import { FactureForm } from '../factures/facture-form'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { LivraisonForm } from './livraison-form'

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

export function LivraisonsView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null)
  const [search, setSearch] = useState('')
  const [clientId, setClientId] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [facturee, setFacturee] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const { exportPdf, isExporting } = usePdfExport()
  const router = useRouter()
  const [editingLivraison, setEditingLivraison] = useState<Livraison | null>(null)
  const permissions = usePermissions()
  const [confirmAction, setConfirmAction] = useState<null | {
  type: 'confirmer' | 'annuler' | 'supprimer'
  id: number
}>(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const { data: clientsPage } = useClients({ actif: true, per_page: 200 })
  const clients = normalizeArray<Client>(clientsPage)

  const { data, isLoading } = useLivraisons({
    search: search.trim() || undefined,
    client_id: clientId ? Number(clientId) : undefined,
    statut: statut || undefined,
    source_type: sourceType || undefined,
    est_facturee: facturee === '' ? undefined : facturee === 'true',
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_dir: sortDir,
  })
  const { mutate: confirmer, isPending: isConfirming } = useConfirmerLivraison()
  const { mutate: annuler, isPending: isAnnuling } = useAnnulerLivraison()
  const deleteLivraison = useDeleteLivraisonPreparee()

  const paginate = data?.data
  const livraisons = Array.isArray(paginate?.data) ? paginate.data : []

  const statutOptions = [
    { value: '', label: 'Toutes' },
    { value: 'prepare', label: 'Préparées' },
    { value: 'livre', label: 'Livrées' },
    { value: 'retourne', label: 'Retournées' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Livraisons"
        subtitle={`${paginate?.total ?? 0} livraison${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="w-full md:w-72"
            label="Recherche"
            placeholder="Numéro BL, chauffeur, véhicule..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-56"
            label="Client"
            placeholder="Tous"
            options={clients.map((client) => ({
              value: client.id,
              label: client.nom,
            }))}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-48"
            label="Source"
            placeholder="Toutes"
            options={[
              { value: 'commande', label: 'Commande' },
              { value: 'vente_directe', label: 'Vente directe' },
            ]}
            value={sourceType}
            onChange={(e) => {
              setSourceType(e.target.value)
              setPage(1)
            }}
          />

          <Select
            className="w-full md:w-44"
            label="Facturation"
            placeholder="Toutes"
            options={[
              { value: 'false', label: 'Non facturées' },
              { value: 'true', label: 'Facturées' },
            ]}
            value={facturee}
            onChange={(e) => {
              setFacturee(e.target.value)
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
              { value: 'date', label: 'Date livraison' },
              { value: 'nom', label: 'Référence BL' },
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
          <TableSkeleton rows={10} cols={8} />
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {livraisons.map((livraison: Livraison) => {
                const canAnnuler =
                  livraison.statut === 'livre' &&
                  livraison.source_type === 'commande' &&
                  !livraison.est_facturee
                const canFacturer = livraison.statut === 'livre' && !livraison.est_facturee
                const canModifier = livraison.statut === 'prepare'
                const canSupprimer = livraison.statut === 'prepare'
                const displayNumero = livraison.numero ?? 'Préparation'

                return (
                  <tr key={livraison.id} className="transition-colors hover:bg-surface-muted/60 cursor-pointer"
                    onClick={() => router.push(`/livraisons/${livraison.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{displayNumero}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {livraison.client?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={livraison.source_type === 'commande' ? 'info' : 'muted'}>
                        {livraison.source_type === 'commande' ? 'Commande' : 'Vente directe'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {formatDate(livraison.date_livraison)}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {livraison.chauffeur ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={livraison.est_facturee ? 'success' : 'muted'} dot>
                        {livraison.est_facturee ? 'Oui' : 'Non'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(livraison.statut)} dot>
                        {livraison.statut === 'prepare'
                          ? 'Préparée'
                          : livraison.statut === 'livre'
                            ? 'Livrée'
                            : 'Retournée'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canModifier && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<PencilLine className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setEditingLivraison(livraison)
                            }}
                          >
                            Modifier
                          </Button>
                        )}

                        {canSupprimer && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            loading={deleteLivraison.isPending}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmAction({ type: 'supprimer', id: livraison.id })
                            }}
                          >
                            Supprimer
                          </Button>
                        )}
                        {permissions.can('approve') && (
                        livraison.statut === 'prepare' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                            loading={isConfirming}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmAction({ type: 'confirmer', id: livraison.id })
                            }}
                          >
                            Confirmer
                            </Button>
                        ))}
                        {permissions.can('pay') && (
                        canFacturer && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<FileText className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedLivraison(livraison)}}
                          >
                            Facturer
                          </Button>
                        ))}
                        {canAnnuler && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<RotateCcw className="h-3.5 w-3.5" />}
                            loading={isAnnuling}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConfirmAction({ type: 'annuler', id: livraison.id })
                            }}
                          >
                            Annuler
                          </Button>
                        )}
                        {livraison.statut === 'livre' && livraison.numero && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FileDown className="h-3.5 w-3.5" />}
                            loading={isExporting('livraison', livraison.id)}
                            onClick={(event) => {
                              event.stopPropagation()

                              const numero = livraison.numero
                              if (!numero) return

                              exportPdf({
                                type: 'livraison',
                                document: {
                                  id: livraison.id,
                                  numero,
                                },
                              })
                            }}
                          >
                            PDF
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
        open={selectedLivraison !== null}
        onClose={() => setSelectedLivraison(null)}
        title={selectedLivraison ? `Créer une facture depuis ${selectedLivraison.numero}` : 'Nouvelle facture'}
        size="lg"
      >
        {selectedLivraison && (
          <FactureForm
            defaultLivraisonId={selectedLivraison.id}
            onSuccess={() => setSelectedLivraison(null)}
          />
        )}
      </Dialog>
      <Dialog
        open={editingLivraison !== null}
        onClose={() => setEditingLivraison(null)}
        title={editingLivraison ? `Modifier ${editingLivraison.numero ?? 'la livraison préparée'}` : 'Modifier livraison'}
        size="xl"
      >
        {editingLivraison && (
          <LivraisonForm
            defaultValues={editingLivraison}
            onSuccess={() => setEditingLivraison(null)}
          />
        )}
      </Dialog>
      <ConfirmationDialog
        open={confirmAction !== null}
        title={
          confirmAction?.type === 'confirmer'
            ? 'Confirmation'
            : confirmAction?.type === 'supprimer'
              ? 'Suppression'
              : 'Annulation'
        }
        description={
          confirmAction?.type === 'confirmer'
            ? 'Voulez vous vraiment confirmer cette livraison ?'
            : confirmAction?.type === 'supprimer'
              ? 'Voulez vous vraiment supprimer cette livraison préparée ?'
              : 'Voulez vous vraiment annuler cette livraison confirmée ?'
        }
        confirmLabel="Oui"
        cancelLabel="Non"
        variant={confirmAction?.type === 'confirmer' ? 'primary' : 'danger'}
        loading={isConfirming || isAnnuling || deleteLivraison.isPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return

          if (confirmAction.type === 'confirmer') {
            confirmer(confirmAction.id, {
              onSuccess: () => setConfirmAction(null),
            })
            return
          }

          if (confirmAction.type === 'supprimer') {
            deleteLivraison.mutate(confirmAction.id, {
              onSuccess: () => setConfirmAction(null),
            })
            return
          }

          annuler(confirmAction.id, {
            onSuccess: () => setConfirmAction(null),
          })
        }}
      />
    </div>
  )
}
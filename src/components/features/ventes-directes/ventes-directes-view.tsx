'use client'

import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { createIdempotencyKey } from '@/lib/idempotency'
import { useClients } from '@/lib/hooks/use-clients'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useAnnulerVenteDirecte, useVentesDirectes } from '@/lib/hooks/use-ventes-directes'
import {
  useBrouillons,
  useCreateBrouillon,
  useDeleteBrouillon,
  useFinaliserBrouillon,
  useUpdateBrouillon,
} from '@/lib/hooks/use-brouillons'
import { usePermissions } from '@/lib/hooks/use-permissions'
import type { BrouillonDocument } from '@/lib/brouillons.types'
import type { VenteDirecte, VenteDirectePayload } from '@/lib/ventes-directes.types'
import { VenteDirecteForm } from './vente-directe-form'
import { LivraisonForm } from '../livraisons/livraison-form'
import { VentesDirectesTable } from './ventes-directes-table'
import { VentesDirectesBrouillonsTable } from './ventes-directes-brouillons-table'
import { paginateLocally, type ConfirmAction, type ViewStatus } from '@/lib/ventes-directes.types'

const DRAFT_FORM_ID = 'vente-directe-brouillon-form'
const DRAFT_PAGE_SIZE = 10

const AFFICHAGE_OPTIONS: Array<{ value: ViewStatus; label: string }> = [
  { value: 'validees', label: 'Validées' },
  { value: 'livrees', label: 'Livrées' },
  { value: 'annulees', label: 'Annulées' },
  { value: 'brouillons', label: 'Brouillons' },
]

export function VentesDirectesView() {
  const permissions = usePermissions()

  const [page, setPage] = useState(1)
  const [draftPage, setDraftPage] = useState(1)
  const [statut, setStatut] = useState<ViewStatus>('validees')

  const [clientId, setClientId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const [showDraftEditor, setShowDraftEditor] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<BrouillonDocument<VenteDirectePayload> | null>(null)
  const [editingVente, setEditingVente] = useState<VenteDirecte | null>(null)
  const [showLivraison, setShowLivraison] = useState(false)
  const [selectedVente, setSelectedVente] = useState<VenteDirecte | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const cancellationKeyRef = useRef<string | null>(null)

  const estModeBrouillons = statut === 'brouillons'

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()

  const clients = Array.isArray(clientsPage?.data?.data) ? clientsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []

  const { data: ventesData, isLoading: isLoadingVentes } = useVentesDirectes({
    statut: estModeBrouillons
      ? undefined
      : statut === 'validees'
        ? 'validee'
        : statut === 'livrees'
          ? 'livree'
          : 'annulee',
    client_id: estModeBrouillons ? undefined : clientId ? Number(clientId) : undefined,
    date_debut: estModeBrouillons ? undefined : dateDebut || undefined,
    date_fin: estModeBrouillons ? undefined : dateFin || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_dir: sortDir,
  })

  const { data: allBrouillons = [], isLoading: isLoadingBrouillons } = useBrouillons<VenteDirectePayload>(
    'vente_directe',
    estModeBrouillons,
  )

  const brouillonsPagination = useMemo(
    () => paginateLocally(allBrouillons, draftPage, DRAFT_PAGE_SIZE),
    [allBrouillons, draftPage],
  )

  const brouillons = brouillonsPagination.data

  const createBrouillon = useCreateBrouillon<VenteDirectePayload>()
  const updateBrouillon = useUpdateBrouillon<VenteDirectePayload>()
  const deleteBrouillon = useDeleteBrouillon()
  const finaliserBrouillon = useFinaliserBrouillon<VenteDirecte>()
  const { mutate: annulerVente, isPending: cancelling } = useAnnulerVenteDirecte()

  const pagination = ventesData?.data
  const ventes = Array.isArray(pagination?.data) ? pagination.data : []

  const enregistrerBrouillon = async (payload: VenteDirectePayload): Promise<void> => {
    if (selectedDraft) {
      await updateBrouillon.mutateAsync({
        uuid: selectedDraft.uuid,
        payload,
        version: selectedDraft.version,
        idempotencyKey: createIdempotencyKey(),
      })
    } else {
      await createBrouillon.mutateAsync({
        module: 'vente_directe',
        payload,
        idempotencyKey: createIdempotencyKey(),
      })
    }

    setShowDraftEditor(false)
    setSelectedDraft(null)
    setStatut('brouillons')
    setDraftPage(1)
  }

  const handleConfirm = () => {
    if (!confirmAction) return

    if (confirmAction.type === 'finaliser') {
      finaliserBrouillon.mutate(
        { uuid: confirmAction.brouillon.uuid, idempotencyKey: createIdempotencyKey() },
        {
          onSuccess: () => {
            setConfirmAction(null)
            setStatut('validees')
            setPage(1)
          },
        },
      )
      return
    }

    if (confirmAction.type === 'supprimer') {
      deleteBrouillon.mutate(confirmAction.brouillon.uuid, {
        onSuccess: () => setConfirmAction(null),
      })
      return
    }

    const idempotencyKey = cancellationKeyRef.current ?? (cancellationKeyRef.current = createIdempotencyKey())

    annulerVente(
      { id: confirmAction.vente.id, idempotencyKey },
      {
        onSuccess: () => {
          cancellationKeyRef.current = null
          setConfirmAction(null)
        },
      },
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ventes directes"
        subtitle={
          estModeBrouillons
            ? `${brouillonsPagination.total} brouillon(s) partagé(s)`
            : `${pagination?.total ?? 0} vente(s) directe(s)`
        }
        actions={
          <Button
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => {
              setSelectedDraft(null)
              setShowDraftEditor(true)
            }}
          >
            Nouveau brouillon
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-surface-border bg-white p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-400">
            Affichage
          </div>

          <div className="flex flex-wrap gap-1.5">
            {AFFICHAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatut(option.value)
                  setPage(1)
                  setDraftPage(1)
                }}
                className={
                  statut === option.value
                    ? 'rounded-md bg-steel-700 px-3 py-1.5 text-xs font-medium text-white'
                    : 'rounded-md border border-surface-border bg-white px-3 py-1.5 text-xs text-steel-600 hover:bg-surface-subtle'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Client"
          placeholder="Tous les clients"
          disabled={estModeBrouillons}
          className="bg-white"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          value={clientId}
          onChange={(event) => {
            setClientId(event.target.value)
            setPage(1)
          }}
        />

        <Input
          label="Du"
          type="date"
          disabled={estModeBrouillons}
          value={dateDebut}
          onChange={(event) => {
            setDateDebut(event.target.value)
            setPage(1)
          }}
        />

        <Input
          label="Au"
          type="date"
          disabled={estModeBrouillons}
          value={dateFin}
          onChange={(event) => {
            setDateFin(event.target.value)
            setPage(1)
          }}
        />

        {!estModeBrouillons && (
          <SortControl
            sortBy={sortBy}
            sortDir={sortDir}
            options={[
              { value: 'date', label: 'Date vente' },
              { value: 'nom', label: 'Référence VD' },
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
        )}
      </div>

      <Card>
        {estModeBrouillons ? (
          <VentesDirectesBrouillonsTable
            brouillons={brouillons}
            pagination={brouillonsPagination}
            isLoading={isLoadingBrouillons}
            clients={clients}
            locations={locations}
            page={draftPage}
            onPageChange={setDraftPage}
            onEdit={(brouillon) => {
              setSelectedDraft(brouillon)
              setShowDraftEditor(true)
            }}
            onFinaliser={(brouillon) => setConfirmAction({ type: 'finaliser', brouillon })}
            onSupprimer={(brouillon) => setConfirmAction({ type: 'supprimer', brouillon })}
          />
        ) : (
          <VentesDirectesTable
            ventes={ventes}
            isLoading={isLoadingVentes}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            permissions={permissions}
            cancelling={cancelling}
            onEdit={setEditingVente}
            onDeliver={(vente) => {
              setSelectedVente(vente)
              setShowLivraison(true)
            }}
            onAnnuler={(vente) => setConfirmAction({ type: 'annuler', vente })}
          />
        )}
      </Card>

      <Dialog
        open={showDraftEditor}
        onClose={() => {
          setShowDraftEditor(false)
          setSelectedDraft(null)
        }}
        title={selectedDraft ? 'Modifier le brouillon de vente' : 'Nouveau brouillon de vente'}
        size="wide"
      >
        <VenteDirecteForm
          key={selectedDraft?.uuid ?? 'nouvelle-vente-directe'}
          formId={DRAFT_FORM_ID}
          draftValues={selectedDraft?.payload ?? null}
          hideActions
          onSaveDraft={enregistrerBrouillon}
        />

        <div className="mt-5 flex justify-end border-t border-surface-border pt-4">
          <Button
            type="submit"
            form={DRAFT_FORM_ID}
            loading={createBrouillon.isPending || updateBrouillon.isPending}
          >
            Enregistrer le brouillon
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showLivraison}
        onClose={() => {
          setShowLivraison(false)
          setSelectedVente(null)
        }}
        title={selectedVente ? `Créer un BL depuis ${selectedVente.numero}` : 'Créer un BL'}
        size="wide"
      >
        {selectedVente && (
          <LivraisonForm
            sourceType="vente_directe"
            source={selectedVente}
            onSuccess={() => {
              setShowLivraison(false)
              setSelectedVente(null)
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={editingVente !== null}
        onClose={() => setEditingVente(null)}
        title={editingVente ? `Modifier ${editingVente.numero}` : 'Modifier la vente directe'}
        size="wide"
      >
        {editingVente && (
          <VenteDirecteForm
            defaultValues={editingVente}
            correctionAdmin={
              permissions.canEditDocument('vente_directe', editingVente.statut).mode === 'admin_correction'
            }
            onSuccess={() => setEditingVente(null)}
          />
        )}
      </Dialog>

      <ConfirmationDialog
        open={confirmAction !== null}
        title={
          confirmAction?.type === 'finaliser'
            ? 'Créer et valider la vente'
            : confirmAction?.type === 'supprimer'
              ? 'Supprimer le brouillon'
              : 'Annuler la vente directe'
        }
        description={
          confirmAction?.type === 'finaliser'
            ? 'La vente sera créée définitivement, recevra une référence et sera immédiatement validée.'
            : confirmAction?.type === 'supprimer'
              ? 'Ce brouillon partagé sera supprimé définitivement.'
              : 'Cette vente directe validée sera annulée.'
        }
        confirmLabel={
          confirmAction?.type === 'finaliser'
            ? 'Créer et valider'
            : confirmAction?.type === 'supprimer'
              ? 'Supprimer'
              : 'Annuler la vente'
        }
        cancelLabel="Retour"
        variant={confirmAction?.type === 'finaliser' ? 'primary' : 'danger'}
        loading={finaliserBrouillon.isPending || deleteBrouillon.isPending || cancelling}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
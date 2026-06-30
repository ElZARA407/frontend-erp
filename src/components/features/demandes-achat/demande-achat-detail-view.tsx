// src/components/features/demandes-achat/demande-achat-detail-view.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ListChecks,
  Package,
  Send,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useMatieres, useProducts } from '@/lib/hooks/use-catalogue'
import {
  useApproveDemandeAchat,
  useDeleteDemandeAchat,
  useDemandeAchat,
  useRejectDemandeAchat,
  useSubmitDemandeAchat,
} from '@/lib/hooks/use-lot3'
import type { CatalogueMatiere, CatalogueProduct } from '@/lib/catalogue.types'
import type { DemandeAchat } from '@/lib/lot3.types'
import {
  formatDate,
  formatDateTime,
  formatQty,
  getStatutColor,
} from '@/lib/utils'
import { DemandeAchatEditForm } from './demande-achat-edit-form'

interface DemandeAchatDetailViewProps {
  demandeId: number
}

type DemandeAchatLine = NonNullable<DemandeAchat['lignes']>[number]

const STATUT_LABELS: Record<DemandeAchat['statut'], string> = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
}

export function DemandeAchatDetailView({ demandeId }: DemandeAchatDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const { data: demande, isLoading } = useDemandeAchat(demandeId)
  const { data: matieresPage } = useMatieres({ per_page: 500 })
  const { data: produitsPage } = useProducts({ per_page: 500 })

  const submitDemande = useSubmitDemandeAchat()
  const approveDemande = useApproveDemandeAchat()
  const rejectDemande = useRejectDemandeAchat()
  const deleteDemande = useDeleteDemandeAchat()

  const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []
  const produits = Array.isArray(produitsPage?.data?.data) ? produitsPage.data.data : []
  const lignes = Array.isArray(demande?.lignes) ? demande.lignes : []

  const totalQuantite = useMemo(
    () => lignes.reduce((sum, ligne) => sum + (Number(ligne.quantite) || 0), 0),
    [lignes]
  )

  const resolveArticle = (ligne: DemandeAchatLine) => {
    if (ligne.entite_type === 'matiere') {
      const matiere = matieres.find((item: CatalogueMatiere) => item.id === ligne.entite_id)
      return {
        label: matiere ? `${matiere.reference} - ${matiere.nom}` : `Matiere #${ligne.entite_id}`,
        unite: matiere?.unite ?? '',
      }
    }

    const produit = produits.find((item: CatalogueProduct) => item.id === ligne.entite_id)
    return {
      label: produit ? `${produit.nomencla} - ${produit.designation}` : `Produit #${ligne.entite_id}`,
      unite: produit?.unite ?? '',
    }
  }

  if (!isLoading && !demande) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Demande #${demandeId}`}
          subtitle="Fiche non trouvee"
          actions={
            <Link
              href="/demandes-achat"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Demande d achat introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={demande?.numero ?? `Demande #${demandeId}`}
        subtitle={demande ? `Demandeur ${demande.demandeur?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/demandes-achat"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>

            {demande?.statut === 'brouillon' && (
              <>
                <Button
                  variant="outline"
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  onClick={() => setEditOpen(true)}
                >
                  Modifier
                </Button>
                <Button
                  icon={<Send className="h-3.5 w-3.5" />}
                  loading={submitDemande.isPending}
                  onClick={() => submitDemande.mutate(demande.id)}
                >
                  Soumettre
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  loading={deleteDemande.isPending}
                  onClick={() =>
                    deleteDemande.mutate(demande.id, {
                      onSuccess: () => router.push('/demandes-achat'),
                    })
                  }
                >
                  Supprimer
                </Button>
              </>
            )}

            {demande?.statut === 'soumise' && (
              <>
                <Button
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  loading={approveDemande.isPending}
                  onClick={() => approveDemande.mutate(demande.id)}
                >
                  Approuver
                </Button>
                <Button
                  variant="danger"
                  icon={<XCircle className="h-3.5 w-3.5" />}
                  loading={rejectDemande.isPending}
                  onClick={() => rejectDemande.mutate(demande.id)}
                >
                  Rejeter
                </Button>
              </>
            )}

            {demande?.statut === 'rejetee' && (
              <Button
                variant="danger"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                loading={deleteDemande.isPending}
                onClick={() =>
                  deleteDemande.mutate(demande.id, {
                    onSuccess: () => router.push('/demandes-achat'),
                  })
                }
              >
                Supprimer
              </Button>
            )}
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<ListChecks className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantite totale"
              value={formatQty(totalQuantite)}
              icon={<Package className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Date demande"
              value={demande?.date_demande ? formatDate(demande.date_demande) : '—'}
              icon={<CalendarDays className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Demandeur"
              value={demande?.demandeur?.nom ?? '—'}
              icon={<UserRound className="h-5 w-5" />}
              accent="primary"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations demande</h2>
            <p className="text-xs text-steel-500">
              Vue detaillee de la demande d’achat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {demande && (
              <Badge variant={getStatutColor(demande.statut)} dot>
                {STATUT_LABELS[demande.statut]}
              </Badge>
            )}
            {demande?.created_at && (
              <Badge variant="info" dot>
                Cree le {formatDateTime(demande.created_at)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : demande ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Demandeur
                </p>
                <p className="mt-1 font-semibold text-steel-900">
                  {demande.demandeur?.nom ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Date de demande
                </p>
                <p className="mt-1 font-semibold text-steel-900">
                  {formatDate(demande.date_demande)}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Statut
                </p>
                <p className="mt-1 font-semibold text-steel-900">
                  {STATUT_LABELS[demande.statut]}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Observations
                </p>
                <p className="mt-1 font-semibold text-steel-900">
                  {demande.observations ?? '—'}
                </p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes de demande</h2>
            <p className="text-xs text-steel-500">
              Matiere ou produit, quantite et remarque ligne par ligne.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">
              Aucune ligne enregistree.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Type', 'Article', 'Quantite', 'Observation'].map((h) => (
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
                  {lignes.map((ligne) => {
                    const article = resolveArticle(ligne)

                    return (
                      <tr key={ligne.id} className="transition-colors hover:bg-surface-muted/60">
                        <td className="px-4 py-3">
                          <Badge variant={ligne.entite_type === 'matiere' ? 'success' : 'info'} dot>
                            {ligne.entite_type === 'matiere' ? 'Matiere' : 'Produit'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-steel-800">{article.label}</td>
                        <td className="px-4 py-3 text-steel-600">
                          {formatQty(ligne.quantite, article.unite || undefined)}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {ligne.observation_ligne ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Modifier ${demande?.numero ?? 'la demande'}`}
        size="lg"
      >
        {demande && (
          <DemandeAchatEditForm
            demande={demande}
            onSuccess={() => setEditOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}
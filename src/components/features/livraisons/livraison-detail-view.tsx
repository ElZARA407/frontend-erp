'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, FileText, Package, RotateCcw, Truck, UserRound } from 'lucide-react'
import { useLivraisonDetail } from '@/lib/hooks/use-commercial-details'
import { useAnnulerLivraison, useConfirmerLivraison } from '@/lib/hooks/use-livraisons'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatDateTime, formatQty, getStatutColor } from '@/lib/utils'
import { FactureForm } from '../factures/facture-form'
import { FileDown } from 'lucide-react'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { useRouter } from 'next/navigation'

type LivraisonDetail = {
  id: number
  numero: string
  source_type: 'commande' | 'vente_directe'
  source_id: number
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
  chauffeur: string | null
  vehicule: string | null
  observations?: string | null
  est_facturee: boolean
  created_at: string
  client?: { id: number; nom: string } | null
  lignes?: Array<{
    id: number
    quantite_livree: number
    classement?: {
      id: number
      designation: string
    } | null
  }>
  facture?: {
    id: number
    numero: string
    statut: string
  } | null
}

interface LivraisonDetailViewProps {
  livraisonId: number
}

export function LivraisonDetailView({ livraisonId }: LivraisonDetailViewProps) {
  const { data, isLoading } = useLivraisonDetail(livraisonId)
  const confirmerLivraison = useConfirmerLivraison()
  const annulerLivraison = useAnnulerLivraison()
  const { exportPdf, isExporting } = usePdfExport()
  const [showFacture, setShowFacture] = useState(false)
  const router = useRouter()

  const livraison = data as LivraisonDetail | undefined
  const lignes = Array.isArray(livraison?.lignes) ? livraison.lignes : []

  const canConfirmer = livraison?.statut === 'prepare'
  const canAnnuler =
    livraison?.statut === 'livre' &&
    livraison.source_type === 'commande' &&
    !livraison.est_facturee
  const canFacturer = livraison?.statut === 'livre' && !livraison.est_facturee

  if (!isLoading && !livraison) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Livraison #${livraisonId}`}
          subtitle="Fiche non trouvée"
          actions={
              <Link
                href="/livraisons"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Livraison introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={livraison?.numero ?? `Livraison #${livraisonId}`}
        subtitle={livraison ? `Client ${livraison.client?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {canFacturer && (
              <Button
                variant="outline"
                icon={<FileText className="h-3.5 w-3.5" />}
                onClick={() => setShowFacture(true)}
              >
                Facturer
              </Button>
            )}
            {livraison && (
                <Button
                  variant="outline"
                  icon={<FileDown className="h-3.5 w-3.5" />}
                  loading={isExporting('livraison', livraisonId)}
                  onClick={() => exportPdf({ type: 'livraison', document: livraison })}
                >
                  Telecharger BL
                </Button>
              )}
            <Button
              onClick={() => router.back()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Button>
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
              label="Type source"
              value={livraison?.source_type ?? '—'}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<Truck className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Statut"
              value={livraison?.statut ?? '—'}
              icon={<FileText className="h-5 w-5" />}
              accent={livraison?.statut === 'livre' ? 'success' : livraison?.statut === 'prepare' ? 'warning' : 'danger'}
            />
            <StatCard
              label="Facturée"
              value={livraison?.est_facturee ? 'Oui' : 'Non'}
              icon={<UserRound className="h-5 w-5" />}
              accent={livraison?.est_facturee ? 'success' : 'danger'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations livraison</h2>
            <p className="text-xs text-steel-500">
              Vue détail du BL avec confirmation de sortie stock.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {livraison?.source_type && (
              <Badge variant={livraison.source_type === 'commande' ? 'info' : 'muted'} dot>
                {livraison.source_type === 'commande' ? 'Commande' : 'Vente directe'}
              </Badge>
            )}
            {livraison && (
              <Badge variant={getStatutColor(livraison.statut)} dot>
                {livraison.statut}
              </Badge>
            )}
            {canConfirmer && (
              <Button
                loading={confirmerLivraison.isPending}
                onClick={() => confirmerLivraison.mutate(livraison.id)}
              >
                Confirmer
              </Button>
            )}
            {canAnnuler && (
              <Button
                variant="danger"
                loading={annulerLivraison.isPending}
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={() => annulerLivraison.mutate(livraison.id)}
              >
                Annuler
              </Button>
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
          ) : livraison ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {livraison.client ? (
                    <Link className="hover:underline" href={`/clients/${livraison.client.id}`}>
                      {livraison.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date livraison</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(livraison.date_livraison)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Chauffeur</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.chauffeur ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Véhicule</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.vehicule ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence BC</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.reference_bc ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créée le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(livraison.created_at)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Observations</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.observations ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes livrées</h2>
            <p className="text-xs text-steel-500">
              Détail des quantités sorties du stock.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={3} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">
              Aucune ligne de livraison.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Classement', 'Quantité livrée', 'Ligne'].map((h) => (
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
                {lignes.map((ligne) => (
                  <tr key={ligne.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-medium text-steel-900">
                      {ligne.classement?.designation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatQty(ligne.quantite_livree)}</td>
                    <td className="px-4 py-3 text-xs text-steel-500">#{ligne.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {livraison?.facture && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-sm font-semibold text-steel-900">Facture associée</h2>
              <p className="text-xs text-steel-500">
                La facture est rattachée à ce BL.
              </p>
            </div>
            <Badge variant="warning" dot>
              {livraison.facture.statut}
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Numéro</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.facture.numero}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Statut</p>
                <p className="mt-1 font-semibold text-steel-900">{livraison.facture.statut}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">ID facture</p>
                <p className="mt-1 font-semibold text-steel-900">#{livraison.facture.id}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Dialog
        open={showFacture}
        onClose={() => setShowFacture(false)}
        title={`Créer une facture depuis ${livraison?.numero ?? 'le BL'}`}
        size="lg"
      >
        {livraison && (
          <FactureForm
            defaultLivraisonId={livraison.id}
            onSuccess={() => setShowFacture(false)}
          />
        )}
      </Dialog>
    </div>
  )
}
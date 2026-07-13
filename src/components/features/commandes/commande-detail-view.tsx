// src/components/features/commandes/commande-detail-view.tsx
'use client'

import Link from 'next/link'
import { useCommande, useDuplicateCommande } from '@/lib/hooks/use-commandes'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { ArrowLeft, Copy, MapPin, ShoppingCart, Truck, UserRound } from 'lucide-react'

interface CommandeDetailViewProps {
  commandeId: number
}

export function CommandeDetailView({ commandeId }: CommandeDetailViewProps) {
  const { data: commande, isLoading } = useCommande(commandeId)
  const duplicateCommande = useDuplicateCommande()

  const lignes = Array.isArray(commande?.lignes) ? commande.lignes : []

  if (!isLoading && !commande) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Commande #${commandeId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/commandes"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Commande introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={commande?.numero ?? `Commande #${commandeId}`}
        subtitle={commande ? `Client ${commande.client?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <>
            <Link
              href="/commandes"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            {commande && (
              <Button
                variant="outline"
                icon={<Copy className="h-3.5 w-3.5" />}
                loading={duplicateCommande.isPending}
                onClick={() => duplicateCommande.mutate(commande.id)}
              >
                Dupliquer
              </Button>
            )}
          </>
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
              label="Montant total"
              value={commande?.total ?? 0}
              isMoney
              icon={<ShoppingCart className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Échéance"
              value={commande?.echeance ?? 0}
              icon={<Truck className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<MapPin className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Retard"
              value={commande?.en_retard ? 1 : 0}
              icon={<UserRound className="h-5 w-5" />}
              accent={commande?.en_retard ? 'danger' : 'success'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations commande</h2>
            <p className="text-xs text-steel-500">
              Synthèse métier renvoyée par l’API backend.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {commande?.en_retard && (
              <Badge variant="danger" dot>
                En retard
              </Badge>
            )}
            {commande && (
              <Badge variant={getStatutColor(commande.statut.valeur)} dot>
                {commande.statut.libelle}
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
          ) : commande ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {commande.client ? (
                    <Link className="hover:underline" href={`/clients/${commande.client.id}`}>
                      {commande.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Location</p>
                <p className="mt-1 font-semibold text-steel-900">{commande.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date commande</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(commande.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Livraison prévue</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(commande.date_livraison_prevue)}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes de commande</h2>
            <p className="text-xs text-steel-500">
              Produits, quantités et suivi de reliquat.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">
              Aucune ligne disponible.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Classement', 'Produit', 'Qté', 'Restant', 'PU', 'Total', 'État'].map((h) => (
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
                {lignes.map((ligne, index) => (
                  <tr key={ligne.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-steel-900">
                      {ligne.classement?.qualite_libelle ?? `Ligne ${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {ligne.produit?.designation ?? ligne.produit?.nomencla ?? ligne.classement?.produit?.designation ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{ligne.quantite}</td>
                    <td className="px-4 py-3 text-steel-600">{ligne.quantite_restante}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(ligne.prix_unitaire)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(ligne.total_ligne)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ligne.est_soldee ? 'success' : 'warning'} dot>
                        {ligne.est_soldee ? 'Soldée' : ligne.etat}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
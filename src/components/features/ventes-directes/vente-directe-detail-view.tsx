'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatDateTime, formatMGA, formatQty, getStatutColor } from '@/lib/utils'
import { useValiderVenteDirecte, useVenteDirecte } from '@/lib/hooks/use-ventes-directes'
import type { VenteDirecte } from '@/lib/ventes-directes.types'

interface VenteDirecteDetailViewProps {
  venteId: number
}

export function VenteDirecteDetailView({ venteId }: VenteDirecteDetailViewProps) {
  const { data: vente, isLoading } = useVenteDirecte(venteId)
  const validerVente = useValiderVenteDirecte()

  const lignes = Array.isArray(vente?.lignes) ? vente.lignes : []

  if (!isLoading && !vente) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Vente directe #${venteId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/ventes-directes"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Vente directe introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={vente?.numero ?? `Vente directe #${venteId}`}
        subtitle={vente ? `Client ${vente.client?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {vente?.statut === 'brouillon' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={validerVente.isPending}
                onClick={() => validerVente.mutate(vente.id)}
              >
                Valider
              </Button>
            )}
            <Link
              href="/ventes-directes"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
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
              label="Total"
              value={vente?.total ?? 0}
              isMoney
              icon={<ShoppingCart className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<ShoppingCart className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Date"
              value={vente ? formatDate(vente.date) : '—'}
              icon={<ShoppingCart className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Statut"
              value={vente?.statut === 'brouillon' ? 'Brouillon' : 'Validée'}
              icon={<ShoppingCart className="h-5 w-5" />}
              accent={vente?.statut === 'validee' ? 'success' : 'primary'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations vente directe</h2>
            <p className="text-xs text-steel-500">
              Le backend expose la vente directe, ses lignes et son statut.
            </p>
          </div>
          <Badge variant={vente ? getStatutColor(vente.statut) : 'default'} dot>
            {vente?.statut === 'brouillon' ? 'Brouillon' : 'Validée'}
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : vente ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {vente.client ? (
                    <Link className="hover:underline" href={`/clients/${vente.client.id}`}>
                      {vente.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Location</p>
                <p className="mt-1 font-semibold text-steel-900">{vente.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(vente.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créée le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(vente.created_at)}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes de vente</h2>
            <p className="text-xs text-steel-500">
              Classement, quantité et prix unitaire.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">
              Aucune ligne de vente.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Classement', 'Quantité', 'PU', 'Total', 'Ligne'].map((h) => (
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
                      {ligne.classement?.designation ?? `Ligne ${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatQty(ligne.quantite)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(ligne.prix_unitaire)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(ligne.total_ligne)}</td>
                    <td className="px-4 py-3 text-xs text-steel-500">#{ligne.id}</td>
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
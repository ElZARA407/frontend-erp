// src/components/features/achats/achat-detail-view.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useAchat, useValiderAchat } from '@/lib/hooks/use-achats'
import { formatDate, formatDateTime, formatMGA, formatQty, getStatutColor } from '@/lib/utils'

interface AchatDetailViewProps {
  achatId: number
}

export function AchatDetailView({ achatId }: AchatDetailViewProps) {
  const { data: achat, isLoading } = useAchat(achatId)
  const validerAchat = useValiderAchat()

  const lignes = Array.isArray(achat?.lignes) ? achat.lignes : []

  if (!isLoading && !achat) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`BR #${achatId}`}
          subtitle="Bon de réception introuvable"
          actions={
            <Link
              href="/achats"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Bon de réception introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={achat?.numero ?? `BR #${achatId}`}
        subtitle={achat ? `Fournisseur ${achat.fournisseur?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {achat?.statut === 'brouillon' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={validerAchat.isPending}
                onClick={() => validerAchat.mutate(achat.id)}
              >
                Valider le BR
              </Button>
            )}
            <Link
              href="/achats"
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
              value={achat?.total ?? 0}
              isMoney
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<Package className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Date"
              value={achat?.date ? formatDate(achat.date) : '—'}
              icon={<Package className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Statut"
              value={achat?.statut === 'valide' ? 'Validé' : 'Brouillon'}
              icon={<Package className="h-5 w-5" />}
              accent={achat?.statut === 'valide' ? 'success' : 'warning'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations BR</h2>
            <p className="text-xs text-steel-500">
              Détail du bon de réception achat.
            </p>
          </div>
          {achat && (
            <Badge variant={getStatutColor(achat.statut)} dot>
              {achat.statut === 'valide' ? 'Validé' : 'Brouillon'}
            </Badge>
          )}
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : achat ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Fournisseur</p>
                <p className="mt-1 font-semibold text-steel-900">{achat.fournisseur?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Site</p>
                <p className="mt-1 font-semibold text-steel-900">{achat.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(achat.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Véhicule</p>
                <p className="mt-1 font-semibold text-steel-900">{achat.vehicule ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(achat.date ?? '')}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Observations</p>
                <p className="mt-1 font-semibold text-steel-900">{achat.observations ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes réceptionnées</h2>
            <p className="text-xs text-steel-500">
              Matières premières, quantités et montants.
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
            <div className="py-10 text-center text-steel-500">Aucune ligne enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Référence', 'Matière', 'Quantité', 'Prix unitaire', 'Total'].map((h) => (
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
                      <td className="px-4 py-3">
                        <span className="ref-code">{ligne.matiere.reference}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-steel-800">
                        {ligne.matiere.nom}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatQty(ligne.quantite)} {ligne.matiere.unite}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatMGA(ligne.prix_unitaire)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-steel-900">
                        {formatMGA(ligne.total_ligne)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
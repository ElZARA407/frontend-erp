// src/components/features/contrats/contrat-detail-view.tsx
'use client'

import Link from 'next/link'
import { useContratDetail } from '@/lib/hooks/use-commercial-details'
import { useToggleContratActif } from '@/lib/hooks/use-lot3'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDateTime, formatMGA } from '@/lib/utils'
import { ArrowLeft, Repeat, ShieldCheck, ShieldOff } from 'lucide-react'

interface ContratDetailViewProps {
  contratId: number
}

export function ContratDetailView({ contratId }: ContratDetailViewProps) {
  const { data: contrat, isLoading } = useContratDetail(contratId)
  const toggleContratActif = useToggleContratActif()

  const lignes = Array.isArray(contrat?.lignes) ? contrat.lignes : []

  if (!isLoading && !contrat) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Contrat #${contratId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/contrats"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Contrat introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={contrat?.numero ?? `Contrat #${contratId}`}
        subtitle={contrat ? `Client ${contrat.client?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <Link
            href="/contrats"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
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
              label="Total contractuel"
              value={contrat?.total_contractuel ?? 0}
              isMoney
              icon={<Repeat className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Taux d’exécution"
              value={`${(contrat?.taux_execution ?? 0).toFixed(1)}%`}
              icon={<Repeat className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<Repeat className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Statut"
              value={contrat?.actif ? 'Actif' : 'Inactif'}
              icon={<Repeat className="h-5 w-5" />}
              accent={contrat?.actif ? 'success' : 'danger'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations contrat</h2>
            <p className="text-xs text-steel-500">
              Contrat client et fréquences périodiques.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contrat && (
              <Badge variant={contrat.actif ? 'success' : 'muted'} dot>
                {contrat.actif ? 'Actif' : 'Inactif'}
              </Badge>
            )}
            {contrat && (
              <Button
                variant={contrat.actif ? 'outline' : 'primary'}
                icon={contrat.actif ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                loading={toggleContratActif.isPending}
                onClick={() =>
                  toggleContratActif.mutate({
                    id: contrat.id,
                    actif: !contrat.actif,
                  })
                }
              >
                {contrat.actif ? 'Désactiver' : 'Réactiver'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : contrat ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {contrat.client ? (
                    <Link className="hover:underline" href={`/clients/${contrat.client.id}`}>
                      {contrat.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Mois</p>
                <p className="mt-1 font-semibold text-steel-900">{contrat.mois}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(contrat.created_at)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence</p>
                <p className="mt-1 font-semibold text-steel-900">{contrat.numero}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes du contrat</h2>
            <p className="text-xs text-steel-500">
              Quantités contractuelles, livrées et restantes.
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
                  {['Classement', 'Qté contractuelle', 'Livrée YTD', 'Restante', 'Fréquence', 'Prix unitaire', 'Statut'].map((h) => (
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
                    <td className="px-4 py-3 text-steel-600">{ligne.quantite_contractuelle}</td>
                    <td className="px-4 py-3 text-steel-600">{ligne.quantite_livree_ytd}</td>
                    <td className="px-4 py-3 text-steel-600">{ligne.quantite_restante}</td>
                    <td className="px-4 py-3 text-steel-600">{ligne.frequence}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(ligne.prix_unitaire)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ligne.est_solde ? 'success' : 'warning'} dot>
                        {ligne.est_solde ? 'Soldée' : ligne.statut}
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
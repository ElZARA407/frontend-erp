'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatDateTime, formatQty, getStatutColor } from '@/lib/utils'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { useBonSortie, useValiderBonSortie } from '@/lib/hooks/use-bons-sortie'
import { FileDown } from 'lucide-react'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'

interface BonSortieDetailViewProps {
  bonId: number
}

export function BonSortieDetailView({ bonId }: BonSortieDetailViewProps) {
  const { data: bon, isLoading } = useBonSortie(bonId)
  const validerBonSortie = useValiderBonSortie()
  const { exportPdf, isExporting } = usePdfExport()

  const lignes = Array.isArray(bon?.lignes) ? bon.lignes : []

  if (!isLoading && !bon) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Bon de sortie #${bonId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/bons-sortie"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Bon de sortie introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={bon?.numero ?? `Bon de sortie #${bonId}`}
        subtitle={bon ? `Localisation : ${bon.location?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {bon?.statut === 'brouillon' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={validerBonSortie.isPending}
                onClick={() => validerBonSortie.mutate(bon.id)}
              >
                Valider
              </Button>
            )}
            {bon && (
              <Button
                variant="outline"
                icon={<FileDown className="h-3.5 w-3.5" />}
                loading={isExporting('bon_sortie', bon.id)}
                onClick={() => exportPdf({ type: 'bon_sortie', document: bon })}
              >
                PDF
              </Button>
            )}
            <Link
              href="/bons-sortie"
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
              label="Lignes"
              value={lignes.length}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Date"
              value={bon ? formatDate(bon.date) : '—'}
              icon={<Package className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Statut"
              value={bon?.statut === 'brouillon' ? 'Brouillon' : 'Validé'}
              icon={<Package className="h-5 w-5" />}
              accent={bon?.statut === 'valide' ? 'success' : 'primary'}
            />
            <StatCard
              label="Observation"
              value={bon?.observations ? 'Oui' : 'Non'}
              icon={<Package className="h-5 w-5" />}
              accent={bon?.observations ? 'success' : 'danger'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations bon de sortie</h2>
            <p className="text-xs text-steel-500">
              Le backend expose le bon de sortie et ses lignes.
            </p>
          </div>
          <Badge variant={bon ? getStatutColor(bon.statut) : 'default'} dot>
            {bon?.statut === 'brouillon' ? 'Brouillon' : 'Validé'}
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
          ) : bon ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Location</p>
                <p className="mt-1 font-semibold text-steel-900">{bon.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">{bon.client?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(bon.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Motif</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {MOTIFS_SORTIE.find((item) => item.value === bon.motif)?.label ?? bon.motif}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Observations</p>
                <p className="mt-1 font-semibold text-steel-900">{bon.observations ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(bon.created_at)}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes du bon de sortie</h2>
            <p className="text-xs text-steel-500">
              Quantités sorties du stock.
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
              Aucune ligne de sortie.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Classement', 'Quantité', 'Ligne'].map((h) => (
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
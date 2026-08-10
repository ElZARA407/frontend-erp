'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileDown, MapPin, Package, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { useBonSortie, useValiderBonSortie } from '@/lib/hooks/use-bons-sortie'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { formatDate, formatDateTime, formatQty, getStatutColor } from '@/lib/utils'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface BonSortieDetailViewProps {
  bonId: number
}

function motifLabel(motif?: string | null, fallback?: string | null) {
  if (fallback) return fallback
  return MOTIFS_SORTIE.find((item) => item.value === motif)?.label ?? motif ?? '—'
}

export function BonSortieDetailView({ bonId }: BonSortieDetailViewProps) {
  const router = useRouter()
  const { data: bon, isLoading } = useBonSortie(bonId)
  const validerBonSortie = useValiderBonSortie()
  const { exportPdf, isExporting } = usePdfExport()
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false)

  const lignes = Array.isArray(bon?.lignes) ? bon.lignes : []
  const totalQuantite = lignes.reduce((sum, ligne) => sum + (Number(ligne.quantite) || 0), 0)

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
        subtitle={bon ? `${motifLabel(bon.motif, bon.motif_libelle)} • ${bon.location?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {bon?.statut === 'brouillon' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={validerBonSortie.isPending}
                onClick={() => setConfirmValidateOpen(true)}
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

            <Button
              variant="outline"
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
              onClick={() => router.back()}
            >
              Retour
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
              label="Statut"
              value={bon?.statut === 'brouillon' ? 'Brouillon' : 'Validé'}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent={bon?.statut === 'valide' ? 'success' : 'primary'}
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantité totale"
              value={formatQty(totalQuantite)}
              icon={<Package className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Date"
              value={bon ? formatDate(bon.date) : '—'}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations</h2>
            <p className="text-xs text-steel-500">
              Contexte de sortie et traçabilité du document.
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
              <InfoCard
                label="Location source"
                value={bon.location?.nom ?? '—'}
                icon={<MapPin className="h-4 w-4" />}
              />
              <InfoCard
                label="Raison"
                value={motifLabel(bon.motif, bon.motif_libelle)}
                icon={<Package className="h-4 w-4" />}
              />

              {bon.motif === 'transfert' && (
                <InfoCard
                  label="Destination"
                  value={bon.destination_location?.nom ?? '—'}
                  icon={<MapPin className="h-4 w-4" />}
                />
              )}

              {bon.motif === 'echantillon' && (
                <InfoCard
                  label="Client"
                  value={bon.client?.nom ?? '—'}
                  icon={<UserRound className="h-4 w-4" />}
                />
              )}

              <InfoCard
                label="Créé par"
                value={bon.createur?.nom ?? '—'}
                icon={<UserRound className="h-4 w-4" />}
              />
              <InfoCard
                label="Validé par"
                value={bon.valideur?.nom ?? '—'}
                icon={<UserRound className="h-4 w-4" />}
              />

              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Détail / commentaire
                </p>
                <p className="mt-1 whitespace-pre-wrap font-medium text-steel-900">
                  {bon.motif_detail || bon.observations || '—'}
                </p>
              </div>

              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Créé le
                </p>
                <p className="mt-1 font-medium text-steel-900">
                  {bon.created_at ? formatDateTime(bon.created_at) : '—'}
                </p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes de sortie</h2>
            <p className="text-xs text-steel-500">
              Produits finis sortis du stock à la validation.
            </p>
          </div>
          <Badge variant="info">{lignes.length} ligne(s)</Badge>
        </CardHeader>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : lignes.length === 0 ? (
          <CardBody className="py-12 text-center text-sm text-steel-500">
            Aucune ligne de sortie.
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Classement</th>
                  <th className="px-4 py-3">Quantité</th>
                  <th className="px-4 py-3">Ligne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {lignes.map((ligne, index) => (
                  <tr key={ligne.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-medium text-steel-900">
                      {ligne.produit?.designation ?? `Ligne ${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {ligne.produit?.nomencla ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {ligne.classement?.designation ??
                        ligne.classement?.libelle ??
                        ligne.classement?.qualite ??
                        '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-steel-900">
                      {formatQty(ligne.quantite)}
                    </td>
                    <td className="px-4 py-3 text-xs text-steel-500">#{ligne.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <ConfirmationDialog
  open={confirmValidateOpen}
  title="Validation"
  description="Voulez vous vraiment valider ce bon de sortie ?"
  confirmLabel="Oui"
  cancelLabel="Non"
  loading={validerBonSortie.isPending}
  onClose={() => setConfirmValidateOpen(false)}
  onConfirm={() => {
    if (!bon) return
    validerBonSortie.mutate(bon.id, {
      onSuccess: () => setConfirmValidateOpen(false),
    })
  }}
/>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-surface-border p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-steel-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-semibold text-steel-900">{value}</p>
    </div>
  )
}
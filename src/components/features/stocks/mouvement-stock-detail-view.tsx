'use client'

import Link from 'next/link'
import { ArrowLeft, Hash, ArrowDownUp, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useMouvementStock } from '@/lib/hooks/use-stocks'
import { formatDateTime, formatQty } from '@/lib/utils'
import type { MouvementStock } from '@/lib/types'

interface MouvementStockDetailViewProps {
  mouvementId: number
}

function movementVariant(type: string) {
  if (type === 'sortie') return 'danger'
  if (type === 'entree' || type === 'retour') return 'success'
  if (type === 'inventaire') return 'warning'
  return 'warning'
}

function getMovementTypeValue(type: MouvementStock['type'] | string | undefined): string {
  if (!type) return ''
  if (typeof type === 'string') return type
  return type.valeur
}

function getMovementTypeLabel(type: MouvementStock['type'] | string | undefined): string {
  if (!type) return '—'
  if (typeof type === 'string') return type
  return type.libelle
}

export function MouvementStockDetailView({ mouvementId }: MouvementStockDetailViewProps) {
  const { data, isLoading } = useMouvementStock(mouvementId)
  const mouvement = data as MouvementStock | undefined

  const typeValue = getMovementTypeValue(mouvement?.type)
  const typeLabel = getMovementTypeLabel(mouvement?.type)

  if (!isLoading && !mouvement) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Mouvement #${mouvementId}`}
          subtitle="Fiche non trouvee"
          actions={
            <Link
              href="/stocks"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Mouvement introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Mouvement #${mouvementId}`}
        subtitle="Journal de tracabilite immuable"
        actions={
          <Link
            href="/stocks"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour journal
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
              label="Type"
              value={typeLabel}
              icon={<ArrowDownUp className="h-5 w-5" />}
              accent={movementVariant(typeValue)}
            />
            <StatCard
              label="Quantite"
              value={mouvement?.quantite ?? 0}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Impact stock"
              value={mouvement?.impact_stock ?? 0}
              icon={<ArrowDownUp className="h-5 w-5" />}
              accent={typeValue === 'sortie' ? 'danger' : 'success'}
            />
            <StatCard
              label="Reference"
              value={
                mouvement
                  ? `${mouvement.reference_type} #${mouvement.reference_id}`
                  : '—'
              }
              icon={<Hash className="h-5 w-5" />}
              accent="primary"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations mouvement</h2>
            <p className="text-xs text-steel-500">
              Lecture complete du journal central de stock.
            </p>
          </div>
          {mouvement && (
            <Badge variant={movementVariant(typeValue)} dot>
              {typeLabel}
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
          ) : mouvement ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date mouvement</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(mouvement.date_mouvement)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Location</p>
                <p className="mt-1 font-semibold text-steel-900">{mouvement.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Utilisateur</p>
                <p className="mt-1 font-semibold text-steel-900">{mouvement.utilisateur?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Article</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {mouvement.entite?.designation ?? mouvement.entite?.nom ?? mouvement.entite?.nomencla ?? `#${mouvement.entite_id}`}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Classement</p>
                <p className="mt-1 font-semibold text-steel-900">{mouvement.classement?.libelle ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {mouvement.reference_type} #{mouvement.reference_id}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Quantité</p>
                <p className="mt-1 font-semibold text-steel-900">{formatQty(mouvement.quantite)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Impact stock</p>
                <p className="mt-1 font-semibold text-steel-900">{formatQty(mouvement.impact_stock)}</p>
              </div>

              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Motif</p>
                <p className="mt-1 font-semibold text-steel-900">{mouvement.motif ?? '—'}</p>
              </div>

              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Stock théorique</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {mouvement.stock_theorique !== null && mouvement.stock_theorique !== undefined
                    ? formatQty(mouvement.stock_theorique)
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Stock physique</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {mouvement.stock_physique !== null && mouvement.stock_physique !== undefined
                    ? formatQty(mouvement.stock_physique)
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Écart</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {mouvement.ecart !== null && mouvement.ecart !== undefined ? formatQty(mouvement.ecart) : '—'}
                </p>
              </div>

              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Horodatage système</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(mouvement.date_mouvement)}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}
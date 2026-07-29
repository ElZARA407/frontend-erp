// src/components/features/dashboard/dashboard-view.tsx
'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Boxes,
  Factory,
  FileWarning,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import type { DashboardAlerte, DashboardPoint, DashboardTopItem } from '@/lib/types'
import { cn, formatMGA, formatQty } from '@/lib/utils'

type AlertBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'

export function DashboardView() {
  const { data: dashboard, isLoading } = useDashboard()

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      </div>
    )
  }

  const kpi = dashboard?.kpi
  const charts = dashboard?.charts
  const alertes = Array.isArray(dashboard?.alertes) ? dashboard.alertes : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Pilotage opérationnel - ${new Date().toLocaleDateString('fr-MG', { dateStyle: 'long' })}`}
      />

      <section>
        <p className="section-title mb-3">Indicateurs prioritaires</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Commandes en attente"
            value={kpi?.commandes_en_attente ?? 0}
            icon={<ShoppingCart className="h-5 w-5" />}
            accent={(kpi?.commandes_en_attente ?? 0) > 0 ? 'warning' : 'success'}
          />
          <StatCard
            label="BP en cours"
            value={kpi?.bons_production_en_cours ?? 0}
            icon={<Factory className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="BT en cours"
            value={kpi?.bons_transformation_en_cours ?? 0}
            icon={<Boxes className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="Livraisons du jour"
            value={kpi?.livraisons_du_jour ?? 0}
            icon={<Truck className="h-5 w-5" />}
            accent="success"
          />
          <StatCard
            label="Factures en attente"
            value={kpi?.factures_en_attente ?? 0}
            icon={<Receipt className="h-5 w-5" />}
            accent={(kpi?.factures_en_attente ?? 0) > 0 ? 'warning' : 'success'}
          />
          <StatCard
            label="Valeur totale stock"
            value={kpi?.valeur_totale_stock ?? 0}
            isMoney
            icon={<Package className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="Produits sous minimum"
            value={kpi?.produits_sous_minimum ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={(kpi?.produits_sous_minimum ?? 0) > 0 ? 'danger' : 'success'}
          />
          <StatCard
            label="Matières sous minimum"
            value={kpi?.matieres_sous_minimum ?? 0}
            icon={<FileWarning className="h-5 w-5" />}
            accent={(kpi?.matieres_sous_minimum ?? 0) > 0 ? 'danger' : 'success'}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Évolution des ventes" subtitle="30 derniers jours">
          <LineChart points={charts?.ventes_30_jours ?? []} valueKey="total" />
        </ChartCard>

        <ChartCard title="Entrées vs sorties stock" subtitle="30 derniers jours">
          <DualBarChart points={charts?.stock_entrees_sorties ?? []} />
        </ChartCard>

        <ChartCard title="Production" subtitle="Objectif vs réalisé du mois">
          <ProductionProgress
            objectif={charts?.production_objectif_realise.objectif ?? 0}
            realise={charts?.production_objectif_realise.realise ?? 0}
            taux={charts?.production_objectif_realise.taux ?? 0}
          />
        </ChartCard>

        <AlertesCard alertes={alertes} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopListCard
          title="Top 5 produits vendus"
          subtitle="Basé sur les lignes de facture"
          items={charts?.top_produits ?? []}
          valueMode="money"
        />
        <TopListCard
          title="Top 5 clients"
          subtitle="Basé sur les factures"
          items={charts?.top_clients ?? []}
          valueMode="money"
        />
      </section>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">{title}</h2>
          <p className="text-xs text-steel-500">{subtitle}</p>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

function LineChart({
  points,
  valueKey,
}: {
  points: DashboardPoint[]
  valueKey: keyof DashboardPoint
}) {
  const values = points.map((point) => Number(point[valueKey]) || 0)
  const max = Math.max(...values, 1)
  const width = 600
  const height = 180
  const padding = 12

  const path = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
      const y = height - padding - ((Number(point[valueKey]) || 0) / max) * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="space-y-3">
      <div className="h-52 w-full overflow-hidden rounded-md border border-surface-border bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          <path d={path} fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="#334155" opacity="0.08" />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-steel-400">
        <span>{points[0]?.label ?? '—'}</span>
        <span>{points.at(-1)?.label ?? '—'}</span>
      </div>
    </div>
  )
}

function DualBarChart({ points }: { points: DashboardPoint[] }) {
  const max = Math.max(
    ...points.flatMap((point) => [Number(point.entrees) || 0, Number(point.sorties) || 0]),
    1
  )

  return (
    <div className="space-y-4">
      <div className="flex h-52 items-end gap-1 rounded-md border border-surface-border bg-white p-3">
        {points.map((point) => (
          <div key={point.date} className="flex flex-1 items-end justify-center gap-0.5">
            <div
              className="w-1.5 rounded-t bg-emerald-500"
              style={{ height: `${Math.max(4, ((Number(point.entrees) || 0) / max) * 100)}%` }}
              title={`Entrées ${point.label}: ${point.entrees ?? 0}`}
            />
            <div
              className="w-1.5 rounded-t bg-red-500"
              style={{ height: `${Math.max(4, ((Number(point.sorties) || 0) / max) * 100)}%` }}
              title={`Sorties ${point.label}: ${point.sorties ?? 0}`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-steel-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Entrées
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Sorties
        </span>
      </div>
    </div>
  )
}

function ProductionProgress({
  objectif,
  realise,
  taux,
}: {
  objectif: number
  realise: number
  taux: number
}) {
  const percent = Math.max(0, Math.min(taux, 100))

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-surface-border bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-steel-700">Réalisation</span>
          <span className="font-semibold text-steel-900">{percent.toFixed(1)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-subtle">
          <div className="h-full rounded-full bg-steel-700" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Objectif" value={formatQty(objectif)} />
        <MiniMetric label="Réalisé" value={formatQty(realise)} />
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-subtle p-4">
      <p className="text-xs uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-steel-900">{value}</p>
    </div>
  )
}

function TopListCard({
  title,
  subtitle,
  items,
  valueMode,
}: {
  title: string
  subtitle: string
  items: DashboardTopItem[]
  valueMode: 'money' | 'qty'
}) {
  const max = Math.max(...items.map((item) => item.total), 1)

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">{title}</h2>
          <p className="text-xs text-steel-500">{subtitle}</p>
        </div>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-steel-400">Aucune donnée disponible.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-steel-900">{item.label}</p>
                    {item.description && (
                      <p className="truncate text-xs text-steel-500">{item.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-steel-700">
                    {valueMode === 'money' ? formatMGA(item.total) : formatQty(item.quantite ?? item.total)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full rounded-full bg-steel-700"
                    style={{ width: `${Math.max(3, (item.total / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function AlertesCard({ alertes }: { alertes: DashboardAlerte[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">Centre de pilotage</h2>
          <p className="text-xs text-steel-500">Actions prioritaires à traiter</p>
        </div>
        <Badge variant={alertes.length > 0 ? 'warning' : 'success'} dot>
          {alertes.length}
        </Badge>
      </CardHeader>
      <CardBody>
        {alertes.length === 0 ? (
          <div className="py-10 text-center text-sm text-steel-400">
            Aucune alerte prioritaire.
          </div>
        ) : (
          <div className="space-y-2">
            {alertes.map((alerte) => (
              <AlerteRow key={alerte.id} alerte={alerte} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function AlerteRow({ alerte }: { alerte: DashboardAlerte }) {
    const accent: Record<DashboardAlerte['priorite'], AlertBadgeVariant> = {
    haute: 'danger',
    moyenne: 'warning',
    basse: 'info',
  }

  return (
    <div className="rounded-md border border-surface-border bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={accent[alerte.priorite]} dot>
              {alerte.priorite}
            </Badge>
            <p className="text-sm font-semibold text-steel-900">{alerte.titre}</p>
          </div>
          <p className="mt-1 text-sm text-steel-500">{alerte.message}</p>
        </div>
        <Link
          href={alerte.action_url}
          className={cn(
            'shrink-0 rounded-md border border-surface-border px-2.5 py-1.5 text-xs font-medium',
            'text-steel-700 hover:bg-surface-subtle'
          )}
        >
          {alerte.action_label}
        </Link>
      </div>
    </div>
  )
}
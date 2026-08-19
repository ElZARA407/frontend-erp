'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Factory,
  PackageSearch,
  Receipt,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { formatMGA, formatQty } from '@/lib/utils'
import type { DashboardAlerte, DashboardPoint, DashboardTopItem } from '@/lib/types'

type AnyPoint = DashboardPoint & Record<string, unknown>
type Accent = 'primary' | 'success' | 'warning' | 'danger' | 'info'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function num(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function labelOf(point: AnyPoint) {
  return String(point.label ?? point.date ?? '')
}

function sumBy(points: AnyPoint[], key: string) {
  return points.reduce((sum, point) => sum + num(point[key]), 0)
}


export function DashboardView() {
  const permissions = usePermissions()
  const canWidget = permissions.canDashboardWidget

  const [dateDebut, setDateDebut] = useState(daysAgoIso(29))
  const [dateFin, setDateFin] = useState(todayIso())
  const [produitId, setProduitId] = useState<number | undefined>(undefined)

  const filters = useMemo(
    () => ({
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      produit_id: produitId,
    }),
    [dateDebut, dateFin, produitId],
  )

  const { data: dashboard, isLoading } = useDashboard(filters)
  const { data: productsPage } = useProducts({ actif: true, per_page: 500 })

  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.designation,
    description: product.nomencla,
  }))

  const kpi = dashboard?.kpi
  const charts = dashboard?.charts
  const alertes = Array.isArray(dashboard?.alertes) ? dashboard.alertes : []
  const ventes = ((charts?.ventes_30_jours ?? []) as AnyPoint[])
  // const stockFlux = ((charts?.stock_entrees_sorties ?? []) as AnyPoint[])

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-5">
        <PageHeader title="Dashboard" subtitle="Vue de pilotage de l’ERP CMP" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle="Pilotage commercial, stock et production avec filtres métier"
      />

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
            <Input
              label="Date début"
              type="date"
              value={dateDebut}
              onChange={(event) => setDateDebut(event.target.value)}
            />
            <Input
              label="Date fin"
              type="date"
              value={dateFin}
              onChange={(event) => setDateFin(event.target.value)}
            />
            <SearchableSelect
              label="Produit"
              options={productOptions}
              value={produitId ?? null}
              onValueChange={(value) => setProduitId(Number(value) > 0 ? Number(value) : undefined)}
              placeholder="Tous les produits"
              searchPlaceholder="Rechercher un produit..."
              noOptionsMessage="Aucun produit trouvé."
            />
            <Button
              type="button"
              variant="outline"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                setDateDebut(daysAgoIso(29))
                setDateFin(todayIso())
                setProduitId(undefined)
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {canWidget('commandes_en_attente') && (
          <KpiCard label="Commandes à livrer" value={formatQty(kpi?.commandes_en_attente ?? 0)} href="/commandes" icon={<ShoppingCart className="h-5 w-5" />} accent="warning" />
        )}
        {canWidget('bons_production_en_cours') && (
          <KpiCard label="BP en cours" value={formatQty(kpi?.bons_production_en_cours ?? 0)} href="/production" icon={<Factory className="h-5 w-5" />} accent="primary" />
        )}
        {canWidget('bons_transformation_en_cours') && (
          <KpiCard label="BT en cours" value={formatQty(kpi?.bons_transformation_en_cours ?? 0)} href="/recyclage" icon={<Boxes className="h-5 w-5" />} accent="info" />
        )}
        {canWidget('livraisons_du_jour') && (
          <KpiCard label="Livraisons du jour" value={formatQty(kpi?.livraisons_du_jour ?? 0)} href="/livraisons" icon={<PackageSearch className="h-5 w-5" />} accent="success" />
        )}
        {canWidget('factures_en_attente') && (
          <KpiCard label="Factures à suivre" value={formatQty(kpi?.factures_en_attente ?? 0)} href="/factures" icon={<Receipt className="h-5 w-5" />} accent="danger" />
        )}
        {canWidget('valeur_totale_stock') && (
          <KpiCard label="Valeur stock" value={formatMGA(kpi?.valeur_totale_stock ?? 0)} href="/stocks" icon={<BarChart3 className="h-5 w-5" />} accent="primary" />
        )}
        {canWidget('produits_sous_minimum') && (
          <KpiCard label="Produits sous minimum" value={formatQty(kpi?.produits_sous_minimum ?? 0)} href="/stocks?entite_type=produit" icon={<AlertTriangle className="h-5 w-5" />} accent="warning" />
        )}
        {canWidget('matieres_sous_minimum') && (
          <KpiCard label="Matières sous minimum" value={formatQty(kpi?.matieres_sous_minimum ?? 0)} href="/stocks?entite_type=matiere" icon={<AlertTriangle className="h-5 w-5" />} accent="danger" />
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {canWidget('ventes_30_jours') && (
          <SalesEvolutionCard points={ventes} filteredProduct={produitId !== undefined} />
        )}

        {canWidget('stock_entrees_sorties') && (
          <StockRiskCard
            valeurStock={num(kpi?.valeur_totale_stock)}
            referencesStock={num(kpi?.references_stock)}
            produitsSousMinimum={num(kpi?.produits_sous_minimum)}
            matieresSousMinimum={num(kpi?.matieres_sous_minimum)}
          />
        )}

        {canWidget('production_objectif_realise') && (
          <ProductionCard
            objectif={num(charts?.production_objectif_realise?.objectif)}
            realise={num(charts?.production_objectif_realise?.realise)}
            taux={num(charts?.production_objectif_realise?.taux)}
          />
        )}

        {canWidget('top_produits') && (
          <RankingCard
            title="Top produits vendus"
            subtitle="Classement par chiffre d’affaires sur la période"
            items={charts?.top_produits ?? []}
            valueFormatter={formatMGA}
          />
        )}

        {canWidget('top_clients') && (
          <RankingCard
            title="Top clients"
            subtitle="Clients les plus importants sur la période"
            items={charts?.top_clients ?? []}
            valueFormatter={formatMGA}
          />
        )}

        <PilotageCard alertes={alertes} />
      </div>
    </div>
  )
}

function StockRiskCard({
  valeurStock,
  referencesStock,
  produitsSousMinimum,
  matieresSousMinimum,
}: {
  valeurStock: number
  referencesStock: number
  produitsSousMinimum: number
  matieresSousMinimum: number
}) {
  const totalAlertes = produitsSousMinimum + matieresSousMinimum
  const tauxRisque = referencesStock > 0 ? Math.min(100, (totalAlertes / referencesStock) * 100) : 0

  const riskVariant =
    tauxRisque >= 30 ? 'danger' : tauxRisque >= 10 ? 'warning' : 'success'

  return (
    <ChartShell
      title="Stock & risque"
      subtitle="Synthèse exploitable pour décision d’approvisionnement"
      footer={
        <div className="grid grid-cols-2 gap-3 text-xs">
          <MiniMetric label="Produits sous min." value={formatQty(produitsSousMinimum)} />
          <MiniMetric label="Matières sous min." value={formatQty(matieresSousMinimum)} />
        </div>
      }
    >
      <div className="rounded-md border border-surface-border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
              Valeur totale du stock
            </p>
            <p className="mt-2 text-2xl font-semibold text-steel-900">
              {formatMGA(valeurStock)}
            </p>
            <p className="mt-1 text-xs text-steel-500">
              Calculée à partir des stocks physiques et coûts unitaires disponibles.
            </p>
          </div>

          <Badge variant={riskVariant}>
            Risque {Math.round(tauxRisque)}%
          </Badge>
        </div>

        <div className="mt-5 space-y-3">
          <StockRiskLine
            label="Références actives en stock"
            value={referencesStock}
            max={Math.max(referencesStock, 1)}
            color="bg-blue-600"
          />
          <StockRiskLine
            label="Produits sous seuil minimum"
            value={produitsSousMinimum}
            max={Math.max(referencesStock, 1)}
            color="bg-amber-500"
          />
          <StockRiskLine
            label="Matières sous seuil minimum"
            value={matieresSousMinimum}
            max={Math.max(referencesStock, 1)}
            color="bg-red-500"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/stocks"
            className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-center text-xs font-semibold text-steel-700 hover:border-primary-200 hover:text-primary-700"
          >
            Voir stock
          </Link>
          <Link
            href="/rapports?tab=stock"
            className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-center text-xs font-semibold text-steel-700 hover:border-primary-200 hover:text-primary-700"
          >
            Rapport stock
          </Link>
        </div>
      </div>
    </ChartShell>
  )
}

function StockRiskLine({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="text-steel-500">{label}</span>
        <span className="font-semibold text-steel-900">{formatQty(value)}</span>
      </div>
      <div className="h-2 rounded bg-steel-100">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${Math.max(value > 0 ? 3 : 0, width)}%` }}
        />
      </div>
    </div>
  )
}

function KpiCard({ label, value, href, icon, accent }: { label: string; value: string; href: string; icon: ReactNode; accent: Accent }) {
  const styles: Record<Accent, string> = {
    primary: 'bg-blue-50 text-blue-700 ring-blue-100',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-700 ring-amber-100',
    danger: 'bg-red-50 text-red-700 ring-red-100',
    info: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  }

  return (
    <Link href={href}>
      <Card className="transition hover:border-primary-200 hover:shadow-sm">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-steel-900">{value}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-700">
                Ouvrir <ArrowRight className="h-3 w-3" />
              </p>
            </div>
            <div className={`rounded-md p-2 ring-1 ${styles[accent]}`}>{icon}</div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

function SalesEvolutionCard({ points, filteredProduct }: { points: AnyPoint[]; filteredProduct: boolean }) {
  const total = sumBy(points, 'total')
  const quantite = sumBy(points, 'quantite')

  return (
    <ChartShell
      title="Évolution des ventes"
      subtitle={filteredProduct ? 'Ventes du produit sélectionné' : 'Ventes tous produits'}
      footer={
        <div className="grid grid-cols-2 gap-3 text-xs">
          <MiniMetric label="CA période" value={formatMGA(total)} />
          <MiniMetric label="Quantité vendue" value={formatQty(quantite)} />
        </div>
      }
    >
      <LineChart points={points} valueKey="total" accent="#2563eb" formatValue={formatMGA} />
      <Legend items={[{ label: 'Chiffre d’affaires', color: '#2563eb' }]} />
    </ChartShell>
  )
}




function LineChart({ points, valueKey, accent, formatValue }: { points: AnyPoint[]; valueKey: string; accent: string; formatValue: (value: number) => string }) {
  if (points.length === 0) return <EmptyChart message="Aucune vente sur cette période." />

  const width = 760
  const height = 260
  const paddingX = 42
  const paddingY = 28
  const values = points.map((point) => num(point[valueKey]))
  const max = Math.max(...values, 0) || 1
  const step = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0

  const coords = points.map((point, index) => ({
    x: paddingX + index * step,
    y: height - paddingY - (num(point[valueKey]) / max) * (height - paddingY * 2),
    value: num(point[valueKey]),
    label: labelOf(point),
  }))

  const path = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`).join(' ')

  return (
    <div className="overflow-hidden rounded-md border border-surface-border bg-white">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingY + ratio * (height - paddingY * 2)
          const value = max - max * ratio

          return (
            <g key={ratio}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x="4" y={y + 4} fontSize="10" fill="#64748b">{formatValue(value)}</text>
            </g>
          )
        })}

        <path d={path} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((coord, index) => (
          <g key={`${coord.label}-${index}`}>
            <circle cx={coord.x} cy={coord.y} r="4" fill="white" stroke={accent} strokeWidth="2">
              <title>{coord.label} - {formatValue(coord.value)}</title>
            </circle>
            {(index === 0 || index === coords.length - 1 || index % Math.ceil(coords.length / 6) === 0) && (
              <text x={coord.x} y={height - 8} fontSize="10" textAnchor="middle" fill="#64748b">
                {coord.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

function ProductionCard({ objectif, realise, taux }: { objectif: number; realise: number; taux: number }) {
  const percent = objectif > 0 ? Math.min(100, (realise / objectif) * 100) : taux
  const reste = Math.max(0, objectif - realise)

  return (
    <ChartShell
      title="Production"
      subtitle="Objectif vs réalisé sur la période"
      footer={
        <div className="grid grid-cols-3 gap-3 text-xs">
          <MiniMetric label="Objectif" value={formatQty(objectif)} />
          <MiniMetric label="Réalisé" value={formatQty(realise)} />
          <MiniMetric label="Reste" value={formatQty(reste)} />
        </div>
      }
    >
      <div className="rounded-md border border-surface-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-steel-900">Réalisation production</p>
            <p className="mt-1 text-xs text-steel-500">Filtrée selon les dates et le produit sélectionné</p>
          </div>
          <Badge variant={percent >= 100 ? 'success' : percent >= 60 ? 'info' : 'warning'}>{Math.round(percent)}%</Badge>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-steel-100">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        </div>
      </div>
    </ChartShell>
  )
}

function RankingCard({ title, subtitle, items, valueFormatter }: { title: string; subtitle: string; items: DashboardTopItem[]; valueFormatter: (value: number) => string }) {
  const max = Math.max(...items.map((item) => num(item.total)), 0) || 1

  return (
    <ChartShell title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <EmptyChart message="Aucune donnée sur cette période." />
      ) : (
        <div className="space-y-3 rounded-md border border-surface-border bg-white p-3">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-steel-700">{index + 1}. {item.label}</span>
                <span className="shrink-0 text-steel-500">{valueFormatter(num(item.total))}</span>
              </div>
              <div className="h-2 rounded bg-blue-100">
                <div className="h-2 rounded bg-blue-600" style={{ width: `${Math.max(3, (num(item.total) / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartShell>
  )
}

function PilotageCard({ alertes }: { alertes: DashboardAlerte[] }) {
  return (
    <ChartShell title="Comité de pilotage" subtitle="Alertes actionnables du jour">
      {alertes.length === 0 ? (
        <EmptyChart message="Aucune action prioritaire." />
      ) : (
        <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-white">
          {alertes.slice(0, 8).map((alerte) => (
            <div key={alerte.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={alerte.priorite === 'haute' ? 'danger' : alerte.priorite === 'moyenne' ? 'warning' : 'info'}>
                    {alerte.priorite}
                  </Badge>
                  <p className="text-sm font-semibold text-steel-900">{alerte.titre}</p>
                </div>
                <p className="mt-1 text-xs text-steel-500">{alerte.message}</p>
              </div>
              <Link href={alerte.action_url} className="shrink-0 text-xs font-semibold text-primary-700 hover:underline">
                {alerte.action_label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </ChartShell>
  )
}

function ChartShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-steel-900">{title}</p>
            <p className="mt-1 text-xs text-steel-500">{subtitle}</p>
          </div>
          <TrendingUp className="h-4 w-4 text-steel-400" />
        </div>
        {children}
        {footer && <div className="mt-4">{footer}</div>}
      </CardBody>
    </Card>
  )
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 text-xs text-steel-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-steel-900">{value}</p>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-surface-border bg-surface-subtle text-sm text-steel-400">
      {message}
    </div>
  )
}
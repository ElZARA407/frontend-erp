// src/components/features/dashboard/dashboard-view.tsx
'use client'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { StatCard } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMGA, formatQty } from '@/lib/utils'
import {
  Factory, ShoppingCart, AlertTriangle,
  TrendingUp, Package, Receipt, Clock
} from 'lucide-react'

export function DashboardView() {
  const { data: kpi, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Vue en temps réel — ${new Date().toLocaleDateString('fr-MG', { dateStyle: 'long' })}`}
      />

      {/* Production */}
      <section>
        <p className="section-title mb-3">Production</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="BP actifs"
            value={kpi?.production.bp_actifs ?? 0}
            icon={<Factory className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="BP clôturés ce mois"
            value={kpi?.production.bp_clotures_mois ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="success"
          />
          <StatCard
            label="Coût prod. du mois"
            value={kpi?.production.cout_production_mois ?? 0}
            isMoney
            icon={<Package className="h-5 w-5" />}
            accent="primary"
          />
        </div>
      </section>

      {/* Stock */}
      <section>
        <p className="section-title mb-3">Stock</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Références en stock"
            value={kpi?.stock.total_references ?? 0}
            icon={<Package className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="Ruptures de stock"
            value={kpi?.stock.references_rupture ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={kpi?.stock.references_rupture ? 'danger' : 'success'}
          />
          <StatCard
            label="Valeur stock MP"
            value={kpi?.stock.valeur_stock_mp ?? 0}
            isMoney
            icon={<Package className="h-5 w-5" />}
            accent="primary"
          />
        </div>
      </section>

      {/* Commercial */}
      <section>
        <p className="section-title mb-3">Commercial</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Commandes en cours"
            value={kpi?.commercial.commandes_en_cours ?? 0}
            icon={<ShoppingCart className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="Commandes en retard"
            value={kpi?.commercial.commandes_en_retard ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={kpi?.commercial.commandes_en_retard ? 'danger' : 'success'}
          />
          <StatCard
            label="CA du mois"
            value={kpi?.commercial.ca_mois ?? 0}
            isMoney
            icon={<TrendingUp className="h-5 w-5" />}
            accent="success"
          />
        </div>
      </section>

      {/* Finance */}
      <section>
        <p className="section-title mb-3">Finance</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard
            label="Factures impayées"
            value={kpi?.finance.factures_impayees ?? 0}
            icon={<Receipt className="h-5 w-5" />}
            accent={kpi?.finance.factures_impayees ? 'warning' : 'success'}
          />
          <StatCard
            label="Montant impayé"
            value={kpi?.finance.montant_impaye ?? 0}
            isMoney
            icon={<Receipt className="h-5 w-5" />}
            accent="warning"
          />
          <StatCard
            label="Factures en retard"
            value={kpi?.finance.factures_en_retard ?? 0}
            icon={<Clock className="h-5 w-5" />}
            accent={kpi?.finance.factures_en_retard ? 'danger' : 'success'}
          />
          <StatCard
            label="Montant en retard"
            value={kpi?.finance.montant_retard ?? 0}
            isMoney
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="danger"
          />
        </div>
      </section>
    </div>
  )
}
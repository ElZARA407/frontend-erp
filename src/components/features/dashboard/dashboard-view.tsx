// src/components/features/dashboard/dashboard-view.tsx
'use client'

import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDashboard,
  useDashboardCommercial,
  useDashboardFinance,
  useDashboardProduction,
  useDashboardStock,
} from '@/lib/hooks/use-dashboard'
import {
  AlertTriangle,
  Clock,
  Factory,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'

export function DashboardView() {
  const { data: dashboard, isLoading } = useDashboard()
  const { data: production } = useDashboardProduction()
  const { data: stock } = useDashboardStock()
  const { data: commercial } = useDashboardCommercial()
  const { data: finance } = useDashboardFinance()

  const productionKpi = production ?? dashboard?.production
  const stockKpi = stock ?? dashboard?.stock
  const commercialKpi = commercial ?? dashboard?.commercial
  const financeKpi = finance ?? dashboard?.finance

  const rupturesCount = dashboard?.stock.references_rupture ?? stockKpi?.references_rupture ?? 0
  const commandesRetard =
    dashboard?.commercial.commandes_en_retard ?? commercialKpi?.commandes_en_retard ?? 0
  const facturesRetard =
    dashboard?.finance.factures_en_retard ?? financeKpi?.factures_en_retard ?? 0

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Vue en temps réel - ${new Date().toLocaleDateString('fr-MG', { dateStyle: 'long' })}`}
      />

      <section>
        <p className="section-title mb-3">Synthèse</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="BP actifs"
            value={dashboard?.production.bp_actifs ?? productionKpi?.bp_actifs ?? 0}
            icon={<Factory className="h-5 w-5" />}
            accent="primary"
          />
          <StatCard
            label="Ruptures de stock"
            value={rupturesCount}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={rupturesCount > 0 ? 'danger' : 'success'}
          />
          <StatCard
            label="Commandes en retard"
            value={commandesRetard}
            icon={<ShoppingCart className="h-5 w-5" />}
            accent={commandesRetard > 0 ? 'danger' : 'success'}
          />
          <StatCard
            label="Factures en retard"
            value={facturesRetard}
            icon={<Clock className="h-5 w-5" />}
            accent={facturesRetard > 0 ? 'danger' : 'success'}
          />
        </div>
      </section>

      <DashboardSection
        title="Production"
        subtitle="Ordres de fabrication et coût mensuel"
        gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
        cards={[
          {
            label: 'BP actifs',
            value: productionKpi?.bp_actifs ?? 0,
            icon: <Factory className="h-5 w-5" />,
            accent: 'primary',
          },
          {
            label: 'BP clôturés ce mois',
            value: productionKpi?.bp_clotures_mois ?? 0,
            icon: <TrendingUp className="h-5 w-5" />,
            accent: 'success',
          },
          {
            label: 'Coût prod. du mois',
            value: productionKpi?.cout_production_mois ?? 0,
            isMoney: true,
            icon: <Package className="h-5 w-5" />,
            accent: 'primary',
          },
        ]}
      />

      <DashboardSection
        title="Stock"
        subtitle="Volume et valeur des matières premières"
        gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
        cards={[
          {
            label: 'Références en stock',
            value: stockKpi?.total_references ?? 0,
            icon: <Package className="h-5 w-5" />,
            accent: 'primary',
          },
          {
            label: 'Ruptures de stock',
            value: stockKpi?.references_rupture ?? 0,
            icon: <AlertTriangle className="h-5 w-5" />,
            accent: (stockKpi?.references_rupture ?? 0) > 0 ? 'danger' : 'success',
          },
          {
            label: 'Valeur stock MP',
            value: stockKpi?.valeur_stock_mp ?? 0,
            isMoney: true,
            icon: <Package className="h-5 w-5" />,
            accent: 'primary',
          },
        ]}
      />

      <DashboardSection
        title="Commercial"
        subtitle="Commandes et chiffre d'affaires"
        gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-3"
        cards={[
          {
            label: 'Commandes en cours',
            value: commercialKpi?.commandes_en_cours ?? 0,
            icon: <ShoppingCart className="h-5 w-5" />,
            accent: 'primary',
          },
          {
            label: 'Commandes en retard',
            value: commercialKpi?.commandes_en_retard ?? 0,
            icon: <AlertTriangle className="h-5 w-5" />,
            accent: (commercialKpi?.commandes_en_retard ?? 0) > 0 ? 'danger' : 'success',
          },
          {
            label: 'CA du mois',
            value: commercialKpi?.ca_mois ?? 0,
            isMoney: true,
            icon: <TrendingUp className="h-5 w-5" />,
            accent: 'success',
          },
        ]}
      />

      <DashboardSection
        title="Finance"
        subtitle="Impayés et retards de règlement"
        gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        cards={[
          {
            label: 'Factures impayées',
            value: financeKpi?.factures_impayees ?? 0,
            icon: <Receipt className="h-5 w-5" />,
            accent: (financeKpi?.factures_impayees ?? 0) > 0 ? 'warning' : 'success',
          },
          {
            label: 'Montant impayé',
            value: financeKpi?.montant_impaye ?? 0,
            isMoney: true,
            icon: <Receipt className="h-5 w-5" />,
            accent: 'warning',
          },
          {
            label: 'Factures en retard',
            value: financeKpi?.factures_en_retard ?? 0,
            icon: <Clock className="h-5 w-5" />,
            accent: (financeKpi?.factures_en_retard ?? 0) > 0 ? 'danger' : 'success',
          },
          {
            label: 'Montant en retard',
            value: financeKpi?.montant_retard ?? 0,
            isMoney: true,
            icon: <AlertTriangle className="h-5 w-5" />,
            accent: 'danger',
          },
        ]}
      />
    </div>
  )
}

type StatCardAccent = 'primary' | 'success' | 'warning' | 'danger'

type SectionCard = {
  label: string
  value: number
  isMoney?: boolean
  icon: ReactNode
  accent?: StatCardAccent
}

function DashboardSection({
  title,
  subtitle,
  cards,
  gridClassName,
}: {
  title: string
  subtitle: string
  cards: SectionCard[]
  gridClassName: string
}) {
  return (
    <section>
      <p className="section-title mb-3">{title}</p>
      <p className="-mt-1 mb-3 text-xs text-steel-500">{subtitle}</p>
      <div className={gridClassName}>
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            isMoney={card.isMoney}
            icon={card.icon}
            accent={card.accent ?? 'primary'}
          />
        ))}
      </div>
    </section>
  )
}
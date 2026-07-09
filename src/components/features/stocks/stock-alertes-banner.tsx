'use client'

import { AlertTriangle, Boxes, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRuptures, useStockAlerts } from '@/lib/hooks/use-stocks'

interface StockAlertesBannerProps {
  onVoirInventaire?: () => void
  onVoirMouvements?: () => void
}

function normalizeCount(value: unknown): number {
  if (!value || typeof value !== 'object') return 0

  const root = value as { data?: unknown }
  if (!root.data) return 0

  if (Array.isArray(root.data)) {
    return root.data.length
  }

  if (typeof root.data === 'object' && root.data !== null) {
    const page = root.data as { total?: unknown; data?: unknown }

    const total = Number(page.total)
    if (Number.isFinite(total)) return total

    if (Array.isArray(page.data)) return page.data.length
  }

  return 0
}

export function StockAlertesBanner({ onVoirInventaire, onVoirMouvements }: StockAlertesBannerProps) {
  const { data: alertes = [] } = useStockAlerts()
  const { data: rupturesPage } = useRuptures({ page: 1, per_page: 10 })

  const alertesCount = Array.isArray(alertes) ? alertes.length : 0
  const rupturesCount = normalizeCount(rupturesPage)
  const totalCount = alertesCount + rupturesCount

  return (
    <Card className="border-surface-border bg-white">
      <div className="grid gap-4 p-4 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-steel-500">Alertes stock bas</p>
            <p className="text-xl font-semibold text-steel-900">{alertesCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-700">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-steel-500">Ruptures</p>
            <p className="text-xl font-semibold text-steel-900">{rupturesCount}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-steel-500">Total a surveiller</p>
            <p className="text-xl font-semibold text-steel-900">{totalCount}</p>
            <Badge variant={totalCount > 0 ? 'warning' : 'success'} dot className="mt-1">
              {totalCount > 0 ? 'Action requise' : 'Rien a signaler'}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={<Boxes className="h-3.5 w-3.5" />}
              onClick={onVoirInventaire}
            >
              Inventaire
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onVoirMouvements}>
              Mouvements
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
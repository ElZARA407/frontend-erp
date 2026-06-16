// src/components/features/stocks/stocks-view.tsx
'use client'
import { useState } from 'react'
import { useStocks, useRuptures } from '@/lib/hooks/use-stocks'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatQty } from '@/lib/utils'
import { Box, AlertTriangle } from 'lucide-react'
import type { Stock } from '@/lib/types'

export function StocksView() {
  const [page, setPage]             = useState(1)
  const [entiteType, setEntiteType] = useState<string>('')
  const [tab, setTab]               = useState<'stock' | 'ruptures'>('stock')

  const { data: stockData, isLoading: loadingStock }      = useStocks({ entite_type: entiteType || undefined, page, per_page: 20 })
  const { data: ruptures, isLoading: loadingRuptures }   = useRuptures()

  const stocks   = stockData?.data.data ?? []
  const paginate = stockData?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stocks"
        subtitle="Inventaire temps réel par site"
      />

      {/* Onglets */}
      <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-subtle p-1 w-fit">
        {[
          { key: 'stock',    label: 'Inventaire'      },
          { key: 'ruptures', label: `Ruptures${ruptures?.length ? ` (${ruptures.length})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'stock' | 'ruptures')}
            className={
              tab === key
                ? 'rounded-md bg-white px-4 py-1.5 text-sm font-medium text-steel-800 shadow-card'
                : 'px-4 py-1.5 text-sm text-steel-500 hover:text-steel-700'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ruptures' ? (
        <Card>
          {loadingRuptures ? (
            <TableSkeleton rows={5} cols={4} />
          ) : !ruptures?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-emerald-500">
              <Box className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucune rupture de stock !</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Site', 'Entité', 'Classement', 'Stock', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {ruptures.map((s: Stock) => (
                  <tr key={s.id} className="bg-red-50/30">
                    <td className="px-4 py-3 text-steel-600">{s.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-500 text-xs">{s.entite_type}</td>
                    <td className="px-4 py-3 font-medium">{s.classement?.designation ?? `ID ${s.entite_id}`}</td>
                    <td className="px-4 py-3">
                      <span className="amount text-red-600">{formatQty(s.stock_total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="danger" dot>Rupture</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex rounded-md border border-surface-border overflow-hidden text-xs">
              {[
                { value: '',        label: 'Tout'     },
                { value: 'produit', label: 'Produits' },
                { value: 'matiere', label: 'Matières' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setEntiteType(value); setPage(1) }}
                  className={
                    entiteType === value
                      ? 'bg-steel-700 px-3 py-1.5 font-medium text-white'
                      : 'bg-white px-3 py-1.5 text-steel-600 hover:bg-surface-subtle'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Card>
            {loadingStock ? (
              <TableSkeleton rows={12} cols={5} />
            ) : stocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-steel-400">
                <Box className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Aucun stock trouvé</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Site', 'Type', 'Article', 'Classement / Qualité', 'Quantité', 'Statut'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {stocks.map((s: Stock) => (
                    <tr key={s.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-3 text-steel-600">{s.location?.nom ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.entite_type === 'produit' ? 'info' : 'muted'}>
                          {s.entite_type === 'produit' ? 'Produit' : 'Matière'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-steel-500 text-xs">#{s.entite_id}</td>
                      <td className="px-4 py-3 font-medium text-steel-800">
                        {s.classement?.designation ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`amount ${s.en_rupture ? 'text-red-600' : ''}`}>
                          {formatQty(s.stock_total)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.en_rupture ? 'danger' : 'success'} dot>
                          {s.en_rupture ? 'Rupture' : 'Disponible'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {paginate && (
              <Pagination
                currentPage={paginate.current_page}
                lastPage={paginate.last_page}
                total={paginate.total}
                from={paginate.from ?? 0}
                to={paginate.to ?? 0}
                onPageChange={setPage}
              />
            )}
          </Card>
        </>
      )}
    </div>
  )
}
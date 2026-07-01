'use client'

import { useState } from 'react'
import { Box, Layers3, AlertTriangle, RotateCcw, ArrowDownUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatQty } from '@/lib/utils'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMouvements, useRuptures, useStocks } from '@/lib/hooks/use-stocks'
import type { Stock, MouvementStock } from '@/lib/types'

type TabKey = 'inventaire' | 'mouvements' | 'ruptures'

export function StocksView() {
  const [tab, setTab] = useState<TabKey>('inventaire')

  const [stockPage, setStockPage] = useState(1)
  const [stockEntiteType, setStockEntiteType] = useState<string>('')

  const [movementPage, setMovementPage] = useState(1)
  const [movementLocationId, setMovementLocationId] = useState<string>('')
  const [movementEntiteType, setMovementEntiteType] = useState<string>('')
  const [movementEntiteId, setMovementEntiteId] = useState<string>('')
  const [movementType, setMovementType] = useState<string>('')
  const [movementDateDebut, setMovementDateDebut] = useState('')
  const [movementDateFin, setMovementDateFin] = useState('')

  const { data: locationsData } = useLocations()
  const { data: stockData, isLoading: loadingStock } = useStocks({
    entite_type: stockEntiteType || undefined,
    page: stockPage,
    per_page: 20,
  })
  const { data: ruptures, isLoading: loadingRuptures } = useRuptures()
  const { data: mouvementsData, isLoading: loadingMouvements } = useMouvements({
    location_id: movementLocationId ? Number(movementLocationId) : undefined,
    entite_type: movementEntiteType || undefined,
    entite_id: movementEntiteId ? Number(movementEntiteId) : undefined,
    type: movementType || undefined,
    date_debut: movementDateDebut || undefined,
    date_fin: movementDateFin || undefined,
    page: movementPage,
    per_page: 20,
  })

  const locations = Array.isArray(locationsData) ? locationsData : []

  const stocksPagination = stockData?.data
  const stocks = Array.isArray(stocksPagination?.data) ? stocksPagination.data : []

  const mouvementsPagination = mouvementsData?.data
  const mouvements = Array.isArray(mouvementsPagination?.data) ? mouvementsPagination.data : []

  const stockTypeOptions = [
    { value: '', label: 'Tout' },
    { value: 'produit', label: 'Produits' },
    { value: 'matiere', label: 'Matières' },
  ]

  const movementTypeOptions = [
    { value: '', label: 'Tous' },
    { value: 'entree', label: 'Entrée' },
    { value: 'sortie', label: 'Sortie' },
    { value: 'retour', label: 'Retour' },
    { value: 'inventaire', label: 'Inventaire' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stocks"
        subtitle="Inventaire, ruptures et mouvements avec filtrage métier"
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'inventaire', label: 'Inventaire', icon: Layers3 },
          { key: 'mouvements', label: 'Mouvements', icon: ArrowDownUp },
          { key: 'ruptures', label: `Ruptures${ruptures?.length ? ` (${ruptures.length})` : ''}`, icon: AlertTriangle },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            icon={<Icon className="h-3.5 w-3.5" />}
            onClick={() => setTab(key as TabKey)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'ruptures' && (
        <Card>
          {loadingRuptures ? (
            <TableSkeleton rows={6} cols={5} />
          ) : !ruptures?.length ? (
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-emerald-500">
                <Box className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Aucune rupture de stock</p>
              </div>
            </CardBody>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Site', 'Type', 'Article', 'Classement', 'Stock', 'Statut'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {(Array.isArray(ruptures) ? ruptures : []).map((s: Stock) => (
                    <tr key={s.id} className="bg-red-50/30">
                      <td className="px-4 py-3 text-steel-600">{s.location?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-500 text-xs">{s.entite_type}</td>
                      <td className="px-4 py-3 font-medium">{s.entite?.nomencla}</td>
                      <td className="px-4 py-3 text-steel-800">
                        {s.entite?.designation ?? '—'} - {s.classement?.libelle ?? ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className="amount text-red-600">{formatQty(s.stock_total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="danger" dot>
                          Rupture
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'mouvements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
            <Select
              label="Site"
              placeholder="Tous"
              options={locations.map((location) => ({ value: location.id, label: location.nom }))}
              value={movementLocationId}
              onChange={(e) => {
                setMovementLocationId(e.target.value)
                setMovementPage(1)
              }}
            />
            <Select
              label="Type"
              placeholder="Tous"
              options={movementTypeOptions}
              value={movementType}
              onChange={(e) => {
                setMovementType(e.target.value)
                setMovementPage(1)
              }}
            />
            <Select
              label="Entité"
              placeholder="Tous"
              options={stockTypeOptions}
              value={movementEntiteType}
              onChange={(e) => {
                setMovementEntiteType(e.target.value)
                setMovementPage(1)
              }}
            />
            <Input
              label="ID entité"
              type="number"
              placeholder="Ex: 15"
              value={movementEntiteId}
              onChange={(e) => {
                setMovementEntiteId(e.target.value)
                setMovementPage(1)
              }}
            />
            <Input
              label="Du"
              type="date"
              value={movementDateDebut}
              onChange={(e) => {
                setMovementDateDebut(e.target.value)
                setMovementPage(1)
              }}
            />
            <Input
              label="Au"
              type="date"
              value={movementDateFin}
              onChange={(e) => {
                setMovementDateFin(e.target.value)
                setMovementPage(1)
              }}
            />
          </div>

          <Card>
            {loadingMouvements ? (
              <TableSkeleton rows={10} cols={8} />
            ) : mouvements.length === 0 ? (
              <CardBody>
                <div className="flex flex-col items-center justify-center py-16 text-steel-400">
                  <RotateCcw className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Aucun mouvement trouvé</p>
                </div>
              </CardBody>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Date', 'Site', 'Type', 'Entité', 'Qté', 'Impact', 'Référence', 'Utilisateur', 'Classement'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {mouvements.map((m: MouvementStock) => (
                      <tr key={m.id} className="hover:bg-surface-muted/60 transition-colors">
                        <td className="px-4 py-3 text-steel-600">{formatDateTime(m.date_mouvement)}</td>
                        <td className="px-4 py-3 text-steel-600">{m.location?.nom ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.type.valeur === 'sortie'
                                ? 'danger'
                                : m.type.valeur === 'entree'
                                  ? 'success'
                                  : m.type.valeur === 'inventaire'
                                    ? 'warning'
                                    : 'info'
                            }
                            dot
                          >
                            {m.type.libelle}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-800">
                          <div className="font-medium">{m.entite_type}</div>
                          <div className="text-xs text-steel-500">#{m.entite_id}</div>
                        </td>
                        <td className="px-4 py-3 text-steel-600">{formatQty(m.quantite)}</td>
                        <td className="px-4 py-3 text-steel-600">{formatQty(m.impact_stock)}</td>
                        <td className="px-4 py-3 text-xs text-steel-500">
                          {m.reference_type} #{m.reference_id}
                        </td>
                        <td className="px-4 py-3 text-steel-600">{m.utilisateur?.nom ?? '—'}</td>
                        <td className="px-4 py-3 text-steel-600">{m.classement?.designation ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {mouvementsPagination && (
              <Pagination
                currentPage={mouvementsPagination.current_page}
                lastPage={mouvementsPagination.last_page}
                total={mouvementsPagination.total}
                from={mouvementsPagination.from ?? 0}
                to={mouvementsPagination.to ?? 0}
                onPageChange={setMovementPage}
              />
            )}
          </Card>
        </div>
      )}

      {tab === 'inventaire' && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex rounded-md border border-surface-border overflow-hidden text-xs">
              {stockTypeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setStockEntiteType(value)
                    setStockPage(1)
                  }}
                  className={
                    stockEntiteType === value
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
              <TableSkeleton rows={12} cols={6} />
            ) : stocks.length === 0 ? (
              <CardBody>
                <div className="flex flex-col items-center justify-center py-16 text-steel-400">
                  <Box className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Aucun stock trouvé</p>
                </div>
              </CardBody>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Site', 'Type', 'Article', 'Classement / Qualité', 'Quantité', 'Statut'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">
                          {h}
                        </th>
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
                        <td className="px-4 py-3 text-steel-500 text-xs">{s.entite?.nomencla}</td>
                        <td className="px-4 py-3 font-medium text-steel-800">
                          {s.entite?.designation ?? '—'} - {s.classement?.libelle ?? ''}
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
              </div>
            )}

            {stocksPagination && (
              <Pagination
                currentPage={stocksPagination.current_page}
                lastPage={stocksPagination.last_page}
                total={stocksPagination.total}
                from={stocksPagination.from ?? 0}
                to={stocksPagination.to ?? 0}
                onPageChange={setStockPage}
              />
            )}
          </Card>
        </>
      )}
    </div>
  )
}
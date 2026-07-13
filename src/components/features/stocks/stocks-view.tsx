'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownUp, Box, Search, SlidersHorizontal, Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ExcelImportDialog } from '@/components/ui/excel-import-dialog'
import { formatQty } from '@/lib/utils'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useImportStocks, useRuptures, useStocks } from '@/lib/hooks/use-stocks'
import type { Stock } from '@/lib/types'
import { AjustementDialog } from './ajustement-dialog'
import { MouvementStockView } from './mouvement-stock-view'

type TabKey = 'stock' | 'mouvements'
type StockMode = 'inventaire' | 'ruptures'

const ENTITY_OPTIONS = [
  { value: '', label: 'Toutes' },
  { value: 'produit', label: 'Produit' },
  { value: 'matiere', label: 'Matiere' },
]

const STOCK_MODE_OPTIONS: Array<{ value: StockMode; label: string }> = [
  { value: 'inventaire', label: 'Inventaire' },
  { value: 'ruptures', label: 'Rupture' },
]

function stockBadgeVariant(stock: Stock) {
  if (stock.en_rupture) return 'danger'
  if (stock.sous_seuil_alerte) return 'warning'
  return 'success'
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const root = value as { data?: unknown }
    if (Array.isArray(root.data)) return root.data as T[]

    if (root.data && typeof root.data === 'object') {
      const nested = root.data as { data?: unknown }
      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }
  return []
}

export function StocksView() {
  const [tab, setTab] = useState<TabKey>('stock')
  const [stockMode, setStockMode] = useState<StockMode>('inventaire')

  const [search, setSearch] = useState('')
  const [stockPage, setStockPage] = useState(1)
  const [rupturePage, setRupturePage] = useState(1)
  const [movementPage, setMovementPage] = useState(1)

  const [stockLocationId, setStockLocationId] = useState('')
  const [stockEntiteType, setStockEntiteType] = useState('')

  const [movementLocationId, setMovementLocationId] = useState('')

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const { data: locationsData } = useLocations()
  const locations = useMemo(() => normalizeArray<{ id: number; nom: string }>(locationsData), [locationsData])

  const importStocks = useImportStocks()

  const stockFilters = useMemo(
    () => ({
      location_id: stockLocationId ? Number(stockLocationId) : undefined,
      entite_type: stockEntiteType || undefined,
      search: search || undefined,
      page: stockPage,
      per_page: 10,
    }),
    [stockLocationId, stockEntiteType, search, stockPage]
  )

  const ruptureFilters = useMemo(
    () => ({
      location_id: stockLocationId ? Number(stockLocationId) : undefined,
      entite_type: stockEntiteType || undefined,
      search: search || undefined,
      page: rupturePage,
      per_page: 10,
    }),
    [stockLocationId, stockEntiteType, search, rupturePage]
  )

  const { data: stockData, isLoading: loadingStock } = useStocks(stockFilters)
  const { data: rupturesData, isLoading: loadingRuptures } = useRuptures(ruptureFilters)

  const stockPagination = stockData?.data
  const stocks = Array.isArray(stockPagination?.data) ? stockPagination.data : []

  const rupturePagination = rupturesData?.data
  const ruptures = Array.isArray(rupturePagination?.data) ? rupturePagination.data : []

  useEffect(() => {
    setStockPage(1)
    setRupturePage(1)
    setMovementPage(1)
  }, [search, stockLocationId, stockEntiteType, stockMode])

  const handleImportStocks = async ({
    file,
    sheetNames,
  }: {
    file: File
    sheetNames: string[]
  }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      sheetNames.forEach((sheetName) => {
        formData.append('sheet_names[]', sheetName)
      })

      await importStocks.mutateAsync(formData)
      setImportOpen(false)
    } catch {
      // toast géré par le hook
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock"
        subtitle="Inventaire, ruptures et mouvements avec recherche et pagination"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="h-3.5 w-3.5" />}
            loading={importStocks.isPending}
            onClick={() => setImportOpen(true)}
          >
            Importer Excel
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'stock', label: 'Stock', icon: Box },
          { key: 'mouvements', label: 'Mouvements', icon: ArrowDownUp },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            icon={<Icon className="h-3.5 w-3.5" />}
            onClick={() => setTab(key as TabKey)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <Input
          label="Recherche globale"
          placeholder="Article, location, source, motif, reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-3.5 w-3.5" />}
          className="max-w-xl"
        />
      </div>

      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STOCK_MODE_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={stockMode === value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setStockMode(value)
                  if (value === 'inventaire') setStockPage(1)
                  if (value === 'ruptures') setRupturePage(1)
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Select
              label="Location"
              placeholder="Toutes"
              options={locations.map((location) => ({ value: location.id, label: location.nom }))}
              value={stockLocationId}
              onChange={(e) => {
                setStockLocationId(e.target.value)
                setStockPage(1)
                setRupturePage(1)
              }}
            />
            <Select
              label="Type"
              placeholder="Toutes"
              options={ENTITY_OPTIONS}
              value={stockEntiteType}
              onChange={(e) => {
                setStockEntiteType(e.target.value)
                setStockPage(1)
                setRupturePage(1)
              }}
            />
          </div>

          {stockMode === 'inventaire' && (
            <>
              <Card>
                {loadingStock ? (
                  <TableSkeleton rows={10} cols={8} />
                ) : stocks.length === 0 ? (
                  <CardBody>
                    <div className="flex flex-col items-center justify-center py-16 text-steel-400">
                      <Box className="mb-2 h-8 w-8" />
                      <p className="text-sm font-medium">Aucun stock trouve</p>
                    </div>
                  </CardBody>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-border">
                          {['Localisation', 'Type', 'Article', 'Classement', 'Quantite', 'Seuil', 'Statut', 'Action'].map((label) => (
                            <th
                              key={label}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {stocks.map((s: Stock) => (
                          <tr key={s.id} className="hover:bg-surface-muted/60 transition-colors">
                            <td className="px-4 py-3 text-steel-600">{s.location?.nom ?? '—'}</td>
                            <td className="px-4 py-3 text-steel-600">
                              {s.entite_type === 'produit' ? 'Produit' : 'Matiere'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-steel-900">
                                {s.entite?.designation ?? s.entite?.nom ?? s.entite?.nomencla ?? '—'}
                              </div>
                              <div className="text-xs text-steel-500">
                                {s.entite?.nomencla ?? s.entite?.reference ?? `#${s.entite_id}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-steel-600">
                              {s.classement?.libelle ?? s.classement?.designation ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-semibold ${
                                  s.en_rupture
                                    ? 'text-red-600'
                                    : s.sous_seuil_alerte
                                      ? 'text-amber-600'
                                      : 'text-steel-900'
                                }`}
                              >
                                {formatQty(s.stock_total)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-steel-600">
                              {s.seuil !== null && s.seuil !== undefined ? formatQty(s.seuil) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={stockBadgeVariant(s)} dot>
                                {s.en_rupture ? 'Rupture' : s.sous_seuil_alerte ? 'Bas' : 'Disponible'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-steel-500">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setSelectedStock(s)
                                  setAdjustOpen(true)
                                }}
                              >
                                Ajuster
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {stockPagination && (
                <div className="pt-2">
                  <Pagination
                    currentPage={stockPagination.current_page}
                    lastPage={stockPagination.last_page}
                    total={stockPagination.total}
                    from={stockPagination.from ?? 0}
                    to={stockPagination.to ?? 0}
                    onPageChange={setStockPage}
                  />
                </div>
              )}
            </>
          )}

          {stockMode === 'ruptures' && (
            <>
              <Card>
                {loadingRuptures ? (
                  <TableSkeleton rows={10} cols={6} />
                ) : ruptures.length === 0 ? (
                  <CardBody>
                    <div className="flex flex-col items-center justify-center py-16 text-emerald-500">
                      <AlertTriangle className="mb-2 h-8 w-8" />
                      <p className="text-sm font-medium">Aucune rupture de stock</p>
                    </div>
                  </CardBody>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-border">
                          {['Location', 'Type', 'Article', 'Classement', 'Stock', 'Statut', 'Action'].map((label) => (
                            <th
                              key={label}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {ruptures.map((s: Stock) => (
                          <tr key={s.id} className="bg-red-50/30">
                            <td className="px-4 py-3 text-steel-600">{s.location?.nom ?? '—'}</td>
                            <td className="px-4 py-3 text-steel-600">
                              {s.entite_type === 'produit' ? 'Produit' : 'Matiere'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-steel-900">
                                {s.entite?.designation ?? s.entite?.nom ?? s.entite?.nomencla ?? '—'}
                              </div>
                              <div className="text-xs text-steel-500">
                                {s.entite?.nomencla ?? s.entite?.reference ?? `#${s.entite_id}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-steel-600 ">
                              {s.classement?.libelle ?? s.classement?.designation ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-red-600">{formatQty(s.stock_total)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="danger" dot>
                                Rupture
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-steel-500">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setSelectedStock(s)
                                  setAdjustOpen(true)
                                }}
                              >
                                Ajuster
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {rupturePagination && (
                <div className="pt-2">
                  <Pagination
                    currentPage={rupturePagination.current_page}
                    lastPage={rupturePagination.last_page}
                    total={rupturePagination.total}
                    from={rupturePagination.from ?? 0}
                    to={rupturePagination.to ?? 0}
                    onPageChange={setRupturePage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'mouvements' && (
        <MouvementStockView
          search={search}
          locationId={movementLocationId}
          onLocationIdChange={setMovementLocationId}
          page={movementPage}
          onPageChange={setMovementPage}
        />
      )}

      <AjustementDialog
        open={adjustOpen}
        onClose={() => {
          setAdjustOpen(false)
          setSelectedStock(null)
        }}
        stock={selectedStock}
      />

      <ExcelImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importer des stocks"
        description="Importe les stocks depuis le fichier modèle du stock. Si entite_type = produit, le classement est obligatoire. Si entite_type = matiere, le classement peut rester vide."
        templateFileName="Stocks.xlsx"
        loading={importStocks.isPending}
        defaultSheetNames={['Sheet1']}
        onImport={handleImportStocks}
      />
    </div>
  )
}
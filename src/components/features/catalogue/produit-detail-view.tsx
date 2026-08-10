'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Boxes, History, Package, Warehouse } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProduct } from '@/lib/hooks/use-catalogue'
import { useMouvements, useStocks } from '@/lib/hooks/use-stocks'
import { formatDate, formatQty } from '@/lib/utils'
import type { MouvementStock, Stock } from '@/lib/types'

interface ProduitDetailViewProps {
  id: number
}

export function ProduitDetailView({ id }: ProduitDetailViewProps) {
  const router = useRouter()
  const { data: produit, isLoading: loadingProduit } = useProduct(id)
  const { data: stocksPage, isLoading: loadingStocks } = useStocks({
    entite_type: 'produit',
    entite_id: id,
    include_zero: true,
    per_page: 100,
  })
  const { data: mouvementsPage, isLoading: loadingMouvements } = useMouvements({
    entite_type: 'produit',
    entite_id: id,
    per_page: 12,
  })

  const stocks = stocksPage?.data?.data ?? []
  const mouvements = mouvementsPage?.data?.data ?? []
  const totalStock = stocks.reduce((sum, stock) => sum + Number(stock.stock_total || 0), 0)
  const seuil = Number(produit?.seuil ?? 0)
  const sousSeuil = seuil > 0 && totalStock <= seuil

  if (loadingProduit && !produit) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!produit) {
    return (
      <div className="space-y-5">
        <PageHeader title="Produit introuvable" />
        <Button variant="outline" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => router.push('/catalogue')}>
          Retour au catalogue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={produit.designation}
        subtitle={`${produit.nomencla} - fiche produit fini`}
        actions={
          <>
            <Button variant="outline" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => router.push('/catalogue')}>
              Catalogue
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Stock total" value={formatQty(totalStock)} icon={<Warehouse className="h-5 w-5" />} tone={sousSeuil ? 'danger' : 'success'} />
        <KpiCard label="Seuil minimum" value={formatQty(seuil)} icon={<Boxes className="h-5 w-5" />} tone={sousSeuil ? 'warning' : 'muted'} />
        <KpiCard label="Colisage" value={formatQty(produit.colisage)} icon={<Package className="h-5 w-5" />} />
        <KpiCard label="Poids" value={produit.poids || '-'} icon={<Package className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-steel-900">Informations produit</h2>
            <Badge variant={produit.actif ? 'success' : 'muted'} dot>
              {produit.actif ? 'Actif' : 'Inactif'}
            </Badge>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info label="Nomenclature" value={produit.nomencla} />
              <Info label="Catégorie" value={produit.categorie?.nom ?? '-'} />
              <Info label="Contenance" value={produit.contenance ?? '-'} />
              <Info label="Format" value={produit.format ?? '-'} />
              <Info label="Unité" value={produit.unite} />
              <Info label="Créé le" value={formatDate(produit.created_at)} />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-steel-900">Stock par qualité</h2>
            <Badge variant={sousSeuil ? 'warning' : 'success'} dot>
              {sousSeuil ? 'Sous seuil' : 'Disponible'}
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(produit.stocks_par_qualite ?? []).map((stock) => (
                <div key={stock.classement_id} className="rounded-md border border-surface-border p-3">
                  <p className="text-xs uppercase tracking-wide text-steel-400">{stock.libelle}</p>
                  <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(stock.stock_total)}</p>
                  <p className="mt-1 text-xs text-steel-500">{stock.qualite}</p>
                </div>
              ))}
              {(produit.stocks_par_qualite ?? []).length === 0 && (
                <p className="text-sm text-steel-400">Aucun stock classé pour ce produit.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StockByLocationCard loading={loadingStocks} stocks={stocks} />
        <MouvementsCard loading={loadingMouvements} mouvements={mouvements} />
      </div>
    </div>
  )
}

function StockByLocationCard({ loading, stocks }: { loading: boolean; stocks: Stock[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-steel-900">Stocks par emplacement</h2>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : stocks.length === 0 ? (
          <p className="py-8 text-center text-sm text-steel-400">Aucun stock déclaré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Classement</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">Seuil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td className="px-3 py-2 text-steel-700">{stock.location?.nom ?? '-'}</td>
                    <td className="px-3 py-2 text-steel-600">{stock.classement?.libelle ?? stock.classement?.designation ?? '-'}</td>
                    <td className="px-3 py-2 text-right font-semibold text-steel-900">{formatQty(stock.stock_total)}</td>
                    <td className="px-3 py-2 text-right text-steel-600">{stock.seuil !== null && stock.seuil !== undefined ? formatQty(stock.seuil) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function MouvementsCard({ loading, mouvements }: { loading: boolean; mouvements: MouvementStock[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-steel-500" />
          <h2 className="text-sm font-semibold text-steel-900">Derniers mouvements</h2>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : mouvements.length === 0 ? (
          <p className="py-8 text-center text-sm text-steel-400">Aucun mouvement récent.</p>
        ) : (
          <div className="space-y-2">
            {mouvements.map((mouvement) => (
              <div key={mouvement.id} className="rounded-md border border-surface-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-steel-900">{mouvement.motif ?? mouvement.reference_type ?? 'Mouvement'}</p>
                    <p className="text-xs text-steel-500">{formatDate(mouvement.date_mouvement)} - {mouvement.location?.nom ?? '-'}</p>
                  </div>
                  <Badge variant={mouvement.type?.valeur === 'sortie' ? 'danger' : 'success'} dot>
                    {mouvement.type?.libelle ?? mouvement.type?.valeur ?? '-'} {formatQty(mouvement.quantite)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function KpiCard({ label, value, icon, tone = 'primary' }: { label: string; value: string; icon: ReactNode; tone?: 'primary' | 'success' | 'warning' | 'danger' | 'muted' }) {
  const color = {
    primary: 'text-steel-700',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    muted: 'text-steel-500',
  }[tone]

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-steel-400">{label}</p>
          <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
        </div>
        <div className="rounded-md border border-surface-border bg-surface-subtle p-2 text-steel-500">
          {icon}
        </div>
      </CardBody>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-steel-400">{label}</dt>
      <dd className="mt-1 font-medium text-steel-800">{value}</dd>
    </div>
  )
}

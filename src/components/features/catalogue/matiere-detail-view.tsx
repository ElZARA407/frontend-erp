'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FlaskConical, History, PencilLine, Warehouse } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMatiere } from '@/lib/hooks/use-catalogue'
import { useMouvements, useStocks } from '@/lib/hooks/use-stocks'
import { formatDate, formatMGA, formatQty } from '@/lib/utils'
import type { MouvementStock, Stock } from '@/lib/types'

interface MatiereDetailViewProps {
  id: number
}

export function MatiereDetailView({ id }: MatiereDetailViewProps) {
  const router = useRouter()
  const { data: matiere, isLoading: loadingMatiere } = useMatiere(id)
  const { data: stocksPage, isLoading: loadingStocks } = useStocks({
    entite_type: 'matiere',
    entite_id: id,
    include_zero: true,
    per_page: 100,
  })
  const { data: mouvementsPage, isLoading: loadingMouvements } = useMouvements({
    entite_type: 'matiere',
    entite_id: id,
    per_page: 12,
  })

  const stocks = stocksPage?.data?.data ?? []
  const mouvements = mouvementsPage?.data?.data ?? []
  const totalStock = stocks.reduce((sum, stock) => sum + Number(stock.stock_total || 0), 0)
  const seuil = Number(matiere?.seuil ?? 0)
  const sousSeuil = seuil > 0 && totalStock <= seuil

  if (loadingMatiere && !matiere) {
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

  if (!matiere) {
    return (
      <div className="space-y-5">
        <PageHeader title="Matière introuvable" />
        <Button variant="outline" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => router.push('/catalogue')}>
          Retour au catalogue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={matiere.nom}
        subtitle={`${matiere.reference} - fiche matière première`}
        actions={
          <>
            <Button variant="outline" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => router.push('/catalogue')}>
              Catalogue
            </Button>
            <Button variant="outline" icon={<PencilLine className="h-3.5 w-3.5" />} onClick={() => router.push('/catalogue')}>
              Modifier depuis la liste
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Stock total" value={formatQty(totalStock || matiere.stock_total || 0)} icon={<Warehouse className="h-5 w-5" />} tone={sousSeuil ? 'danger' : 'success'} />
        <KpiCard label="Seuil minimum" value={formatQty(seuil)} icon={<FlaskConical className="h-5 w-5" />} tone={sousSeuil ? 'warning' : 'muted'} />
        <KpiCard label="Prix moyen" value={formatMGA(matiere.prix_moyen)} icon={<FlaskConical className="h-5 w-5" />} />
        <KpiCard label="Unité" value={matiere.unite} icon={<FlaskConical className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-steel-900">Informations matière</h2>
            <Badge variant={matiere.actif ? 'success' : 'muted'} dot>
              {matiere.actif ? 'Actif' : 'Inactif'}
            </Badge>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info label="Référence" value={matiere.reference} />
              <Info label="Type" value={<Badge variant="info">{matiere.type}</Badge>} />
              <Info label="Unité" value={matiere.unite} />
              <Info label="Créée le" value={formatDate(matiere.created_at)} />
              <div className="sm:col-span-2">
                <Info label="Description" value={matiere.description || 'Aucune description.'} />
              </div>
            </dl>
          </CardBody>
        </Card>

        <StockByLocationCard loading={loadingStocks} stocks={stocks} />
      </div>

      <MouvementsCard loading={loadingMouvements} mouvements={mouvements} />
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
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">Seuil</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td className="px-3 py-2 text-steel-700">{stock.location?.nom ?? '-'}</td>
                    <td className="px-3 py-2 text-right font-semibold text-steel-900">{formatQty(stock.stock_total)}</td>
                    <td className="px-3 py-2 text-right text-steel-600">{stock.seuil !== null && stock.seuil !== undefined ? formatQty(stock.seuil) : '-'}</td>
                    <td className="px-3 py-2">
                      <Badge variant={stock.en_rupture ? 'danger' : stock.sous_seuil_alerte ? 'warning' : 'success'} dot>
                        {stock.en_rupture ? 'Rupture' : stock.sous_seuil_alerte ? 'Bas' : 'Disponible'}
                      </Badge>
                    </td>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Motif</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2 text-right">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {mouvements.map((mouvement) => (
                  <tr key={mouvement.id}>
                    <td className="px-3 py-2 text-steel-600">{formatDate(mouvement.date_mouvement)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={mouvement.type?.valeur === 'sortie' ? 'danger' : 'success'} dot>
                        {mouvement.type?.libelle ?? mouvement.type?.valeur ?? '-'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-steel-700">{mouvement.motif ?? mouvement.reference_type ?? '-'}</td>
                    <td className="px-3 py-2 text-steel-600">{mouvement.location?.nom ?? '-'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatQty(mouvement.quantite)}</td>
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

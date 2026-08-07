'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Calculator, CalendarRange, Factory, Package, ReceiptText, TrendingUp } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useBonsProduction, useCoutMoyenBonProduction, useCoutMoyenProduit } from '@/lib/hooks/use-production'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { formatDate, formatQty,formatMoney } from '@/lib/utils'
import type { BonProduction, Produit } from '@/lib/types'
import type {
  ProductionCostBpResponse,
  ProductionCostProductResponse,
} from '@/lib/api/production'
import { useRouter } from 'next/navigation'

type Mode = 'produit' | 'bp'

interface CoutMoyenViewProps {
  mode: Mode
}

type Resultat = ProductionCostProductResponse | ProductionCostBpResponse



function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: 'primary' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-steel-900">{value}</p>
        </div>
        <div
          className={[
            'rounded-md p-2',
            accent === 'primary' ? 'bg-sky-50 text-sky-600' : '',
            accent === 'success' ? 'bg-emerald-50 text-emerald-600' : '',
            accent === 'warning' ? 'bg-amber-50 text-amber-600' : '',
            accent === 'danger' ? 'bg-red-50 text-red-600' : '',
          ].join(' ')}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-surface-border bg-surface-subtle/40 px-4 py-10 text-center text-sm text-steel-500">
      {text}
    </div>
  )
}

export function CoutMoyenView({ mode }: CoutMoyenViewProps) {
  const isProduitMode = mode === 'produit'
  const router = useRouter()

  const { data: productsPage, isLoading: productsLoading } = useProducts({
    actif: true,
    per_page: 200,
  })
  const { data: bpsPage, isLoading: bpsLoading } = useBonsProduction({
    per_page: 200,
  })

  const products = useMemo(() => {
    const rows = productsPage?.data?.data
    return Array.isArray(rows) ? rows : []
  }, [productsPage])

  const bps = useMemo(() => {
    const rows = bpsPage?.data?.data
    return Array.isArray(rows) ? rows : []
  }, [bpsPage])

  const [selectedProduitId, setSelectedProduitId] = useState<number | null>(null)
  const [selectedBpId, setSelectedBpId] = useState<number | null>(null)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  useEffect(() => {
    if (isProduitMode && !selectedProduitId && products.length > 0) {
      setSelectedProduitId(products[0].id)
    }
  }, [isProduitMode, products, selectedProduitId])

  useEffect(() => {
    if (!isProduitMode && !selectedBpId && bps.length > 0) {
      setSelectedBpId(bps[0].id)
    }
  }, [isProduitMode, bps, selectedBpId])

  const productParams = useMemo(
    () => ({
      date_debut: isProduitMode && dateDebut ? dateDebut : undefined,
      date_fin: isProduitMode && dateFin ? dateFin : undefined,
    }),
    [isProduitMode, dateDebut, dateFin],
  )

  const productQuery = useCoutMoyenProduit(selectedProduitId ?? 0, productParams)
  const bpQuery = useCoutMoyenBonProduction(selectedBpId ?? 0)

  const result = (isProduitMode ? productQuery.data : bpQuery.data) as Resultat | undefined
  const isResultLoading = isProduitMode ? productQuery.isLoading : bpQuery.isLoading
  const isListLoading = isProduitMode ? productsLoading : bpsLoading

  const selectedProduct = products.find((item: Produit) => item.id === selectedProduitId) ?? null
  const selectedBp = bps.find((item: BonProduction) => item.id === selectedBpId) ?? null

  const productOptions = useMemo(
    () =>
      products.map((product: Produit) => ({
        value: product.id,
        label: `${product.nomencla} - ${product.designation}`,
        description: product.categorie?.nom ?? undefined,
      })),
    [products],
  )

  const bpOptions = useMemo(
    () =>
      bps.map((bp: BonProduction) => ({
        value: bp.id,
        label: `${bp.numero} - ${bp.produit?.designation ?? 'Produit'}`,
        description: `${bp.location?.nom ?? '—'} • ${bp.statut?.libelle ?? '—'}`,
      })),
    [bps],
  )

  const details = Array.isArray(result?.details) ? result.details : []

  return (
    <div className="space-y-5">
      <PageHeader
        title={isProduitMode ? 'Coût moyen pondéré produit' : 'Coût moyen pondéré BP'}
        subtitle={
          isProduitMode
            ? 'Calcul sur les sessions validées d’un produit dans une période donnée.'
            : 'Calcul sur toutes les sessions validées d’un bon de production.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.back()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Button>
            <Link
              href={isProduitMode ? '/production/cout-moyen-bp' : '/production/cout-moyen-produit'}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <Calculator className="h-4 w-4" />
              {isProduitMode ? 'Voir par BP' : 'Voir par produit'}
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sélection</h2>
            <p className="text-xs text-steel-500">
              {isProduitMode
                ? 'Choisis un produit et une période.'
                : 'Choisis un bon de production.'}
            </p>
          </div>
          <Badge variant="info" dot>
            {isProduitMode ? 'Produit' : 'BP'}
          </Badge>
        </CardHeader>

        <CardBody className="space-y-4">
          {isProduitMode ? (
            <>
              <SearchableSelect
                label="Produit"
                options={productOptions}
                value={selectedProduitId ?? ''}
                onValueChange={(value) => setSelectedProduitId(Number(value))}
                placeholder={products.length ? 'Choisir un produit' : 'Aucun produit disponible'}
                searchPlaceholder="Rechercher une nomencla ou désignation..."
                noOptionsMessage="Aucun produit trouvé."
                disabled={isListLoading || products.length === 0}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Date début"
                  type="date"
                  icon={<CalendarRange className="h-4 w-4" />}
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
                <Input
                  label="Date fin"
                  type="date"
                  icon={<CalendarRange className="h-4 w-4" />}
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateDebut('')
                    setDateFin('')
                  }}
                >
                  Réinitialiser les dates
                </Button>
              </div>
            </>
          ) : (
            <SearchableSelect
              label="Bon de production"
              options={bpOptions}
              value={selectedBpId ?? ''}
              onValueChange={(value) => setSelectedBpId(Number(value))}
              placeholder={bps.length ? 'Choisir un BP' : 'Aucun BP disponible'}
              searchPlaceholder="Rechercher un numéro, produit ou site..."
              noOptionsMessage="Aucun BP trouvé."
              disabled={isListLoading || bps.length === 0}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Résultat</h2>
            <p className="text-xs text-steel-500">
              Le calcul se base uniquement sur les sessions validées.
            </p>
          </div>
          <Badge variant="success" dot>
            {result?.sessions_count ?? 0} session(s)
          </Badge>
        </CardHeader>

        <CardBody className="space-y-5">
          {isResultLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : !result ? (
            <EmptyState text="Choisis un élément pour afficher le coût moyen pondéré." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="Sessions prises"
                  value={String(result.sessions_count ?? 0)}
                  icon={<Factory className="h-5 w-5" />}
                  accent="primary"
                />
                <MetricCard
                  label="Quantité totale"
                  value={formatQty(result.quantite_totale ?? 0)}
                  icon={<TrendingUp className="h-5 w-5" />}
                  accent="success"
                />
                <MetricCard
                  label="Coût moyen pondéré"
                  value={formatMoney(result.cout_moyen_pondere ?? 0, 2)}
                  icon={<ReceiptText className="h-5 w-5" />}
                  accent="warning"
                />
                <MetricCard
                  label="Produit moyen / heure"
                  value={`${formatQty(result.production_moyenne_heure ?? 0)} / h`}
                  icon={<Package className="h-5 w-5" />}
                  accent="primary"
                />
                <MetricCard
                  label="Échantillon"
                  value={isProduitMode ? (selectedProduct ? `${selectedProduct.nomencla}` : '—') : (selectedBp ? selectedBp.numero : '—')}
                  icon={<Calculator className="h-5 w-5" />}
                  accent="danger"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-surface-border bg-surface-subtle/20 p-4 md:grid-cols-2">
                {isProduitMode ? (
                  <>
                    <InfoField label="Produit" value={selectedProduct ? `${selectedProduct.nomencla} - ${selectedProduct.designation}` : '—'} />
                    <InfoField label="Période" value={`${dateDebut || 'début libre'} → ${dateFin || 'fin libre'}`} />
                  </>
                ) : (
                  <>
                    <InfoField label="Bon de production" value={selectedBp?.numero ?? '—'} />
                    <InfoField label="Produit" value={selectedBp?.produit?.designation ?? '—'} />
                  </>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">Session</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Quantité</th>
                      <th className="px-4 py-3">Coût unitaire</th>
                      <th className="px-4 py-3">Coût pondéré</th>
                      <th className="px-4 py-3">Produit / h</th>
                      <th className="px-4 py-3">Heures prod.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {details.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-steel-500">
                          Aucun résultat à afficher.
                        </td>
                      </tr>
                    ) : (
                      details.map((row) => (
                        <tr key={row.bp_session_id} className="hover:bg-surface-subtle/70">
                          <td className="px-4 py-3 font-medium text-steel-900">
                            #{row.bp_session_numero}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatDate(row.date_session)}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatQty(row.quantite)}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatMoney(row.cout_unitaire, 2)}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatMoney(row.cout_pondere, 2)}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatQty(row.production_session ?? 0)}
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {formatQty(row.temps_effectif ?? 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 font-semibold text-steel-900">{value}</p>
    </div>
  )
}
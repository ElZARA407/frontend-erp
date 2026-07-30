'use client'

import { useMemo, useState,useEffect } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Factory,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  Download,
ArrowDown,
ArrowUp,
RotateCcw,
} from 'lucide-react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select } from '@/components/ui/select'
import { useProducts, useMatieres } from '@/lib/hooks/use-catalogue'
import { useExportReport } from '@/lib/hooks/use-reports'
import type { ReportExportSection } from '@/lib/api/reports'
import type { ReportMouvementRow } from '@/lib/reports.types'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { useReports } from '@/lib/hooks/use-reports'
import { formatDate, formatMGA, formatQty } from '@/lib/utils'
import type { ReportItem, ReportStockItem } from '@/lib/reports.types'
import { usePermissions } from '@/lib/hooks/use-permissions'

type ReportTab = 'commercial' | 'stock' | 'production' | 'recyclage' | 'finance' | 'mouvements'

const TABS: Array<{ key: ReportTab; label: string; icon: typeof FileText }> = [
  { key: 'commercial', label: 'Commercial', icon: ShoppingCart },
  { key: 'stock', label: 'Stock', icon: Package },
  { key: 'production', label: 'Production', icon: Factory },
  { key: 'recyclage', label: 'Recyclage', icon: Boxes },
  { key: 'finance', label: 'Finance', icon: Receipt },
  { key: 'mouvements', label: 'Mouvements', icon: ArrowDown },
]

function defaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return date.toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsView() {
    const [tab, setTab] = useState<ReportTab>('commercial')
    const [dateDebut, setDateDebut] = useState(defaultStartDate())
    const [dateFin, setDateFin] = useState(today())
    const permissions = usePermissions()

    const visibleTabs = useMemo(
      () => TABS.filter((item) => permissions.canReportTab(item.key)),
      [permissions]
    )

    const [mouvementEntiteType, setMouvementEntiteType] = useState<'produit' | 'matiere'>('produit')
    const [mouvementEntiteId, setMouvementEntiteId] = useState<number | null>(null)
    const [mouvementMotif, setMouvementMotif] = useState('')

    const exportReport = useExportReport()
    const { data: productsPage } = useProducts({ per_page: 500 })
    const { data: matieresPage } = useMatieres({ per_page: 500 })

    const produits = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
    const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []

  const filters = useMemo(
  () => ({
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    mouvement_entite_type: tab === 'mouvements' ? mouvementEntiteType : undefined,
    mouvement_entite_id: tab === 'mouvements' && mouvementEntiteId ? mouvementEntiteId : undefined,
    mouvement_motif: tab === 'mouvements' && mouvementMotif ? mouvementMotif : undefined,
  }),
  [dateDebut, dateFin, tab, mouvementEntiteType, mouvementEntiteId, mouvementMotif]
)

  const { data, isLoading } = useReports(filters)

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((item) => item.key === tab)) {
      setTab(visibleTabs[0].key)
    }
  }, [tab, visibleTabs])

  return (
    <div className="space-y-5">
      <PageHeader
        title="États & Rapports"
        subtitle="Synthèses utiles pour le pilotage commercial, stock, production et finance"
        actions={
            <Button
            type="button"
            size="sm"
            variant="outline"
            icon={<Download className="h-3.5 w-3.5" />}
            loading={exportReport.isPending}
            onClick={() =>
                exportReport.mutate({
                section: tab as ReportExportSection,
                filters,
                })
            }
            >
            Export Excel
        </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_220px_auto] md:items-end">
        <Input
          label="Date début"
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
        <Input
          label="Date fin"
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={tab === key ? 'primary' : 'outline'}
              icon={<Icon className="h-3.5 w-3.5" />}
              onClick={() => setTab(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        {/* <Button
            type="button"
            size="sm"
            variant="outline"
            icon={<Download className="h-3.5 w-3.5" />}
            loading={exportReport.isPending}
            onClick={() =>
                exportReport.mutate({
                section: tab as ReportExportSection,
                filters,
                })
            }
            >
            Export Excel
        </Button> */}
      </div>

      {isLoading && !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : (
        <>
          {tab === 'commercial' && <CommercialReport data={data} />}
          {tab === 'stock' && <StockReport data={data} />}
          {tab === 'production' && <ProductionReport data={data} />}
          {tab === 'recyclage' && <RecyclageReport data={data} />}
          {tab === 'finance' && <FinanceReport data={data} />}
          {tab === 'mouvements' && (
            <MouvementsReport
                data={data}
                entiteType={mouvementEntiteType}
                onEntiteTypeChange={(value) => {
                setMouvementEntiteType(value)
                setMouvementEntiteId(null)
                }}
                entiteId={mouvementEntiteId}
                onEntiteIdChange={setMouvementEntiteId}
                motif={mouvementMotif}
                onMotifChange={setMouvementMotif}
                produits={produits}
                matieres={matieres}
            />
            )}
        </>
      )}
    </div>
  )
}

function CommercialReport({ data }: { data: Awaited<ReturnType<typeof useReports>>['data'] }) {
  const commercial = data?.commercial
  const commandes = commercial?.commandes_detaillees ?? []
  const ventesDirectes = commercial?.ventes_directes_detaillees ?? []
  const livraisons = commercial?.livraisons_detaillees ?? []

  return (
    <div className="space-y-4">
      <SummaryGrid>
        <StatCard
          label="CA facturé"
          value={(commercial?.ventes_par_periode ?? []).reduce((sum, row) => sum + row.total, 0)}
          isMoney
          icon={<BarChart3 className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Commandes"
          value={commandes.length}
          icon={<ShoppingCart className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Ventes directes"
          value={ventesDirectes.length}
          icon={<Receipt className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="BL"
          value={livraisons.length}
          icon={<Package className="h-5 w-5" />}
          accent="success"
        />
      </SummaryGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ItemsCard title="Ventes par produit" items={commercial?.ventes_par_produit ?? []} mode="money" />
        <ItemsCard title="Ventes par client" items={commercial?.ventes_par_client ?? []} mode="money" />
      </div>

      <CommercialDocumentsTable
        title="Commandes détaillées"
        subtitle="Commandes avec quantités commandées, livrées et restantes"
        rows={commandes}
        showExpectedDate
      />

      <CommercialDocumentsTable
        title="Ventes directes détaillées"
        subtitle="Ventes directes avec quantités livrées et restantes"
        rows={ventesDirectes}
      />

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Livraisons / BL</h2>
            <p className="text-xs text-steel-500">BL issus des commandes ou ventes directes visibles par l’utilisateur</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-3 py-2">BL</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2 text-right">Lignes</th>
                  <th className="px-3 py-2 text-right">Qté livrée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {livraisons.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 font-medium text-steel-900">{row.numero}</td>
                    <td className="px-3 py-2 text-steel-600">{formatDate(row.date_livraison)}</td>
                    <td className="px-3 py-2 text-steel-600">{row.client}</td>
                    <td className="px-3 py-2 text-steel-600">
                      {row.source_type === 'commande' ? 'Commande' : 'Vente directe'} #{row.source_id}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={row.statut === 'livre' ? 'success' : 'warning'} dot>
                        {row.statut}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">{row.lignes_count}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatQty(row.quantite_livree)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function CommercialDocumentsTable({
  title,
  subtitle,
  rows,
  showExpectedDate = false,
}: {
  title: string
  subtitle: string
  rows: Array<{
    id: number
    numero: string
    date: string
    date_livraison_prevue?: string | null
    statut: string
    client: string
    quantite_commandee: number
    quantite_livree: number
    quantite_restante: number
    total: number
  }>
  showExpectedDate?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">{title}</h2>
          <p className="text-xs text-steel-500">{subtitle}</p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                <th className="px-3 py-2">Référence</th>
                <th className="px-3 py-2">Date</th>
                {showExpectedDate && <th className="px-3 py-2">Prévue</th>}
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Commandée</th>
                <th className="px-3 py-2 text-right">Livrée</th>
                <th className="px-3 py-2 text-right">Restante</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 font-medium text-steel-900">{row.numero}</td>
                  <td className="px-3 py-2 text-steel-600">{formatDate(row.date)}</td>
                  {showExpectedDate && (
                    <td className="px-3 py-2 text-steel-600">{formatDate(row.date_livraison_prevue)}</td>
                  )}
                  <td className="px-3 py-2 text-steel-600">{row.client}</td>
                  <td className="px-3 py-2">
                    <Badge variant={row.quantite_restante <= 0 ? 'success' : 'warning'} dot>
                      {row.statut}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">{formatQty(row.quantite_commandee)}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{formatQty(row.quantite_livree)}</td>
                  <td className="px-3 py-2 text-right text-amber-600">{formatQty(row.quantite_restante)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatMGA(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

function StockReport({ data }: { data: Awaited<ReturnType<typeof useReports>>['data'] }) {
  const stock = data?.stock

  return (
    <div className="space-y-4">
      <SummaryGrid>
        <StatCard label="Références" value={stock?.etat_stock.references ?? 0} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Références positives" value={stock?.etat_stock.references_positives ?? 0} icon={<Package className="h-5 w-5" />} accent="success" />
        <StatCard label="Ruptures" value={stock?.etat_stock.ruptures ?? 0} icon={<AlertTriangle className="h-5 w-5" />} accent={(stock?.etat_stock.ruptures ?? 0) > 0 ? 'danger' : 'success'} />
        <StatCard label="Valeur MP" value={stock?.etat_stock.valeur_matieres ?? 0} isMoney icon={<Package className="h-5 w-5" />} />
      </SummaryGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StockItemsCard title="Produits sous minimum" items={stock?.produits_sous_minimum ?? []} />
        <StockItemsCard title="Matières sous minimum" items={stock?.matieres_sous_minimum ?? []} />
      </div>
    </div>
  )
}

function ProductionReport({ data }: { data: Awaited<ReturnType<typeof useReports>>['data'] }) {
  const production = data?.production

  return (
    <div className="space-y-4">
      <SummaryGrid>
        <StatCard label="Coût production" value={production?.cout_production.cout_total ?? 0} isMoney icon={<Factory className="h-5 w-5" />} />
        <StatCard label="Produits suivis" value={production?.objectif_vs_realise.length ?? 0} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Machines actives" value={production?.production_par_machine.length ?? 0} icon={<Factory className="h-5 w-5" />} accent="success" />
        <StatCard label="Matières consommées" value={production?.consommation_matiere.length ?? 0} icon={<Boxes className="h-5 w-5" />} />
      </SummaryGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ItemsCard title="Objectif vs réalisé" items={production?.objectif_vs_realise ?? []} mode="progress" />
        <ItemsCard title="Production par machine" items={production?.production_par_machine ?? []} mode="qty" />
        <ItemsCard title="Consommation matière" items={production?.consommation_matiere ?? []} mode="qty" />
      </div>
    </div>
  )
}

function RecyclageReport({ data }: { data: Awaited<ReturnType<typeof useReports>>['data'] }) {
  const recyclage = data?.recyclage

  return (
    <div className="space-y-4">
      <SummaryGrid>
        <StatCard
          label="Lignes transformation"
          value={recyclage?.quantite_transformee.length ?? 0}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          label="Évolution mensuelle"
          value={recyclage?.evolution_mensuelle.length ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          accent="success"
        />
      </SummaryGrid>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Quantité transformée</h2>
            <p className="text-xs text-steel-500">Entrées et sorties recyclage validées</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {(recyclage?.quantite_transformee ?? []).map((row) => (
              <div key={row.type} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
                <span className="font-medium text-steel-700">{row.type}</span>
                <span className="font-semibold text-steel-900">{formatQty(row.quantite)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
function MouvementsReport({
  data,
  entiteType,
  onEntiteTypeChange,
  entiteId,
  onEntiteIdChange,
  motif,
  onMotifChange,
  produits,
  matieres,
}: {
  data: Awaited<ReturnType<typeof useReports>>['data']
  entiteType: 'produit' | 'matiere'
  onEntiteTypeChange: (value: 'produit' | 'matiere') => void
  entiteId: number | null
  onEntiteIdChange: (value: number | null) => void
  motif: string
  onMotifChange: (value: string) => void
  produits: Array<{ id: number; nomencla: string; designation: string }>
  matieres: Array<{ id: number; reference: string; nom: string }>
}) {
  const mouvements = data?.mouvements
  const lignes = Array.isArray(mouvements?.lignes) ? mouvements.lignes : []

  const articleOptions =
    entiteType === 'produit'
      ? produits.map((produit) => ({
          value: produit.id,
          label: produit.designation,
          description: produit.nomencla,
        }))
      : matieres.map((matiere) => ({
          value: matiere.id,
          label: matiere.nom,
          description: matiere.reference,
        }))

  const motifOptions = (mouvements?.motifs ?? []).map((item) => ({
    value: item,
    label: item,
  }))

  const totalSorties = lignes.reduce((sum, row) => sum + row.sorties, 0)
  const totalFabrication = lignes.reduce((sum, row) => sum + row.entree_fabrication, 0)
  const totalAutresEntrees = lignes.reduce((sum, row) => sum + row.autres_entrees, 0)
  const totalRetours = lignes.reduce((sum, row) => sum + row.retours, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_minmax(260px,1fr)_260px]">
        <Select
          label="Type"
          value={entiteType}
          onChange={(e) => onEntiteTypeChange(e.target.value as 'produit' | 'matiere')}
          options={[
            { value: 'produit', label: 'Produit' },
            { value: 'matiere', label: 'Matière' },
          ]}
        />

        <SearchableSelect
          label={entiteType === 'produit' ? 'Produit' : 'Matière'}
          value={entiteId}
          options={articleOptions}
          placeholder={entiteType === 'produit' ? 'Tous les produits' : 'Toutes les matières'}
          searchPlaceholder="Rechercher..."
          noOptionsMessage="Aucun article trouvé."
          onValueChange={(value) => onEntiteIdChange(value ? Number(value) : null)}
        />

        <SearchableSelect
          label="Motif"
          value={motif || null}
          options={motifOptions}
          placeholder="Tous les motifs"
          searchPlaceholder="Rechercher un motif..."
          noOptionsMessage="Aucun motif trouvé."
          onValueChange={(value) => onMotifChange(value)}
        />
      </div>

      <SummaryGrid>
        <StatCard
          label="Sorties"
          value={totalSorties}
          icon={<ArrowDown className="h-5 w-5" />}
          accent={totalSorties > 0 ? 'danger' : 'primary'}
        />
        <StatCard
          label="Entrée fabrication"
          value={totalFabrication}
          icon={<Factory className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Autres entrées"
          value={totalAutresEntrees}
          icon={<ArrowUp className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Retours"
          value={totalRetours}
          icon={<RotateCcw className="h-5 w-5" />}
          accent="warning"
        />
      </SummaryGrid>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Journal des mouvements</h2>
            <p className="text-xs text-steel-500">
              Entrées, sorties, retours et stock calculé à la date du mouvement.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {lignes.length === 0 ? (
            <p className="py-10 text-center text-sm text-steel-400">
              Aucun mouvement trouvé pour ces filtres.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Réf.</th>
                    <th className="px-3 py-2">Désignation</th>
                    <th className="px-3 py-2">Classement</th>
                    <th className="px-3 py-2 text-right">Sorties</th>
                    <th className="px-3 py-2 text-right">Entrée fabrication</th>
                    <th className="px-3 py-2 text-right">Autres entrées</th>
                    <th className="px-3 py-2 text-right">Retours</th>
                    <th className="px-3 py-2 text-right">Stock à jour</th>
                    <th className="px-3 py-2">Motif</th>
                    <th className="px-3 py-2">Client / fournisseur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {lignes.map((row: ReportMouvementRow, index) => (
                    <tr key={`${row.date_mouvement}-${row.reference}-${row.motif}-${index}`}>
                      <td className="px-3 py-2 text-steel-600">{formatDate(row.date_mouvement)}</td>
                      <td className="px-3 py-2 font-medium text-steel-900">{row.reference ?? '—'}</td>
                      <td className="px-3 py-2 text-steel-700">{row.designation ?? '—'}</td>
                      <td className="px-3 py-2 text-steel-600">{row.classement ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-red-600">{formatQty(row.sorties)}</td>
                      <td className="px-3 py-2 text-right text-emerald-600">{formatQty(row.entree_fabrication)}</td>
                      <td className="px-3 py-2 text-right text-steel-700">{formatQty(row.autres_entrees)}</td>
                      <td className="px-3 py-2 text-right text-amber-600">{formatQty(row.retours)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-steel-900">{formatQty(row.stock_a_jour)}</td>
                      <td className="px-3 py-2 text-steel-600">{row.motif ?? '—'}</td>
                      <td className="px-3 py-2 text-steel-600">{row.tiers ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function FinanceReport({ data }: { data: Awaited<ReturnType<typeof useReports>>['data'] }) {
  const finance = data?.finance

  return (
    <div className="space-y-4">
      <SummaryGrid>
        <StatCard label="Chiffre d’affaires" value={finance?.chiffre_affaires ?? 0} isMoney icon={<Receipt className="h-5 w-5" />} accent="success" />
        <StatCard label="Factures émises" value={finance?.factures_emises ?? 0} icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="Factures en attente" value={finance?.factures_en_attente ?? 0} icon={<Receipt className="h-5 w-5" />} accent="warning" />
        <StatCard label="Factures en retard" value={finance?.factures_en_retard ?? 0} icon={<AlertTriangle className="h-5 w-5" />} accent={(finance?.factures_en_retard ?? 0) > 0 ? 'danger' : 'success'} />
      </SummaryGrid>

      <ItemsCard title="Clients débiteurs" items={finance?.clients_debiteurs ?? []} mode="debt" />
    </div>
  )
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

function ItemsCard({
  title,
  items,
  mode,
}: {
  title: string
  items: ReportItem[]
  mode: 'money' | 'qty' | 'debt' | 'progress'
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-steel-900">{title}</h2>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-steel-400">Aucune donnée disponible.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="rounded-md border border-surface-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-steel-900">{item.libelle}</p>
                    {item.reference && <p className="truncate text-xs text-steel-500">{item.reference}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-steel-700">
                    {mode === 'money' && formatMGA(item.total ?? 0)}
                    {mode === 'debt' && formatMGA(item.reste ?? 0)}
                    {mode === 'qty' && formatQty(item.quantite ?? 0)}
                    {mode === 'progress' && `${(item.taux ?? 0).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function StockItemsCard({ title, items }: { title: string; items: ReportStockItem[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-steel-900">{title}</h2>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-steel-400">Aucune alerte stock.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-md border border-surface-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-steel-900">{item.libelle}</p>
                    <p className="truncate text-xs text-steel-500">
                      {item.reference ?? '—'} {item.classement ? `- ${item.classement}` : ''}
                    </p>
                  </div>
                  <Badge variant="danger" dot>
                    {formatQty(item.stock_total)} / {formatQty(item.seuil)}
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
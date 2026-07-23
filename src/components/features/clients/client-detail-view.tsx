'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  PackageCheck,
  Receipt,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useClient, useClientHistorique } from '@/lib/hooks/use-commercial-details'
import { formatDate, formatMGA } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ClientDetailViewProps {
  clientId: number
}

type TabKey = 'commandes' | 'ventes' | 'livraisons' | 'factures'

function statutLabel(statut: unknown): string {
  if (!statut) return '—'
  if (typeof statut === 'string') return statut
  if (typeof statut === 'object' && 'libelle' in statut) {
    return String((statut as { libelle?: unknown }).libelle ?? '—')
  }
  if (typeof statut === 'object' && 'valeur' in statut) {
    return String((statut as { valeur?: unknown }).valeur ?? '—')
  }
  return '—'
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const currentYear = new Date().getFullYear()
  const [annee, setAnnee] = useState(currentYear)
  const [tab, setTab] = useState<TabKey>('commandes')
  const router = useRouter()

  const { data: client, isLoading: loadingClient } = useClient(clientId)
  const { data: historique, isLoading: loadingHistorique } = useClientHistorique(clientId, annee)

  const commandes = useMemo(
    () => (Array.isArray(historique?.commandes) ? historique.commandes : []),
    [historique],
  )
  const ventesDirectes = useMemo(
    () => (Array.isArray(historique?.ventes_directes) ? historique.ventes_directes : []),
    [historique],
  )
  const livraisons = useMemo(
    () => (Array.isArray(historique?.livraisons) ? historique.livraisons : []),
    [historique],
  )
  const factures = useMemo(
    () => (Array.isArray(historique?.factures) ? historique.factures : []),
    [historique],
  )

  // Progression des paiements (payé / facturé) pour un aperçu financier immédiat.
  const totalFacture = historique?.total_facture ?? 0
  const totalPaye = historique?.total_paye ?? 0
  const resteAPayer = historique?.reste_a_payer ?? 0
  const pctPaye = totalFacture > 0 ? Math.min(100, Math.round((totalPaye / totalFacture) * 100)) : 0

  const tabs = useMemo(
    () =>
      [
        { key: 'commandes', label: 'Commandes', icon: ShoppingCart, count: commandes.length },
        { key: 'ventes', label: 'Ventes directes', icon: Receipt, count: ventesDirectes.length },
        { key: 'livraisons', label: 'Livraisons', icon: Truck, count: livraisons.length },
        { key: 'factures', label: 'Factures', icon: FileText, count: factures.length },
      ] as const,
    [commandes.length, ventesDirectes.length, livraisons.length, factures.length],
  )

  if (!loadingClient && !client) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Client introuvable"
          subtitle="La fiche demandée n’existe pas."
          actions={
            <Link href="/clients" className="text-sm font-medium text-primary-700">
              Retour aux clients
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={client?.nom ?? 'Client'}
        subtitle={client?.reference ?? 'Historique commercial et financier'}
        actions={
          <Button
              onClick={() => router.back()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <h2 className="text-sm font-semibold text-steel-900">Informations</h2>
              <p className="text-xs text-steel-500">Coordonnées et références</p>
            </div>
          </CardHeader>
          <CardBody>
            {loadingClient ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <Info label="Référence" value={client?.reference} />
                <Info label="Contact" value={client?.contact} />
                <Info label="Email" value={client?.email} />
                <Info label="Adresse" value={client?.adresse} />
                <Info label="NIF" value={client?.NIF} />
                <Info label="STAT" value={client?.STAT} />
                <div className="pt-2">
                  <Badge variant={client?.actif ? 'success' : 'muted'} dot>
                    {client?.actif ? 'Actif' : 'Archivé'}
                  </Badge>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {/* Sélecteur d'année simplifié : navigation par flèches + saisie directe. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-steel-900">Exercice {annee}</p>
              <p className="text-xs text-steel-500">Résumé et historique de l’année</p>
            </div>
            <div className="flex items-center gap-2">
              <YearStepButton
                label="Année précédente"
                onClick={() => setAnnee((y) => y - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </YearStepButton>
              <Input
                className="w-24 text-center"
                type="number"
                aria-label="Année"
                value={annee}
                onChange={(event) => setAnnee(Number(event.target.value) || currentYear)}
              />
              <YearStepButton
                label="Année suivante"
                disabled={annee >= currentYear}
                onClick={() => setAnnee((y) => Math.min(currentYear, y + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </YearStepButton>
              {annee !== currentYear && (
                <button
                  type="button"
                  onClick={() => setAnnee(currentYear)}
                  className="h-9 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
                >
                  Aujourd’hui
                </button>
              )}
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              label="CA annuel"
              value={formatMGA(historique?.ca_annuel ?? 0)}
              icon={<ShoppingCart className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Facturé"
              value={formatMGA(totalFacture)}
              icon={<Receipt className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Payé"
              value={formatMGA(totalPaye)}
              icon={<PackageCheck className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Reste à payer"
              value={formatMGA(resteAPayer)}
              icon={<FileText className="h-5 w-5" />}
              accent={resteAPayer > 0 ? 'warning' : 'success'}
            />
          </section>

          {/* Barre de progression des paiements : lecture financière immédiate. */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-steel-700">Paiements encaissés</span>
                <span className="font-semibold text-steel-900">{pctPaye}%</span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
                role="progressbar"
                aria-valuenow={pctPaye}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full ${resteAPayer > 0 ? 'bg-warning-500' : 'bg-success-500'}`}
                  style={{ width: `${pctPaye}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-steel-500">
                {formatMGA(totalPaye)} encaissés sur {formatMGA(totalFacture)} facturés
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Un seul bloc d'historique avec onglets : moins de défilement, tout reste accessible. */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-1">
            {tabs.map(({ key, label, icon: Icon, count }) => {
              const active = tab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-steel-600 hover:bg-surface-subtle'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span
                    className={`rounded-full px-1.5 text-xs font-semibold ${
                      active ? 'bg-primary-100 text-primary-700' : 'bg-surface-subtle text-steel-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardBody>
          {loadingHistorique ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {tab === 'commandes' && (
                <HistoryList empty="Aucune commande sur cette année." isEmpty={commandes.length === 0}>
                  {commandes.map((commande) => (
                    <HistoryRow
                      key={`commande-${commande.id}`}
                      href={`/commandes/${commande.id}`}
                      title={commande.numero}
                      subtitle={`${formatDate(commande.date)} • ${commande.location ?? '—'}`}
                      badge={statutLabel(commande.statut)}
                      amount={commande.total}
                    />
                  ))}
                </HistoryList>
              )}

              {tab === 'ventes' && (
                <HistoryList empty="Aucune vente directe sur cette année." isEmpty={ventesDirectes.length === 0}>
                  {ventesDirectes.map((vente) => (
                    <HistoryRow
                      key={`vente-${vente.id}`}
                      href={`/ventes-directes/${vente.id}`}
                      title={vente.numero}
                      subtitle={`${formatDate(vente.date)} • ${vente.location ?? '—'}`}
                      badge={statutLabel(vente.statut)}
                      amount={vente.total}
                    />
                  ))}
                </HistoryList>
              )}

              {tab === 'livraisons' && (
                <HistoryList empty="Aucune livraison sur cette année." isEmpty={livraisons.length === 0}>
                  {livraisons.map((livraison) => (
                    <HistoryRow
                      key={`livraison-${livraison.id}`}
                      href={`/livraisons/${livraison.id}`}
                      title={livraison.numero}
                      subtitle={`${formatDate(livraison.date_livraison)} • ${livraison.source_type}`}
                      badge={livraison.est_facturee ? 'Facturée' : livraison.statut}
                    />
                  ))}
                </HistoryList>
              )}

              {tab === 'factures' && (
                <HistoryList empty="Aucune facture sur cette année." isEmpty={factures.length === 0}>
                  {factures.map((facture) => (
                    <HistoryRow
                      key={`facture-${facture.id}`}
                      href={`/factures/${facture.id}`}
                      title={facture.numero}
                      subtitle={`${formatDate(facture.date_facture)} • payé ${formatMGA(facture.montant_paye)}`}
                      badge={statutLabel(facture.statut)}
                      amount={facture.montant_total}
                    />
                  ))}
                </HistoryList>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function YearStepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-border bg-white text-steel-700 hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-0.5 font-medium text-steel-800">{value || '—'}</p>
    </div>
  )
}

function HistoryList({
  empty,
  isEmpty,
  children,
}: {
  empty: string
  isEmpty: boolean
  children: React.ReactNode
}) {
  if (isEmpty) {
    return <p className="py-6 text-center text-sm text-steel-500">{empty}</p>
  }
  return <div className="divide-y divide-surface-border">{children}</div>
}

function HistoryRow({
  href,
  title,
  subtitle,
  badge,
  amount,
}: {
  href: string
  title: string
  subtitle: string
  badge: string
  amount?: number
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 py-3 hover:bg-surface-subtle sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold text-steel-900">{title}</p>
        <p className="text-xs text-steel-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="info">{badge}</Badge>
        {amount !== undefined && (
          <span className="min-w-32 text-right text-sm font-semibold text-steel-900">
            {formatMGA(amount)}
          </span>
        )}
      </div>
    </Link>
  )
}

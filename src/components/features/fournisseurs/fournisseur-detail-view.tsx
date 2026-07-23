'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, FileText, ShoppingBasket } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useFournisseur, useFournisseurHistorique } from '@/lib/hooks/use-commercial-details'
import { formatDate, formatMGA, formatQty } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface FournisseurDetailViewProps {
  fournisseurId: number
}

export function FournisseurDetailView({ fournisseurId }: FournisseurDetailViewProps) {
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const { data: fournisseur, isLoading: loadingFournisseur } = useFournisseur(fournisseurId)
  const { data: historique, isLoading: loadingHistorique } = useFournisseurHistorique(fournisseurId, annee)
  const router = useRouter()
  
  const achats = useMemo(
    () => (Array.isArray(historique?.achats) ? historique.achats : []),
    [historique],
  )

  if (!loadingFournisseur && !fournisseur) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Fournisseur introuvable"
          subtitle="La fiche demandée n’existe pas."
          actions={
            <Link href="/fournisseurs" className="text-sm font-medium text-primary-700">
              Retour aux fournisseurs
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={fournisseur?.nom ?? 'Fournisseur'}
        subtitle={fournisseur?.reference ?? 'Historique achats et réceptions'}
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
            {loadingFournisseur ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <Info label="Référence" value={fournisseur?.reference} />
                <Info label="Contact" value={fournisseur?.contact} />
                <Info label="Email" value={fournisseur?.email} />
                <Info label="Adresse" value={fournisseur?.adresse} />
                <Info label="NIF" value={fournisseur?.NIF} />
                <div className="pt-2">
                  <Badge variant={fournisseur?.actif ? 'success' : 'muted'} dot>
                    {fournisseur?.actif ? 'Actif' : 'Archivé'}
                  </Badge>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Input
              className="w-36"
              label="Année"
              type="number"
              value={annee}
              onChange={(event) => setAnnee(Number(event.target.value) || new Date().getFullYear())}
            />
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              label="Total achats"
              value={formatMGA(historique?.total_achats ?? 0)}
              icon={<ShoppingBasket className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="BR validés"
              value={formatMGA(historique?.total_valide ?? 0)}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Brouillons"
              value={formatMGA(historique?.total_brouillon ?? 0)}
              icon={<FileText className="h-5 w-5" />}
              accent={(historique?.total_brouillon ?? 0) > 0 ? 'warning' : 'success'}
            />
          </section>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Historique des achats</h2>
            <p className="text-xs text-steel-500">
              Bons de réception et lignes matières pour l’année sélectionnée.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {loadingHistorique ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : achats.length === 0 ? (
            <p className="py-8 text-center text-sm text-steel-500">
              Aucun achat enregistré pour cette année.
            </p>
          ) : (
            <div className="space-y-3">
              {achats.map((achat) => (
                <div
                  key={achat.id}
                  className="rounded-md border border-surface-border bg-white"
                >
                  <Link
                    href={`/achats/${achat.id}`}
                    className="flex flex-col gap-2 border-b border-surface-border px-4 py-3 hover:bg-surface-subtle sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-steel-900">{achat.numero}</p>
                      <p className="text-xs text-steel-500">
                        {formatDate(achat.date)} • {achat.location ?? '—'} • {achat.lignes_count} ligne(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={achat.statut === 'valide' ? 'success' : 'warning'} dot>
                        {achat.statut}
                      </Badge>
                      <span className="min-w-32 text-right text-sm font-semibold text-steel-900">
                        {formatMGA(achat.total)}
                      </span>
                    </div>
                  </Link>

                  {achat.lignes.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-surface-border bg-surface-subtle text-left uppercase text-steel-400">
                            <th className="px-4 py-2">Matière</th>
                            <th className="px-4 py-2">Quantité</th>
                            <th className="px-4 py-2">PU</th>
                            <th className="px-4 py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                          {achat.lignes.map((ligne) => (
                            <tr key={ligne.id}>
                              <td className="px-4 py-2">
                                <span className="font-medium text-steel-800">
                                  {ligne.matiere?.nom ?? '—'}
                                </span>
                                <span className="ml-2 text-steel-400">
                                  {ligne.matiere?.reference ?? ''}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-steel-600">
                                {formatQty(ligne.quantite)}
                              </td>
                              <td className="px-4 py-2 text-steel-600">
                                {formatMGA(ligne.prix_unitaire)}
                              </td>
                              <td className="px-4 py-2 font-medium text-steel-900">
                                {formatMGA(ligne.total_ligne)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
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
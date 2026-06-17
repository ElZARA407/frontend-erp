// src/components/features/clients/client-detail-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useClient } from '@/lib/hooks/use-clients'
import { useClientEncours, useClientHistorique } from '@/lib/hooks/use-commercial-details'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatMGA } from '@/lib/utils'
import { ArrowLeft, Building2, Mail, Phone, Receipt, UserRound, Wallet } from 'lucide-react'

interface ClientDetailViewProps {
  clientId: number
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const [annee, setAnnee] = useState(String(new Date().getFullYear()))

  const { data: client, isLoading: loadingClient } = useClient(clientId)
  const { data: encours, isLoading: loadingEncours } = useClientEncours(clientId)
  const { data: historique, isLoading: loadingHistorique } = useClientHistorique(clientId, annee)

  const factures = Array.isArray(encours?.factures) ? encours.factures : []

  if (!loadingClient && !client) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Client #${clientId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/clients"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Client introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={client?.nom ?? `Client #${clientId}`}
        subtitle={client ? `Référence ${client.reference}` : 'Chargement...'}
        actions={
          <Link
            href="/clients"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loadingClient ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Encours total"
              value={encours?.encours_total ?? 0}
              isMoney
              icon={<Wallet className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Commandes annuelles"
              value={historique?.nb_commandes ?? 0}
              icon={<Receipt className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Factures annuelles"
              value={historique?.nb_factures ?? 0}
              icon={<Receipt className="h-5 w-5" />}
              accent="success"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations client</h2>
            <p className="text-xs text-steel-500">
              Données métiers renvoyées par le backend Laravel.
            </p>
          </div>
          <Badge variant={client?.actif ? 'success' : 'muted'} dot>
            {client?.actif ? 'Actif' : 'Inactif'}
          </Badge>
        </CardHeader>

        <CardBody>
          {loadingClient ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : client ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence</p>
                <p className="mt-1 font-semibold text-steel-900">{client.reference}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(client.created_at)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">NIF / STAT</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {client.NIF ?? '—'} / {client.STAT ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Facturation</p>
                <p className="mt-1 font-semibold text-steel-900">{client.facturation ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Adresse</p>
                <p className="mt-1 font-semibold text-steel-900">{client.adresse}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Contact</p>
                <p className="mt-1 font-semibold text-steel-900">{client.contact}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Email</p>
                <p className="mt-1 font-semibold text-steel-900">{client.email ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Interlocuteur</p>
                <p className="mt-1 font-semibold text-steel-900">{client.interlocutaire ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Historique financier</h2>
            <p className="text-xs text-steel-500">
              Sélectionne une année pour consulter le chiffre d’affaires et les volumes.
            </p>
          </div>
          <Input
            className="w-36"
            label="Année"
            type="number"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
          />
        </CardHeader>

        <CardBody>
          {loadingHistorique ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">CA annuel</p>
                <p className="mt-1 text-xl font-semibold text-steel-900">
                  {formatMGA(historique?.ca_annuel ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Commandes</p>
                <p className="mt-1 text-xl font-semibold text-steel-900">{historique?.nb_commandes ?? 0}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Factures</p>
                <p className="mt-1 text-xl font-semibold text-steel-900">{historique?.nb_factures ?? 0}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Encours impayé</h2>
            <p className="text-xs text-steel-500">
              Factures encore ouvertes ou partiellement réglées.
            </p>
          </div>
          <Badge variant="warning" dot>
            {formatMGA(encours?.encours_total ?? 0)}
          </Badge>
        </CardHeader>

        <CardBody>
          {loadingEncours ? (
            <TableSkeleton rows={4} cols={5} />
          ) : factures.length === 0 ? (
            <div className="py-10 text-center text-steel-500">
              Aucune facture en encours.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Date', 'Total', 'Échéance', 'Retard'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {factures.map((facture) => (
                  <tr key={facture.numero} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-steel-900">{facture.numero}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(facture.date)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatMGA(facture.total)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(facture.echeance)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={facture.jours_retard > 0 ? 'danger' : 'success'} dot>
                        {facture.jours_retard > 0 ? `${facture.jours_retard} jour(s)` : 'À jour'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
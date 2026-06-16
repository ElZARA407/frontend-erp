// src/components/features/contrats/contrats-view.tsx
'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatMGA } from '@/lib/utils'
import { useClients } from '@/lib/hooks/use-clients'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { useContrats, useDeleteContrat, useToggleContratActif } from '@/lib/hooks/use-lot3'
import type { Contrat } from '@/lib/lot3.types'
import { ContratForm } from './contrat-form'
import { Plus, PencilLine, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'

export function ContratsView() {
  const [page, setPage] = useState(1)
  const [clientId, setClientId] = useState<string>('')
  const [mois, setMois] = useState('')
  const [actif, setActif] = useState<string>('')

  const [showDialog, setShowDialog] = useState(false)

  const { data: clientsPage } = useClients({ per_page: 100 })
  const { data: productsPage } = useProducts({ per_page: 100 })
  const { data: contratsPage, isLoading } = useContrats({
    client_id: clientId ? Number(clientId) : undefined,
    mois: mois || undefined,
    actif: actif === '' ? undefined : actif === 'true',
    page,
    per_page: 20,
  })

  const deleteContrat = useDeleteContrat()
  const toggleContratActif = useToggleContratActif()

  const clients = clientsPage?.data?.data ?? []
  const produits = productsPage?.data?.data ?? []
  const contrats = Array.isArray(contratsPage?.data?.data) ? contratsPage.data.data : []
  const pagination = contratsPage?.data

  const classementOptions = useMemo(
    () =>
      produits.flatMap((produit) =>
        (produit.classements ?? []).map((classement) => ({
          value: classement.id,
          label: `${produit.nomencla} - ${classement.qualite_libelle}`,
        }))
      ),
    [produits]
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contrats"
        subtitle="Gestion des contrats clients"
        actions={
          <Button
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowDialog(true)}
          >
            Nouveau contrat
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Select
          className="w-full md:w-64"
          label="Client"
          placeholder="Tous"
          options={clients.map((client) => ({
            value: client.id,
            label: client.nom,
          }))}
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value)
            setPage(1)
          }}
        />
        <Input
          className="w-full md:w-44"
          label="Mois"
          type="month"
          value={mois}
          onChange={(e) => {
            setMois(e.target.value)
            setPage(1)
          }}
        />
        <Select
          className="w-full md:w-44"
          label="Statut"
          placeholder="Tous"
          options={[
            { value: 'true', label: 'Actifs' },
            { value: 'false', label: 'Inactifs' },
          ]}
          value={actif}
          onChange={(e) => {
            setActif(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                    <th className="px-4 py-3">Numéro</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Mois</th>
                    <th className="px-4 py-3">Total contractuel</th>
                    <th className="px-4 py-3">Taux d’exécution</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Créé le</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {contrats.map((contrat: Contrat) => (
                    <tr key={contrat.id} className="hover:bg-surface-subtle/70">
                      <td className="px-4 py-3 font-medium text-steel-900">{contrat.numero}</td>
                      <td className="px-4 py-3 text-steel-600">{contrat.client?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">{contrat.mois}</td>
                      <td className="px-4 py-3 text-steel-600">{formatMGA(contrat.total_contractuel)}</td>
                      <td className="px-4 py-3 text-steel-600">{(contrat.taux_execution ?? 0).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={contrat.actif ? 'success' : 'muted'} dot>
                          {contrat.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-steel-500">
                        {formatDateTime(contrat.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={contrat.actif ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            onClick={() =>
                              toggleContratActif.mutate({
                                id: contrat.id,
                                actif: !contrat.actif,
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => deleteContrat.mutate(contrat.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                currentPage={pagination.current_page ?? page}
                lastPage={pagination.last_page ?? 1}
                total={pagination.total ?? 0}
                from={pagination.from ?? 0}
                to={pagination.to ?? 0}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Nouveau contrat"
        size="xl"
      >
        <ContratForm
          clients={clients}
          produits={produits}
          onSuccess={() => setShowDialog(false)}
        />
      </Dialog>
    </div>
  )
}
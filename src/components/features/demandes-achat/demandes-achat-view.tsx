// src/components/features/demandes-achat/demandes-achat-view.tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, getStatutColor } from '@/lib/utils'
import { useMatieres, useProducts } from '@/lib/hooks/use-catalogue'
import {
  useApproveDemandeAchat,
  useDeleteDemandeAchat,
  useDemandesAchat,
  useRejectDemandeAchat,
  useSubmitDemandeAchat,
} from '@/lib/hooks/use-lot3'
import type { DemandeAchat } from '@/lib/lot3.types'
import { DemandeAchatForm } from './demande-achat-form'
import { CheckCircle, Plus, Send, SquarePen, Trash2, XCircle } from 'lucide-react'

export function DemandesAchatView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  const { data: matieresPage } = useMatieres({ per_page: 100 })
  const { data: produitsPage } = useProducts({ per_page: 100 })
  const { data: demandesPage, isLoading } = useDemandesAchat({
    statut: statut || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const deleteDemande = useDeleteDemandeAchat()
  const submitDemande = useSubmitDemandeAchat()
  const approveDemande = useApproveDemandeAchat()
  const rejectDemande = useRejectDemandeAchat()

  const matieres = matieresPage?.data?.data ?? []
  const produits = produitsPage?.data?.data ?? []
  const demandes = Array.isArray(demandesPage?.data?.data) ? demandesPage.data.data : []
  const pagination = demandesPage?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Demandes d’achat"
        subtitle="Suivi des demandes d’achat"
        actions={
          <Button
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowDialog(true)}
          >
            Nouvelle demande
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Select
          className="w-full md:w-52"
          label="Statut"
          placeholder="Tous"
          options={[
            { value: 'brouillon', label: 'Brouillon' },
            { value: 'soumise', label: 'Soumise' },
            { value: 'approuvee', label: 'Approuvée' },
            { value: 'rejetee', label: 'Rejetée' },
          ]}
          value={statut}
          onChange={(e) => {
            setStatut(e.target.value)
            setPage(1)
          }}
        />
        <Input
          className="w-full md:w-44"
          label="Date début"
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setDateDebut(e.target.value)
            setPage(1)
          }}
        />
        <Input
          className="w-full md:w-44"
          label="Date fin"
          type="date"
          value={dateFin}
          onChange={(e) => {
            setDateFin(e.target.value)
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
                    <th className="px-4 py-3">Demandeur</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Lignes</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Observations</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {demandes.map((demande: DemandeAchat) => (
                    <tr key={demande.id} className="hover:bg-surface-subtle/70">
                      <td className="px-4 py-3 font-medium text-steel-900">{demande.numero}</td>
                      <td className="px-4 py-3 text-steel-600">{demande.demandeur?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">{formatDateTime(demande.date_demande)}</td>
                      <td className="px-4 py-3 text-steel-600">{demande.lignes?.length ?? 0}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatutColor(demande.statut)} dot>
                          {demande.statut}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {demande.observations ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {demande.statut === 'brouillon' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Send className="h-3.5 w-3.5" />}
                                onClick={() => submitDemande.mutate(demande.id)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => deleteDemande.mutate(demande.id)}
                              />
                            </>
                          )}

                          {demande.statut === 'soumise' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<CheckCircle className="h-3.5 w-3.5" />}
                                onClick={() => approveDemande.mutate(demande.id)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<XCircle className="h-3.5 w-3.5" />}
                                onClick={() => rejectDemande.mutate(demande.id)}
                              />
                            </>
                          )}

                          {(demande.statut === 'brouillon' || demande.statut === 'soumise') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<SquarePen className="h-3.5 w-3.5" />}
                            />
                          )}
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
        title="Nouvelle demande d’achat"
        size="xl"
      >
        <DemandeAchatForm
          matieres={matieres}
          produits={produits}
          onSuccess={() => setShowDialog(false)}
        />
      </Dialog>
    </div>
  )
}
// src/components/features/fournisseurs/fournisseurs-view.tsx
'use client'

import {  useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'
import { useDeleteFournisseur, useFournisseurs } from '@/lib/hooks/use-lot3'
import type { Fournisseur } from '@/lib/lot3.types'
import { FournisseurForm } from './fournisseur-form'
import { Plus, PencilLine, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FournisseursView() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actif, setActif] = useState<string>('')
  const router = useRouter()

  const [showDialog, setShowDialog] = useState(false)
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null)

  const { data: fournisseursPage, isLoading } = useFournisseurs({
    search: search || undefined,
    actif: actif === '' ? undefined : actif === 'true',
    page,
    per_page: 20,
  })

  const deleteFournisseur = useDeleteFournisseur()

  const fournisseurs = Array.isArray(fournisseursPage?.data?.data)
    ? fournisseursPage.data.data
    : []

  const pagination = fournisseursPage?.data

  const openCreate = () => {
    setSelectedFournisseur(null)
    setShowDialog(true)
  }

  const openEdit = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur)
    setShowDialog(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fournisseurs"
        subtitle="Gestion des fournisseurs"
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
            Nouveau fournisseur
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          className="w-full md:w-72"
          label="Recherche"
          placeholder="Nom ou référence"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
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
                    <th className="px-4 py-3">Référence</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Adresse</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Créé le</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {fournisseurs.map((fournisseur) => (
                    <tr
                      key={fournisseur.id}
                      className="cursor-pointer hover:bg-surface-subtle/70"
                      onClick={() => router.push(`/fournisseurs/${fournisseur.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-steel-900">{fournisseur.reference}</td>
                      <td className="px-4 py-3 text-steel-600">{fournisseur.nom}</td>
                      <td className="px-4 py-3 text-steel-600">{fournisseur.contact}</td>
                      <td className="px-4 py-3 text-steel-600">{fournisseur.adresse}</td>
                      <td className="px-4 py-3">
                        <Badge variant={fournisseur.actif ? 'success' : 'muted'} dot>
                          {fournisseur.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-steel-500">
                        {formatDateTime(fournisseur.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<PencilLine className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              openEdit(fournisseur)
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteFournisseur.mutate(fournisseur.id)
                            }}
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
        title={selectedFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        size="lg"
      >
        <FournisseurForm
          key={selectedFournisseur?.id ?? 'fournisseur-new'}
          defaultValues={selectedFournisseur ?? undefined}
          onSuccess={() => setShowDialog(false)}
        />
      </Dialog>
    </div>
  )
}
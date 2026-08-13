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
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { Upload } from 'lucide-react'
import { ExcelImportDialog } from '@/components/ui/excel-import-dialog'
import { useImportFournisseurs } from '@/lib/hooks/use-lot3'

const PAGE_SIZE = 10

export function FournisseursView() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actif, setActif] = useState<string>('')
  const router = useRouter()
  const [estDivers, setEstDivers] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const importFournisseurs = useImportFournisseurs()
  

  const [showDialog, setShowDialog] = useState(false)
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null)

  const { data: fournisseursPage, isLoading } = useFournisseurs({
    search: search || undefined,
    actif: actif === '' ? undefined : actif === 'true',
    est_divers: estDivers === '' ? undefined : estDivers === 'true',
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: PAGE_SIZE,
    sort_by: sortBy,
    sort_dir: sortDir,
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Upload className="h-3.5 w-3.5" />}
              loading={importFournisseurs.isPending}
              onClick={() => setShowImportDialog(true)}
            >
              Importer Excel
            </Button>
            <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
              Nouveau fournisseur
            </Button>
          </div>
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

        <Select
          label="Type Fournisseur  "
          placeholder="Tous"
          options={[
            { value: 'false', label: 'Fournisseurs normaux' },
            { value: 'true', label: 'Fournisseur divers' },
          ]}
          value={estDivers}
          onChange={(e) => {
            setEstDivers(e.target.value)
            setPage(1)
          }}
        />

        <DateRangeFilter
          className="w-full md:w-[28rem]"
          dateDebut={dateDebut}
          dateFin={dateFin}
          onDateDebutChange={(value) => {
            setDateDebut(value)
            setPage(1)
          }}
          onDateFinChange={(value) => {
            setDateFin(value)
            setPage(1)
          }}
        />

        <SortControl
          sortBy={sortBy}
          sortDir={sortDir}
          options={[
            { value: 'date', label: 'Date création' },
            { value: 'nom', label: 'Nom fournisseur' },
          ]}
          onSortByChange={(value) => {
            setSortBy(value)
            setPage(1)
          }}
          onSortDirChange={(value) => {
            setSortDir(value)
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
                              setConfirmDeleteId(fournisseur.id)
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
      <ConfirmationDialog
  open={confirmDeleteId !== null}
  title="Archivage"
  description="Voulez vous vraiment archiver ce fournisseur ?"
  confirmLabel="Oui"
  cancelLabel="Non"
  variant="danger"
  loading={deleteFournisseur.isPending}
  onClose={() => setConfirmDeleteId(null)}
  onConfirm={() => {
    if (!confirmDeleteId) return
    deleteFournisseur.mutate(confirmDeleteId, {
      onSuccess: () => setConfirmDeleteId(null),
    })
  }}
/>

<ExcelImportDialog
  open={showImportDialog}
  onClose={() => setShowImportDialog(false)}
  title="Importer des fournisseurs"
  description="Importe les fournisseurs depuis une ou plusieurs feuilles Excel."
  templateFileName="fournisseurs.xlsx"
  defaultSheetNames={['fournisseurs']}
  loading={importFournisseurs.isPending}
  onImport={async (payload) => {
    await importFournisseurs.mutateAsync(payload)
    setShowImportDialog(false)
  }}
/>
    </div>
  )
}
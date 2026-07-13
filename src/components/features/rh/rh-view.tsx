// src/components/features/rh/rh-view.tsx
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
import {
  useDeleteEmploye,
  useDeletePoste,
  useEmployes,
  usePostes,
} from '@/lib/hooks/use-rh'
import type { RhEmploye, RhPoste } from '@/lib/rh.types'
import { EmployeForm } from './employe-form'
import { PosteForm } from './poste-form'
import {
  BriefcaseBusiness,
  Plus,
  PencilLine,
  Trash2,
  Users,
} from 'lucide-react'

type RhTab = 'postes' | 'employes'

export function RhView() {
  const [tab, setTab] = useState<RhTab>('postes')

  const [employeePage, setEmployeePage] = useState(1)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeePosteId, setEmployeePosteId] = useState<string>('')
  const [employeeActive, setEmployeeActive] = useState<string>('')

  const [showPosteDialog, setShowPosteDialog] = useState(false)
  const [showEmployeDialog, setShowEmployeDialog] = useState(false)

  const [selectedPoste, setSelectedPoste] = useState<RhPoste | null>(null)
  const [selectedEmploye, setSelectedEmploye] = useState<RhEmploye | null>(null)

  const { data: postes, isLoading: postesLoading } = usePostes()
  const { data: employesPage, isLoading: employesLoading } = useEmployes({
    search: employeeSearch || undefined,
    poste_id: employeePosteId ? Number(employeePosteId) : undefined,
    actif: employeeActive === '' ? undefined : employeeActive === 'true',
    page: employeePage,
    per_page: 20,
  })

  const deletePoste = useDeletePoste()
  const deleteEmploye = useDeleteEmploye()

  const postesList = useMemo(() => postes ?? [], [postes])
  const employes = employesPage?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ressources humaines"
        subtitle="Postes et employés"
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'postes', label: 'Postes', icon: BriefcaseBusiness },
          { key: 'employes', label: 'Employés', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            icon={<Icon className="h-3.5 w-3.5" />}
            onClick={() => setTab(key as RhTab)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'postes' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <Button
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setSelectedPoste(null)
                setShowPosteDialog(true)
              }}
            >
              Nouveau poste
            </Button>
          </div>

          <Card>
            {postesLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Taux horaire</th>
                      <th className="px-4 py-3">Salaire mensuel</th>
                      <th className="px-4 py-3">Coût journalier</th>
                      <th className="px-4 py-3">Employés</th>
                      <th className="px-4 py-3">Créé le</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {postesList.map((poste) => (
                      <tr key={poste.id} className="hover:bg-surface-subtle/70">
                        <td className="px-4 py-3 font-medium text-steel-900">{poste.nom}</td>
                        <td className="px-4 py-3 text-steel-600">{formatMGA(poste.taux_horaire)}/h</td>
                        <td className="px-4 py-3 text-steel-600">
                          {poste.salaire_mensuel ? formatMGA(poste.salaire_mensuel) : '—'}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {poste.cout_journalier ? formatMGA(poste.cout_journalier) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{poste.employes_count ?? 0}</Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-500">
                          {formatDateTime(poste.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<PencilLine className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setSelectedPoste(poste)
                                setShowPosteDialog(true)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => deletePoste.mutate(poste.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'employes' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-full md:w-72"
              label="Recherche"
              placeholder="Nom, prénom ou matricule"
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value)
                setEmployeePage(1)
              }}
            />
            <Select
              className="w-full md:w-56"
              label="Poste"
              placeholder="Tous"
              options={postesList.map((poste) => ({
                value: poste.id,
                label: poste.nom,
              }))}
              value={employeePosteId}
              onChange={(e) => {
                setEmployeePosteId(e.target.value)
                setEmployeePage(1)
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
              value={employeeActive}
              onChange={(e) => {
                setEmployeeActive(e.target.value)
                setEmployeePage(1)
              }}
            />
            <Button
              className="ml-auto"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setSelectedEmploye(null)
                setShowEmployeDialog(true)
              }}
            >
              Nouvel employé
            </Button>
          </div>

          <Card>
            {employesLoading ? (
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
                        <th className="px-4 py-3">Matricule</th>
                        <th className="px-4 py-3">Nom complet</th>
                        <th className="px-4 py-3">Poste</th>
                        <th className="px-4 py-3">Embauche</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Ancienneté</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                    {(Array.isArray(employes) ? employes : (employes as any)?.data || []).map((employe: RhEmploye) => (
                        <tr key={employe.id} className="hover:bg-surface-subtle/70">
                          <td className="px-4 py-3 font-medium text-steel-900">{employe.matricule}</td>
                          <td className="px-4 py-3 text-steel-600">{employe.nom_complet ?? `${employe.prenom} ${employe.nom}`}</td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{employe.poste?.nom ?? '—'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-500">
                            {formatDateTime(employe.date_embauche)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={employe.actif ? 'success' : 'muted'} dot>
                              {employe.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-steel-600">
                            {employe.anciennete ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<PencilLine className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  setSelectedEmploye(employe)
                                  setShowEmployeDialog(true)
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                onClick={() => deleteEmploye.mutate(employe.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            {employesPage && (
                <Pagination
                    currentPage={employeePage} // Uses your local state tracking variable for matieres
                    lastPage={(employesPage as any).last_page || 1}
                    total={(employesPage as any).total || 0}
                    from={(employesPage as any).from ?? 0}
                    to={(employesPage as any).to ?? 0}
                    onPageChange={setEmployeePage}
                />
                )}
              </>
            )}
          </Card>
        </div>
      )}

      <Dialog
        open={showPosteDialog}
        onClose={() => setShowPosteDialog(false)}
        title={selectedPoste ? 'Modifier le poste' : 'Nouveau poste'}
        size="md"
      >
        <PosteForm
          key={selectedPoste?.id ?? 'poste-new'}
          defaultValues={selectedPoste ?? undefined}
          onSuccess={() => setShowPosteDialog(false)}
        />
      </Dialog>

      <Dialog
        open={showEmployeDialog}
        onClose={() => setShowEmployeDialog(false)}
        title={selectedEmploye ? 'Modifier l’employé' : 'Nouvel employé'}
        size="lg"
      >
        <EmployeForm
          key={selectedEmploye?.id ?? 'employe-new'}
          postes={postesList}
          defaultValues={selectedEmploye ?? undefined}
          onSuccess={() => setShowEmployeDialog(false)}
        />
      </Dialog>
    </div>
  )
}
'use client'

import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useMachines } from '@/lib/hooks/use-production'
import { useMatieres } from '@/lib/hooks/use-catalogue'
import { useEmployes } from '@/lib/hooks/use-rh'
import { useCreateBtSession } from '@/lib/hooks/use-recyclage'
import type { BonTransformation } from '@/lib/recyclage.types'
import type { CatalogueMatiere } from '@/lib/catalogue.types'
import type { Machine } from '@/lib/types'
import type { RhEmploye } from '@/lib/rh.types'
import {
  btSessionSchema,
  type BtSessionSchema,
} from '@/lib/schemas/recyclage.schema'

interface BtSessionFormProps {
  bt: BonTransformation
  onSuccess?: () => void
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]

  if (value && typeof value === 'object') {
    const root = value as { data?: unknown }

    if (Array.isArray(root.data)) return root.data as T[]

    if (root.data && typeof root.data === 'object') {
      const nested = root.data as { data?: unknown }

      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }

  return []
}

function buildDefaultValues(bt: BonTransformation): BtSessionSchema {
  return {
    date_session: new Date().toISOString().slice(0, 10),
    machine_id: bt.machine_id ?? 0,
    sorties: [
      {
        quantite_utilisee: bt.quantite_entree ?? 0,
        quantite_restituee: 0,
      },
    ],
    entrees: [
      {
        matiere_id: 0,
        quantite: 0,
      },
    ],
    employes: [],
    evenements: [
      {
        type_evenement: 'broyage',
        heure_debut: '',
        heure_fin: '',
        description: '',
      },
    ],
  }
}

export function BtSessionForm({ bt, onSuccess }: BtSessionFormProps) {
  const { mutate: createSession, isPending } = useCreateBtSession()

  const { data: machinesData } = useMachines({ actif: true })
  const { data: matieresBroyeesPage } = useMatieres({ type: 'broyee', per_page: 200 })
  const { data: employesPage } = useEmployes({ actif: true, per_page: 200 })

  const machines = normalizeArray<Machine>(machinesData)
  const matieresBroyees = Array.isArray(matieresBroyeesPage?.data?.data)
    ? matieresBroyeesPage.data.data
    : []
  const employes = Array.isArray(employesPage?.data?.data) ? employesPage.data.data : []

  const machineOptions = useMemo(
    () => machines.map((machine) => ({ value: machine.id, label: machine.nom })),
    [machines]
  )

  const matiereOptions = useMemo(
    () =>
      matieresBroyees.map((matiere: CatalogueMatiere) => ({
        value: matiere.id,
        label: `${matiere.reference} - ${matiere.nom}`,
      })),
    [matieresBroyees]
  )

  const employeOptions = useMemo(
    () =>
      employes.map((employe: RhEmploye) => {
        const fullName = `${employe.prenom ?? ''} ${employe.nom ?? ''}`.trim()

        return {
          value: employe.id,
          label: employe.nom_complet?.trim() || fullName || `Employé #${employe.id}`,
        }
      }),
    [employes]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BtSessionSchema>({
    resolver: zodResolver(btSessionSchema) as unknown as Resolver<BtSessionSchema>,
    defaultValues: buildDefaultValues(bt),
  })

  const sortiesArray = useFieldArray({ control, name: 'sorties' })
  const entreesArray = useFieldArray({ control, name: 'entrees' })
  const employesArray = useFieldArray({ control, name: 'employes' })
  const evenementsArray = useFieldArray({ control, name: 'evenements' })

  useEffect(() => {
    reset(buildDefaultValues(bt))
  }, [bt, reset])

  const onSubmit = (payload: BtSessionSchema) => {
    createSession(
      {
        btId: bt.id,
        payload,
      },
      {
        onSuccess: () => {
          reset(buildDefaultValues(bt))
          onSuccess?.()
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Date session *"
              type="date"
              error={errors.date_session?.message}
              {...register('date_session')}
            />

            <Select
              label="Machine *"
              placeholder="Choisir une machine"
              options={machineOptions}
              error={errors.machine_id?.message}
              {...register('machine_id')}
            />
          </div>

          <div className="rounded-lg border border-surface-border bg-surface-subtle/40 p-4 text-sm text-steel-700">
            <p className="font-semibold text-steel-900">Matière brute du bon de transformation</p>
            <p className="mt-1">
              {bt.matiere_brute?.reference ?? '—'} - {bt.matiere_brute?.nom ?? '—'}
            </p>
            <p className="mt-1 text-xs text-steel-500">
              Quantité prévue : {bt.quantite_entree}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-steel-900">Sorties matière brute</h3>
              <p className="text-xs text-steel-500">
                La matière est automatiquement celle du bon. Seules les quantités changent.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                sortiesArray.append({
                  quantite_utilisee: 0,
                  quantite_restituee: 0,
                })
              }
            >
              Ajouter une sortie
            </Button>
          </div>

          <div className="space-y-3">
            {sortiesArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 lg:grid-cols-[1fr_180px_180px_40px]"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-steel-500">
                    Matière brute
                  </label>
                  <div className="flex h-10 items-center rounded-md border border-surface-border bg-surface-subtle px-3 text-sm font-medium text-steel-800">
                    {bt.matiere_brute?.reference ?? '—'} - {bt.matiere_brute?.nom ?? '—'}
                  </div>
                </div>

                <Input
                  label="Quantité utilisée *"
                  type="number"
                  step="0.001"
                  error={errors.sorties?.[index]?.quantite_utilisee?.message}
                  {...register(`sorties.${index}.quantite_utilisee` as const)}
                />

                <Input
                  label="Quantité restituée"
                  type="number"
                  step="0.001"
                  error={errors.sorties?.[index]?.quantite_restituee?.message}
                  {...register(`sorties.${index}.quantite_restituee` as const)}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => sortiesArray.remove(index)}
                    disabled={sortiesArray.fields.length === 1}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-steel-900">Entrées matière broyée</h3>
              <p className="text-xs text-steel-500">
                Ajoute les matières broyées obtenues pendant cette session.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                entreesArray.append({
                  matiere_id: 0,
                  quantite: 0,
                })
              }
            >
              Ajouter une entrée
            </Button>
          </div>

          <div className="space-y-3">
            {entreesArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-[1fr_180px_40px]"
              >
                <Select
                  label="Matière broyée *"
                  placeholder="Choisir la matière"
                  options={matiereOptions}
                  error={errors.entrees?.[index]?.matiere_id?.message}
                  {...register(`entrees.${index}.matiere_id` as const)}
                />

                <Input
                  label="Quantité produite *"
                  type="number"
                  step="0.001"
                  error={errors.entrees?.[index]?.quantite?.message}
                  {...register(`entrees.${index}.quantite` as const)}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => entreesArray.remove(index)}
                    disabled={entreesArray.fields.length === 1}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-steel-900">Employés</h3>
              <p className="text-xs text-steel-500">
                Saisie des participants à la session de transformation.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                employesArray.append({
                  employe_id: 0,
                  heures_brutes: 0,
                })
              }
            >
              Ajouter un employé
            </Button>
          </div>

          <div className="space-y-3">
            {employesArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-[1fr_180px_40px]"
              >
                <Select
                  label="Employé"
                  placeholder="Choisir un employé"
                  options={employeOptions}
                  error={errors.employes?.[index]?.employe_id?.message}
                  {...register(`employes.${index}.employe_id` as const)}
                />

                <Input
                  label="Heures brutes"
                  type="number"
                  step="0.01"
                  error={errors.employes?.[index]?.heures_brutes?.message}
                  {...register(`employes.${index}.heures_brutes` as const)}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => employesArray.remove(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-steel-900">Événements</h3>
              <p className="text-xs text-steel-500">
                Broyage, pause, panne ou autre événement de la session.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                evenementsArray.append({
                  type_evenement: 'broyage',
                  heure_debut: '',
                  heure_fin: '',
                  description: '',
                })
              }
            >
              Ajouter un événement
            </Button>
          </div>

          <div className="space-y-3">
            {evenementsArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-[180px_140px_140px_1fr_40px]"
              >
                <Select
                  label="Type"
                  options={[
                    { value: 'broyage', label: 'Broyage' },
                    { value: 'pause', label: 'Pause' },
                    { value: 'panne', label: 'Panne' },
                    { value: 'autre', label: 'Autre' },
                  ]}
                  error={errors.evenements?.[index]?.type_evenement?.message}
                  {...register(`evenements.${index}.type_evenement` as const)}
                />

                <Input
                  label="Début"
                  type="time"
                  error={errors.evenements?.[index]?.heure_debut?.message}
                  {...register(`evenements.${index}.heure_debut` as const)}
                />

                <Input
                  label="Fin"
                  type="time"
                  error={errors.evenements?.[index]?.heure_fin?.message}
                  {...register(`evenements.${index}.heure_fin` as const)}
                />

                <Input
                  label="Description"
                  placeholder="Remarque facultative"
                  error={errors.evenements?.[index]?.description?.message}
                  {...register(`evenements.${index}.description` as const)}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => evenementsArray.remove(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={isPending}>
          Créer la session
        </Button>
      </div>
    </form>
  )
}
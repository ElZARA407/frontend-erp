'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type Resolver,
  type UseFormSetValue,
} from 'react-hook-form'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock3, Factory, FlaskConical, Plus, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useEmployes } from '@/lib/hooks/use-rh'
import { useCreateSession, useMachines } from '@/lib/hooks/use-production'
import { useClassments, useMatieres, useProducts } from '@/lib/hooks/use-catalogue'
import { sessionSchema, type SessionBatchSchema } from '@/lib/schemas/production.schema'
import type { BonProduction } from '@/lib/types'
import type { CatalogueMatiere, CatalogueProduct } from '@/lib/catalogue.types'
import type { RhEmploye } from '@/lib/rh.types'

interface BpSessionCreateFormProps {
  bp?: BonProduction | null
  bpId: number
  onSuccess?: () => void
}

function buildDefaultValues(bp?: BonProduction | null): SessionBatchSchema {
  return {
    date_session: new Date().toISOString().slice(0, 10),
    machine_id: bp?.machine_id ?? 0,
    cout_electricite: undefined,
    matieres: [],
    obtenus: [],
    employes: [],
    evenements: [],
  }
}

function createMatiereRow(defaultMatiereId: number): SessionBatchSchema['matieres'][number] {
  return {
    matiere_id: defaultMatiereId,
    quantite_utilisee: 1,
    quantite_restituee: undefined,
  }
}

function createObtenuRow(defaultProduitId: number, defaultClassementId: number, defaultDestinationId: number): SessionBatchSchema['obtenus'][number] {
  return {
    produit_id: defaultProduitId,
    classement_id: defaultClassementId,
    quantite_produite: 1,
    destination_location_id: defaultDestinationId,
  }
}

function createEmployeRow(defaultEmployeId: number): SessionBatchSchema['employes'][number] {
  return {
    employe_id: defaultEmployeId,
    heures_brutes: undefined,
  }
}

function createEvenementRow(): SessionBatchSchema['evenements'][number] {
  return {
    type_evenement: 'production',
    heure_debut: '',
    heure_fin: undefined,
    description: undefined,
  }
}

export function BpSessionCreateForm({ bp, bpId, onSuccess }: BpSessionCreateFormProps) {
  const { mutateAsync: createSession, isPending } = useCreateSession()
  const { data: locationsData, isLoading: locationsLoading } = useLocations()
  const locations = Array.isArray(locationsData) ? locationsData : []
  const { data: machinesData, isLoading: machinesLoading } = useMachines()
  const bpLocationId = bp?.location?.id ?? locations[0]?.id ?? 0

  const { data: matieresPage, isLoading: matieresLoading } = useMatieres({
    actif: true,
    per_page: 100,
    location_id: bpLocationId || undefined,
  })

  const { data: employesPage, isLoading: employesLoading } = useEmployes({ actif: true, per_page: 100 })
  const { data: classmentsData, isLoading: classmentsLoading } = useClassments()

  const machines = Array.isArray(machinesData) ? machinesData : []
  const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []
  const bpProduit = bp?.produit ?? null
  const bpProduitId = bpProduit?.id ?? 0
  const bpProduitLabel = bpProduit
    ? `${bpProduit.nomencla ?? ''} - ${bpProduit.designation ?? 'Produit'}`
    : 'Produit de l’OF'

  const employes = Array.isArray(employesPage?.data?.data) ? employesPage.data.data : []
  
  const classments = Array.isArray(classmentsData) ? classmentsData.filter((item) => item.actif) : []

  const defaultValues = useMemo(() => buildDefaultValues(bp), [bp])
  const initializedRef = useRef(false)

  const methods = useForm<SessionBatchSchema>({
    resolver: zodResolver(sessionSchema) as unknown as Resolver<SessionBatchSchema>,
    defaultValues,
  })

  const {
    handleSubmit,
    reset,
    control,
    register,
    setValue,
    formState: { errors },
  } = methods

  useEffect(() => {
    if (initializedRef.current) return
    if (machinesLoading || matieresLoading || employesLoading || locationsLoading) return

    initializedRef.current = true
    reset(defaultValues)
  }, [
    defaultValues,
    machinesLoading,
    matieresLoading,
    employesLoading,
    locationsLoading,
    reset,
  ])

  const machineOptions = useMemo(
    () => machines.map((machine) => ({ value: machine.id, label: machine.nom })),
    [machines]
  )

  const matiereOptions = useMemo(
    () => matieres.map((matiere: CatalogueMatiere) => ({ value: matiere.id, label: `${matiere.reference} - ${matiere.nom}` })),
    [matieres]
  )


  const employeOptions = useMemo(
    () =>
      employes.map((employe: RhEmploye) => ({
        value: employe.id,
        label: employe.nom_complet ?? `${employe.prenom} ${employe.nom}`,
      })),
    [employes]
  )

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.nom })),
    [locations]
  )

  const classmentOptions = useMemo(
    () =>
      classments.map((item) => ({
        value: item.id,
        label: item.qualite_libelle ?? item.qualite,
      })),
    [classments]
  )

  const defaultDestinationId = bp?.location?.id ?? locations[0]?.id ?? 0
  const defaultProductId = bp?.produit?.id ?? 0
  const defaultMatiereId = matieres[0]?.id ?? 0
  const defaultEmployeId = employes[0]?.id ?? 0
  // const defaultMachineId = bp?.machine_id ?? machines[0]?.id ?? 0
  const defaultClassementId = classments[0]?.id ?? 0

  const matieresArray = useFieldArray({ control, name: 'matieres' })
  const obtenusArray = useFieldArray({ control, name: 'obtenus' })
  const employesArray = useFieldArray({ control, name: 'employes' })
  const evenementsArray = useFieldArray({ control, name: 'evenements' })

  const onSubmit = async (values: SessionBatchSchema) => {
    await createSession({ bpId, payload: values })
    reset(buildDefaultValues(bp))
    onSuccess?.()
  }

  const canCreateSession = machines.length > 0

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Date session *"
            type="date"
            error={errors.date_session?.message}
            {...register('date_session')}
          />
          <Select
            label="Machine *"
            options={machineOptions}
            placeholder={machines.length ? 'Choisir une machine' : 'Aucune machine disponible'}
            error={errors.machine_id?.message}
            disabled={!machines.length}
            {...register('machine_id', { valueAsNumber: true })}
          />
          <Input
            label="Coût électricité"
            type="number"
            step="100"
            placeholder="0"
            error={errors.cout_electricite?.message}
            {...register('cout_electricite')}
          />
        </section>

        {!canCreateSession && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Il faut au moins une machine pour créer la session.
          </div>
        )}

        <SectionBlock
          title="Matières premières consommées"
          description="Ajoute une ou plusieurs matières consommées pendant la session."
          icon={<FlaskConical className="h-4 w-4" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => matieresArray.append(createMatiereRow(defaultMatiereId))}
              disabled={!matieres.length}
            >
              Ajouter une ligne
            </Button>
          }
        >
          {matieresArray.fields.length === 0 ? (
            <EmptyLineState text="Aucune matière ajoutée pour le moment." />
          ) : (
            <div className="space-y-3">
              {matieresArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-4"
                >
                  <Controller
                    control={control}
                    name={`matieres.${index}.matiere_id` as const}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Matière *"
                        options={matiereOptions}
                        placeholder={matieres.length ? 'Choisir une matière' : 'Aucune matière disponible'}
                        searchPlaceholder="Rechercher une référence ou un nom..."
                        noOptionsMessage="Aucune matière trouvée."
                        error={errors.matieres?.[index]?.matiere_id?.message}
                        disabled={!matieres.length}
                        value={field.value}
                        onValueChange={(value) => field.onChange(Number(value))}
                      />
                    )}
                  />
                  <Input
                    label="Quantité utilisée *"
                    type="number"
                    step="100"
                    error={errors.matieres?.[index]?.quantite_utilisee?.message}
                    {...register(`matieres.${index}.quantite_utilisee` as const, { valueAsNumber: true })}
                  />
                  <Input
                    label="Quantité restituée"
                    type="number"
                    step="1"
                    error={errors.matieres?.[index]?.quantite_restituee?.message}
                    {...register(`matieres.${index}.quantite_restituee` as const, { valueAsNumber: true })}
                  />
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => matieresArray.remove(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionBlock>

        <SectionBlock
          title="Produits obtenus"
          description="Ajoute les produits finis obtenus et leur classement."
          icon={<Factory className="h-4 w-4" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                obtenusArray.append(createObtenuRow(defaultProductId, defaultClassementId, defaultDestinationId))
              }
              disabled={!locations.length || !classments.length}
            >
              Ajouter une ligne
            </Button>
          }
        >
          {obtenusArray.fields.length === 0 ? (
            <EmptyLineState text="Aucun produit obtenu ajouté pour le moment." />
          ) : (
            <div className="space-y-3">
              {obtenusArray.fields.map((field, index) => (
                <ObtenuRow
                  key={field.id}
                  index={index}
                  productLabel={bpProduitLabel}
                  locationOptions={locationOptions}
                  classmentOptions={classmentOptions}
                  canChooseLocation={locations.length > 0}
                  canChooseClassment={classments.length > 0}
                  onRemove={() => obtenusArray.remove(index)}
                />
              ))}
            </div>
          )}
        </SectionBlock>

        <SectionBlock
          title="Équipes et employés"
          description="Renseigne les employés qui ont participé à la session."
          icon={<UserRound className="h-4 w-4" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => employesArray.append(createEmployeRow(defaultEmployeId))}
              disabled={!employes.length}
            >
              Ajouter une ligne
            </Button>
          }
        >
          {employesArray.fields.length === 0 ? (
            <EmptyLineState text="Aucun employé ajouté pour le moment." />
          ) : (
            <div className="space-y-3">
              {employesArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-3"
                >
                  <Select
                    label="Employé *"
                    options={employeOptions}
                    placeholder={employes.length ? 'Choisir un employé' : 'Aucun employé disponible'}
                    error={errors.employes?.[index]?.employe_id?.message}
                    disabled={!employes.length}
                    {...register(`employes.${index}.employe_id` as const, { valueAsNumber: true })}
                  />
                  <Input
                    label="Heures brutes"
                    type="number"
                    step="1"
                    placeholder="Optionnel"
                    error={errors.employes?.[index]?.heures_brutes?.message}
                    {...register(`employes.${index}.heures_brutes` as const, {
                      setValueAs: (value) => {
                        if (value === '' || value === null || value === undefined) {
                          return undefined
                        }

                        const parsed = Number(value)
                        return Number.isNaN(parsed) ? undefined : parsed
                      },
                    })}
                  />
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => employesArray.remove(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionBlock>

        <SectionBlock
          title="Événements de production"
          description="Ajoute les événements successifs observés pendant la session."
          icon={<Clock3 className="h-4 w-4" />}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => evenementsArray.append(createEvenementRow())}
            >
              Ajouter une ligne
            </Button>
          }
        >
          {evenementsArray.fields.length === 0 ? (
            <EmptyLineState text="Aucun événement ajouté pour le moment." />
          ) : (
            <div className="space-y-3">
              {evenementsArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-5"
                >
                  <Select
                    label="Type *"
                    options={[
                      { value: 'production', label: 'Production' },
                      { value: 'pause', label: 'Pause' },
                      { value: 'panne', label: 'Panne' },
                      { value: 'autre', label: 'Autre' },
                    ]}
                    error={errors.evenements?.[index]?.type_evenement?.message}
                    {...register(`evenements.${index}.type_evenement` as const)}
                  />
                  <Input
                    label="Heure début *"
                    type="time"
                    error={errors.evenements?.[index]?.heure_debut?.message}
                    {...register(`evenements.${index}.heure_debut` as const)}
                  />
                  <Input
                    label="Heure fin"
                    type="time"
                    error={errors.evenements?.[index]?.heure_fin?.message}
                    {...register(`evenements.${index}.heure_fin` as const)}
                  />
                  <Input
                    label="Description"
                    placeholder="Optionnelle"
                    error={errors.evenements?.[index]?.description?.message}
                    {...register(`evenements.${index}.description` as const)}
                  />
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => evenementsArray.remove(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionBlock>

        <div className="flex items-center justify-end gap-2 border-t border-surface-border pt-4">
          <Button type="submit" loading={isPending} disabled={!canCreateSession}>
            Créer la session complète
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function SectionBlock({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-lg border border-surface-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-steel-500">{icon}</span>
            <h3 className="text-sm font-semibold text-steel-900">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-steel-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyLineState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-surface-border bg-surface-subtle/40 px-3 py-4 text-sm text-steel-500">
      {text}
    </div>
  )
}

function ObtenuRow({
  index,
  productLabel,
  locationOptions,
  classmentOptions,
  canChooseLocation,
  canChooseClassment,
  onRemove,
}: {
  index: number
  productLabel: string
  locationOptions: Array<{ value: number; label: string }>
  classmentOptions: Array<{ value: number; label: string }>
  canChooseLocation: boolean
  canChooseClassment: boolean
  onRemove: () => void
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SessionBatchSchema>()

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-5">
      <div className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 md:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
          Produit obtenu
        </p>
        <p className="mt-1 font-medium text-steel-900">{productLabel}</p>
        <input
          type="hidden"
          {...register(`obtenus.${index}.produit_id` as const, { valueAsNumber: true })}
        />
        {errors.obtenus?.[index]?.produit_id?.message && (
          <p className="mt-1 text-xs text-red-600">
            {errors.obtenus[index]?.produit_id?.message}
          </p>
        )}
      </div>

      <Select
        label="Classement *"
        options={classmentOptions}
        placeholder={canChooseClassment ? 'Choisir un classement' : 'Aucun classement disponible'}
        error={errors.obtenus?.[index]?.classement_id?.message}
        disabled={!canChooseClassment}
        {...register(`obtenus.${index}.classement_id` as const, { valueAsNumber: true })}
      />

      <Input
        label="Quantité produite *"
        type="number"
        step="0.001"
        error={errors.obtenus?.[index]?.quantite_produite?.message}
        {...register(`obtenus.${index}.quantite_produite` as const, { valueAsNumber: true })}
      />

      <Select
        label="Destination *"
        options={locationOptions}
        placeholder={canChooseLocation ? 'Choisir une destination' : 'Aucune location disponible'}
        error={errors.obtenus?.[index]?.destination_location_id?.message}
        disabled={!canChooseLocation}
        {...register(`obtenus.${index}.destination_location_id` as const, {
          valueAsNumber: true,
        })}
      />

      <div className="flex items-end justify-end">
        <Button
          type="button"
          variant="ghost"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={onRemove}
        >
          Supprimer
        </Button>
      </div>
    </div>
  )
}

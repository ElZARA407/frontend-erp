'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCreateBonProduction, useCreateMachine, useMachines } from '@/lib/hooks/use-production'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import {
  bonProductionSchema,
  machineSchema,
  type BonProductionSchema,
  type MachineSchema,
} from '@/lib/schemas/production.schema'
import { formatDateTime } from '@/lib/utils'

interface BpFormProps {
  onSuccess?: () => void
}

export function BpForm({ onSuccess }: BpFormProps) {
  const { mutate: createBonProduction, isPending } = useCreateBonProduction()
  const { mutateAsync: createMachine, isPending: creatingMachine } = useCreateMachine()

  const { data: locationsData, isLoading: locationsLoading } = useLocations()
  const { data: productsPage, isLoading: productsLoading } = useProducts({ actif: true, per_page: 100 })
  const { data: machinesData, isLoading: machinesLoading } = useMachines()

  const locations = Array.isArray(locationsData) ? locationsData : []
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
  const machines = Array.isArray(machinesData) ? machinesData : []

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.nom })),
    [locations]
  )

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.nomencla} - ${product.designation}`,
      })),
    [products]
  )

  const machineOptions = useMemo(
    () => machines.map((machine) => ({ value: machine.id, label: machine.nom })),
    [machines]
  )

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors: bpErrors },
  } = useForm<BonProductionSchema>({
    resolver: zodResolver(bonProductionSchema) as unknown as Resolver<BonProductionSchema>,
    defaultValues: {
      date: today,
      location_id: 0,
      produit_id: 0,
      machine_id: 0,
      quantite_cible: 1,
    },
  })

  const {
    register: registerMachine,
    handleSubmit: handleMachineSubmit,
    reset: resetMachine,
    formState: { errors: machineErrors },
  } = useForm<MachineSchema>({
    resolver: zodResolver(machineSchema) as unknown as Resolver<MachineSchema>,
    defaultValues: {
      nom: '',
      description: '',
    },
  })

  // Initialisation des valeurs par défaut une seule fois (via un ref),
  // avec setValue ciblé pour ne jamais écraser quantite_cible ou d'autres
  // champs déjà modifiés par l'utilisateur.
  const defaultsAppliedRef = useRef(false)

  useEffect(() => {
    if (defaultsAppliedRef.current) return
    if (locationsLoading || productsLoading || machinesLoading) return
    if (!locations.length || !products.length || !machines.length) return

    defaultsAppliedRef.current = true

    setValue('location_id', locations[0]?.id ?? 0, { shouldValidate: true })
    setValue('produit_id', products[0]?.id ?? 0, { shouldValidate: true })
    setValue('machine_id', machines[0]?.id ?? 0, { shouldValidate: true })
  }, [locations, locationsLoading, products, productsLoading, machines, machinesLoading, setValue])

  const onCreateMachine = async (values: MachineSchema) => {
    const machine = await createMachine(values)

    resetMachine({
      nom: '',
      description: '',
    })

    if (machine?.id) {
      setValue('machine_id', machine.id, { shouldValidate: true, shouldDirty: true })
    }
  }

  const onSubmit = (values: BonProductionSchema) => {
    createBonProduction(values, {
      onSuccess: () => {
        reset({
          date: today,
          location_id: locations[0]?.id ?? 0,
          produit_id: products[0]?.id ?? 0,
          machine_id: machines[0]?.id ?? 0,
          quantite_cible: 1,
        })
        onSuccess?.()
      },
    })
  }

  const formBlocked = locationsLoading || productsLoading || machinesLoading || !locations.length || !products.length || !machines.length

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="space-y-4 rounded-lg border border-surface-border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-steel-900">Machines disponibles</h3>
            <p className="text-xs text-steel-500">
              La machine est liée directement au BP. Tu peux en créer une sans quitter ce formulaire.
            </p>
          </div>
          <Badge variant="info">{machines.length} machine(s)</Badge>
        </div>

        {machines.length === 0 ? (
          <div className="rounded-md border border-dashed border-surface-border bg-surface-subtle/40 p-3 text-sm text-steel-500">
            Aucune machine n’est encore enregistrée.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {machines.map((machine) => (
              <div
                key={machine.id}
                className="rounded-md border border-surface-border px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-steel-900">{machine.nom}</span>
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-steel-500">
                  {machine.description ?? 'Aucune description'}
                </p>
                <p className="mt-1 text-[11px] text-steel-400">
                  {machine.created_at ? formatDateTime(machine.created_at) : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleMachineSubmit(onCreateMachine)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Nom de la machine *"
              placeholder="Ex. Presse 01"
              error={machineErrors.nom?.message}
              {...registerMachine('nom')}
            />
            <Input
              label="Description"
              placeholder="Optionnelle"
              error={machineErrors.description?.message}
              {...registerMachine('description')}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={creatingMachine}>
              Créer la machine
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-lg border border-surface-border bg-white p-4">
        <div>
          <h3 className="text-sm font-semibold text-steel-900">Création du bon de production</h3>
          <p className="text-xs text-steel-500">
            Le formulaire est conçu pour rester lisible en paysage et éviter les débordements.
          </p>
        </div>

        {formBlocked && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Il faut au moins un site, un produit et une machine pour créer un BP.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Date *"
              type="date"
              error={bpErrors.date?.message}
              {...register('date')}
            />
            <Select
              label="Site *"
              options={locationOptions}
              placeholder={locations.length ? 'Choisir un site' : 'Aucun site disponible'}
              error={bpErrors.location_id?.message}
              disabled={!locations.length}
              {...register('location_id', { valueAsNumber: true })}
            />
          </div>

          <Select
            label="Produit *"
            options={productOptions}
            placeholder={products.length ? 'Choisir un produit' : 'Aucun produit disponible'}
            error={bpErrors.produit_id?.message}
            disabled={!products.length}
            {...register('produit_id', { valueAsNumber: true })}
          />

          <Select
            label="Machine *"
            options={machineOptions}
            placeholder={machines.length ? 'Choisir une machine' : 'Aucune machine disponible'}
            error={bpErrors.machine_id?.message}
            disabled={!machines.length}
            {...register('machine_id', { valueAsNumber: true })}
          />

          <Input
            label="Quantité cible *"
            type="number"
            step="1"
            placeholder="5000"
            error={bpErrors.quantite_cible?.message}
            {...register('quantite_cible', { valueAsNumber: true })}
          />

          <div className="flex justify-end border-t border-surface-border pt-4">
            <Button type="submit" loading={isPending} disabled={formBlocked}>
              Créer le BP
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
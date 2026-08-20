'use client'

import { useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMachines } from '@/lib/hooks/use-production'
import { useMatieres } from '@/lib/hooks/use-catalogue'
import { useCreateBonTransformation } from '@/lib/hooks/use-recyclage'
import {
  bonTransformationSchema,
  type BonTransformationSchema,
} from '@/lib/schemas/recyclage.schema'
import type { CatalogueMatiere } from '@/lib/catalogue.types'
import type { Location, Machine } from '@/lib/types'

interface BtFormProps {
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

export function BtForm({ onSuccess }: BtFormProps) {
  const { mutate: createBt, isPending } = useCreateBonTransformation()

  const { data: locationsData } = useLocations()
  const { data: machinesData } = useMachines({ actif: true })
  const { data: matieresBrutesPage } = useMatieres({ type: 'brute', per_page: 200 })

  const locations = normalizeArray<Location>(locationsData)
  const machines = normalizeArray<Machine>(machinesData)
  const matieresBrutes = useMemo(
  () => (Array.isArray(matieresBrutesPage?.data?.data) ? matieresBrutesPage.data.data : []),
  [matieresBrutesPage],
)

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location.id,
        label: `${location.nom} (${location.type})`,
      })),
    [locations]
  )

  const machineOptions = useMemo(
    () =>
      machines.map((machine) => ({
        value: machine.id,
        label: machine.nom,
      })),
    [machines]
  )

  const matiereBruteOptions = useMemo(
    () =>
      matieresBrutes.map((matiere: CatalogueMatiere) => ({
        value: matiere.id,
        label: `${matiere.reference} - ${matiere.nom}`,
      })),
    [matieresBrutes]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BonTransformationSchema>({
    resolver: zodResolver(bonTransformationSchema) as unknown as Resolver<BonTransformationSchema>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      quantite_entree: 0,
    },
  })

  const onSubmit = (data: BonTransformationSchema) => {
    createBt(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />

        <Select
          label="Site *"
          placeholder="Choisir un site"
          options={locationOptions}
          error={errors.location_id?.message}
          {...register('location_id')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Matière brute *"
          placeholder="Choisir la matière brute"
          options={matiereBruteOptions}
          error={errors.matiere_brute_id?.message}
          {...register('matiere_brute_id')}
        />

        <Select
          label="Machine *"
          placeholder="Choisir une machine"
          options={machineOptions}
          error={errors.machine_id?.message}
          {...register('machine_id')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Quantité prévue *"
          type="number"
          step="0.001"
          placeholder="1000"
          error={errors.quantite_entree?.message}
          {...register('quantite_entree')}
        />

        <Input
          label="Observations"
          placeholder="Remarque facultative"
          error={errors.observations?.message}
          {...register('observations')}
        />
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={isPending}>
          Créer le BT
        </Button>
      </div>
    </form>
  )
}
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMatieres } from '@/lib/hooks/use-catalogue'
import { useCreateBonTransformation } from '@/lib/hooks/use-recyclage'
import {
  bonTransformationSchema,
  type BonTransformationSchema,
} from '@/lib/schemas/recyclage.schema'

interface BtFormProps {
  onSuccess?: () => void
}

export function BtForm({ onSuccess }: BtFormProps) {
  const { mutate: createBt, isPending } = useCreateBonTransformation()

  const { data: locationsData } = useLocations()
  const { data: matieresBrutesPage } = useMatieres({ type: 'brute', per_page: 200 })
  const { data: matieresBroyeesPage } = useMatieres({ type: 'broyee', per_page: 200 })

  const locations = Array.isArray(locationsData) ? locationsData : []
  const matieresBrutes = Array.isArray(matieresBrutesPage?.data?.data) ? matieresBrutesPage.data.data : []
  const matieresBroyees = Array.isArray(matieresBroyeesPage?.data?.data) ? matieresBroyeesPage.data.data : []

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: `${location.nom} (${location.type})` })),
    [locations]
  )

  const matiereBruteOptions = useMemo(
    () =>
      matieresBrutes.map((matiere) => ({
        value: matiere.id,
        label: `${matiere.reference} - ${matiere.nom}`,
      })),
    [matieresBrutes]
  )

  const matiereBroyeeOptions = useMemo(
    () =>
      matieresBroyees.map((matiere) => ({
        value: matiere.id,
        label: `${matiere.reference} - ${matiere.nom}`,
      })),
    [matieresBroyees]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BonTransformationSchema>({
    resolver: zodResolver(bonTransformationSchema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
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
          label="Matière broyée *"
          placeholder="Choisir la matière broyée"
          options={matiereBroyeeOptions}
          error={errors.matiere_broyee_id?.message}
          {...register('matiere_broyee_id')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Machine de broyage *"
          placeholder="Machine BT-01"
          error={errors.machine_broyage?.message}
          {...register('machine_broyage')}
        />
        <Input
          label="Quantité entrée *"
          type="number"
          step="0.001"
          placeholder="1000"
          error={errors.quantite_entree?.message}
          {...register('quantite_entree')}
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
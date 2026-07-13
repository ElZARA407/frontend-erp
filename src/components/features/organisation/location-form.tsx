'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  organisationLocationSchema,
  type OrganisationLocationSchema,
} from '@/lib/schemas/organisation.schema'
import { useCreateLocation, useUpdateLocation } from '@/lib/hooks/use-organisation'

interface LocationFormProps {
  defaultValues?: Partial<OrganisationLocationSchema> & { id?: number }
  onSuccess?: () => void
}

export function LocationForm({ defaultValues, onSuccess }: LocationFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganisationLocationSchema>({
    resolver: zodResolver(organisationLocationSchema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      type: defaultValues?.type ?? 'bureau',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = (values: OrganisationLocationSchema) => {
    if (isEditing && defaultValues?.id) {
      updateLocation.mutate(
        { id: defaultValues.id, payload: values },
        { onSuccess },
      )
      return
    }

    createLocation.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom de la location *"
        placeholder="Usine principale"
        error={errors.nom?.message}
        {...register('nom')}
      />

      <Select
        label="Type *"
        options={[
          { value: 'bureau', label: 'Bureau' },
          { value: 'usine', label: 'Usine' },
        ]}
        placeholder="Choisir le type"
        error={errors.type?.message}
        {...register('type')}
      />

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createLocation.isPending || updateLocation.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
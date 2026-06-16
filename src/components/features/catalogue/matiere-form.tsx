// src/components/features/catalogue/matiere-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  catalogueMatiereCreateSchema,
  catalogueMatiereUpdateSchema,
  type CatalogueMatiereCreateSchema,
  type CatalogueMatiereUpdateSchema,
} from '@/lib/schemas/catalogue.schema'
import {
  useCreateMatiere,
  useUpdateMatiere,
} from '@/lib/hooks/use-catalogue'
import type { CatalogueMatiere } from '@/lib/catalogue.types'

interface MatiereFormProps {
  defaultValues?: Partial<CatalogueMatiere> & { id?: number }
  onSuccess?: () => void
}

type FormValues = CatalogueMatiereCreateSchema | CatalogueMatiereUpdateSchema

export function MatiereForm({ defaultValues, onSuccess }: MatiereFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createMatiere = useCreateMatiere()
  const updateMatiere = useUpdateMatiere()

  const schema = isEditing ? catalogueMatiereUpdateSchema : catalogueMatiereCreateSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      nom: defaultValues?.nom ?? '',
      type: defaultValues?.type ?? 'brute',
      description: defaultValues?.description ?? '',
      unite: defaultValues?.unite ?? 'kg',
      prix_moyen: defaultValues?.prix_moyen ?? undefined,
      actif: defaultValues?.actif ?? true,
    } as never,
  })

  useEffect(() => {
    reset({
      reference: defaultValues?.reference ?? '',
      nom: defaultValues?.nom ?? '',
      type: defaultValues?.type ?? 'brute',
      description: defaultValues?.description ?? '',
      unite: defaultValues?.unite ?? 'kg',
      prix_moyen: defaultValues?.prix_moyen ?? undefined,
      actif: defaultValues?.actif ?? true,
    } as never)
  }, [defaultValues, reset])

  const onSubmit = (values: FormValues) => {
    if (isEditing && defaultValues?.id) {
      const payload = {
        nom: (values as CatalogueMatiereUpdateSchema).nom,
        description: (values as CatalogueMatiereUpdateSchema).description ?? null,
        unite: (values as CatalogueMatiereUpdateSchema).unite,
        actif: (values as CatalogueMatiereUpdateSchema).actif,
      }

      updateMatiere.mutate(
        { id: defaultValues.id, payload },
        { onSuccess }
      )
      return
    }

    const createValues = values as CatalogueMatiereCreateSchema

    createMatiere.mutate(
      {
        reference: createValues.reference,
        nom: createValues.nom,
        type: createValues.type,
        description: createValues.description ?? null,
        unite: createValues.unite,
        prix_moyen: createValues.prix_moyen ?? null,
        actif: Boolean(createValues.actif),
      },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEditing ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Référence *"
            placeholder="MP-001"
            error={(errors as Record<string, { message?: string }>).reference?.message}
            {...register('reference')}
          />
          <Select
            label="Type *"
            options={[
              { value: 'preformes', label: 'Préformes' },
              { value: 'broyee', label: 'Broyée' },
              { value: 'brute', label: 'Brute' },
              { value: 'vierge', label: 'Vierge' },
              { value: 'colorant', label: 'Colorant' },
              { value: 'autre', label: 'Autre' },
            ]}
            error={(errors as Record<string, { message?: string }>).type?.message}
            {...register('type')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Référence"
            disabled
            {...register('reference' as never)}
          />
          <Input
            label="Type"
            disabled
            {...register('type' as never)}
          />
        </div>
      )}

      <Input
        label="Nom *"
        placeholder="PVC brut"
        error={(errors as Record<string, { message?: string }>).nom?.message}
        {...register('nom')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Unité *"
          placeholder="kg"
          error={(errors as Record<string, { message?: string }>).unite?.message}
          {...register('unite')}
        />
        {!isEditing ? (
          <Input
            label="Prix moyen"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('prix_moyen', { valueAsNumber: true })}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Description</label>
        <textarea
          rows={4}
          placeholder="Description de la matière première"
          className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
          {...register('description')}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-steel-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-steel-700"
          {...register('actif')}
        />
        Actif
      </label>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createMatiere.isPending || updateMatiere.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
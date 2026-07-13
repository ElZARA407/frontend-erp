'use client'

import {useMemo } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
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
import { useCreateMatiere, useUpdateMatiere } from '@/lib/hooks/use-catalogue'
import type { CatalogueMatiere } from '@/lib/catalogue.types'

interface MatiereFormProps {
  defaultValues?: Partial<CatalogueMatiere> & { id?: number }
  onSuccess?: () => void
}

type MatiereFormValues = {
  reference: string
  nom: string
  type: CatalogueMatiere['type']
  description: string
  unite: string
  prix_moyen?: number | undefined
  actif: boolean
}

export function MatiereForm({ defaultValues, onSuccess }: MatiereFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createMatiere = useCreateMatiere()
  const updateMatiere = useUpdateMatiere()

  const schema = isEditing ? catalogueMatiereUpdateSchema : catalogueMatiereCreateSchema

  const resolver = useMemo(
    () => zodResolver(schema) as unknown as Resolver<MatiereFormValues>,
    [schema],
  )

  const initialValues = useMemo<MatiereFormValues>(
    () => ({
      reference: defaultValues?.reference ?? '',
      nom: defaultValues?.nom ?? '',
      type: (defaultValues?.type as CatalogueMatiere['type']) ?? 'brute',
      description: defaultValues?.description ?? '',
      unite: defaultValues?.unite ?? 'kg',
      prix_moyen: defaultValues?.prix_moyen ?? undefined,
      actif: defaultValues?.actif ?? true,
    }),
    [defaultValues],
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MatiereFormValues>({
    resolver,
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  // useEffect(() => {
  //   reset(initialValues, { keepDirtyValues: true, keepErrors: true })
  // }, [initialValues, reset])

  const onSubmit = (values: MatiereFormValues) => {
    if (isEditing && defaultValues?.id) {
      const payload: CatalogueMatiereUpdateSchema = {
        nom: values.nom,
        description: values.description ?? null,
        unite: values.unite,
        actif: values.actif,
      }

      updateMatiere.mutate(
        { id: defaultValues.id, payload },
        { onSuccess },
      )
      return
    }

    const payload: CatalogueMatiereCreateSchema = {
      reference: values.reference,
      nom: values.nom,
      type: values.type,
      description: values.description ?? null,
      unite: values.unite,
      prix_moyen: values.prix_moyen ?? undefined,
      actif: Boolean(values.actif),
    }

    createMatiere.mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEditing ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="reference"
            render={({ field }) => (
              <Input
                label="Référence *"
                placeholder="MP-001"
                error={errors.reference?.message}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
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
                error={errors.type?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="reference"
            render={({ field }) => (
              <Input
                label="Référence"
                disabled
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Input
                label="Type"
                disabled
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </div>
      )}

      <Controller
        control={control}
        name="nom"
        render={({ field }) => (
          <Input
            label="Nom *"
            placeholder="PVC brut"
            error={errors.nom?.message}
            {...field}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="unite"
          render={({ field }) => (
            <Input
              label="Unité *"
              placeholder="kg"
              error={errors.unite?.message}
              {...field}
            />
          )}
        />
        {!isEditing ? (
          <Controller
            control={control}
            name="prix_moyen"
            render={({ field }) => (
              <Input
                label="Prix moyen"
                type="number"
                step="0.01"
                placeholder="0"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Description</label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              rows={4}
              placeholder="Description de la matière première"
              className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
              {...field}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="actif"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-steel-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-steel-700"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            Actif
          </label>
        )}
      />

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createMatiere.isPending || updateMatiere.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
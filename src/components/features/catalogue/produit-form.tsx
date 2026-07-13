'use client'

import {  useMemo } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  catalogueProductCreateSchema,
  catalogueProductUpdateSchema,
  type CatalogueProductCreateSchema,
  type CatalogueProductUpdateSchema,
} from '@/lib/schemas/catalogue.schema'
import { useCreateProduct, useUpdateProduct } from '@/lib/hooks/use-catalogue'
import type { CatalogueCategory, CatalogueProduct } from '@/lib/catalogue.types'

interface ProduitFormProps {
  categories: CatalogueCategory[]
  defaultValues?: Partial<CatalogueProduct> & { id?: number }
  onSuccess?: () => void
}

type ProduitFormValues = CatalogueProductCreateSchema

export function ProduitForm({ categories, defaultValues, onSuccess }: ProduitFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const schema = isEditing ? catalogueProductUpdateSchema : catalogueProductCreateSchema

  const resolver = useMemo(
    () => zodResolver(schema) as unknown as Resolver<ProduitFormValues>,
    [schema],
  )

  const initialValues = useMemo<ProduitFormValues>(
    () => ({
      designation: defaultValues?.designation ?? '',
      categorie_id: defaultValues?.categorie?.id ?? categories[0]?.id ?? 0,
      contenance: defaultValues?.contenance ?? '',
      format: defaultValues?.format ?? '',
      unite: defaultValues?.unite ?? 'pc',
      colisage: defaultValues?.colisage ?? 1,
      poids: defaultValues?.poids ?? '',
      seuil: defaultValues?.seuil ?? 0,
      actif: defaultValues?.actif ?? true,
    }),
    [defaultValues, categories],
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProduitFormValues>({
    resolver,
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  // useEffect(() => {
  //   reset(initialValues, { keepDirtyValues: true, keepErrors: true })
  // }, [initialValues, reset])

  const onSubmit = (values: ProduitFormValues) => {
    if (isEditing && defaultValues?.id) {
      const payload: CatalogueProductUpdateSchema = {
        designation: values.designation,
        contenance: values.contenance ?? undefined,
        format: values.format ?? undefined,
        colisage: values.colisage,
        seuil: values.seuil,
        poids: values.poids,
        actif: values.actif,
      }

      updateProduct.mutate(
        { id: defaultValues.id, payload },
        { onSuccess },
      )
      return
    }

    createProduct.mutate(
      {
        designation: values.designation,
        categorie_id: Number(values.categorie_id),
        contenance: values.contenance ?? null,
        format: values.format ?? null,
        unite: values.unite,
        colisage: Number(values.colisage),
        seuil: Number(values.seuil),
        poids: values.poids,
        actif: Boolean(values.actif),
      },
      { onSuccess },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="categorie_id"
          render={({ field }) => (
            <Select
              label="Catégorie *"
              placeholder="Choisir une catégorie"
              disabled={isEditing}
              options={categories.map((category) => ({
                value: category.id,
                label: category.nom,
              }))}
              error={errors.categorie_id?.message}
              value={String(field.value ?? '')}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <Controller
          control={control}
          name="designation"
          render={({ field }) => (
            <Input
              label="Désignation *"
              placeholder="Bouteille PET 500ml"
              error={errors.designation?.message}
              {...field}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Controller
          control={control}
          name="contenance"
          render={({ field }) => (
            <Input
              label="Contenance"
              placeholder="500ml"
              disabled={isEditing}
              error={errors.contenance?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="format"
          render={({ field }) => (
            <Input
              label="Format"
              placeholder="Standard"
              disabled={isEditing}
              error={errors.format?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="unite"
          render={({ field }) => (
            <Input
              label="Unité *"
              placeholder="PCS"
              disabled={isEditing}
              error={errors.unite?.message}
              {...field}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Controller
          control={control}
          name="colisage"
          render={({ field }) => (
            <Input
              label="Colisage *"
              type="number"
              step="1"
              error={errors.colisage?.message}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <Controller
          control={control}
          name="poids"
          render={({ field }) => (
            <Input
              label="Poids *"
              placeholder="12.5g"
              error={errors.poids?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="seuil"
          render={({ field }) => (
            <Input
              label="Seuil *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              error={errors.seuil?.message}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <Controller
          control={control}
          name="actif"
          render={({ field }) => (
            <label className="flex items-center gap-2 pt-6 text-sm text-steel-700">
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
      </div>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
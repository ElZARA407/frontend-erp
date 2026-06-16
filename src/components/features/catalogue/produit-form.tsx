// src/components/features/catalogue/produit-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/lib/hooks/use-catalogue'
import type { CatalogueCategory, CatalogueProduct } from '@/lib/catalogue.types'

interface ProduitFormProps {
  categories: CatalogueCategory[]
  defaultValues?: Partial<CatalogueProduct> & { id?: number }
  onSuccess?: () => void
}

type FormValues = CatalogueProductCreateSchema | CatalogueProductUpdateSchema

export function ProduitForm({ categories, defaultValues, onSuccess }: ProduitFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const schema = isEditing ? catalogueProductUpdateSchema : catalogueProductCreateSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      nomencla: defaultValues?.nomencla ?? '',
      designation: defaultValues?.designation ?? '',
      categorie_id: defaultValues?.categorie?.id ?? categories[0]?.id ?? 0,
      contenance: defaultValues?.contenance ?? '',
      format: defaultValues?.format ?? '',
      unite: defaultValues?.unite ?? 'pc',
      colisage: defaultValues?.colisage ?? 1,
      poids: defaultValues?.poids ?? '',
      actif: defaultValues?.actif ?? true,
      prix_1er: undefined,
      prix_2e: undefined,
      prix_casse: undefined,
    } as never,
  })

  useEffect(() => {
    reset({
      nomencla: defaultValues?.nomencla ?? '',
      designation: defaultValues?.designation ?? '',
      categorie_id: defaultValues?.categorie?.id ?? categories[0]?.id ?? 0,
      contenance: defaultValues?.contenance ?? '',
      format: defaultValues?.format ?? '',
      unite: defaultValues?.unite ?? 'pc',
      colisage: defaultValues?.colisage ?? 1,
      poids: defaultValues?.poids ?? '',
      actif: defaultValues?.actif ?? true,
      prix_1er: undefined,
      prix_2e: undefined,
      prix_casse: undefined,
    } as never)
  }, [defaultValues, categories, reset])

  const onSubmit = (values: FormValues) => {
    if (isEditing && defaultValues?.id) {
      const payload = {
        designation: (values as CatalogueProductUpdateSchema).designation,
        contenance: (values as CatalogueProductUpdateSchema).contenance ?? null,
        format: (values as CatalogueProductUpdateSchema).format ?? null,
        colisage: (values as CatalogueProductUpdateSchema).colisage,
        poids: (values as CatalogueProductUpdateSchema).poids,
        actif: (values as CatalogueProductUpdateSchema).actif,
      }

      updateProduct.mutate(
        { id: defaultValues.id, payload },
        { onSuccess }
      )
      return
    }

    const createValues = values as CatalogueProductCreateSchema

    createProduct.mutate(
      {
        nomencla: createValues.nomencla,
        designation: createValues.designation,
        categorie_id: Number(createValues.categorie_id),
        contenance: createValues.contenance ?? null,
        format: createValues.format ?? null,
        unite: createValues.unite,
        colisage: Number(createValues.colisage),
        poids: createValues.poids,
        actif: Boolean(createValues.actif),
        classements: [
          { qualite: '1er', prix_specifique: createValues.prix_1er ?? null },
          { qualite: '2e', prix_specifique: createValues.prix_2e ?? null },
          { qualite: 'casse', prix_specifique: createValues.prix_casse ?? null },
        ],
      },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nomenclature *"
          placeholder="PET-500-1L"
          disabled={isEditing}
          error={(errors as Record<string, { message?: string }>).nomencla?.message}
          {...register('nomencla')}
        />

        <Select
          label="Catégorie *"
          placeholder="Choisir une catégorie"
          disabled={isEditing}
          options={categories.map((category) => ({
            value: category.id,
            label: category.nom,
          }))}
          error={(errors as Record<string, { message?: string }>).categorie_id?.message}
          {...register('categorie_id', { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Désignation *"
        placeholder="Bouteille PET 500ml"
        error={(errors as Record<string, { message?: string }>).designation?.message}
        {...register('designation')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Contenance"
          placeholder="500ml"
          disabled={isEditing}
          error={(errors as Record<string, { message?: string }>).contenance?.message}
          {...register('contenance')}
        />
        <Input
          label="Format"
          placeholder="Standard"
          disabled={isEditing}
          error={(errors as Record<string, { message?: string }>).format?.message}
          {...register('format')}
        />
        <Input
          label="Unité *"
          placeholder="pc"
          disabled={isEditing}
          error={(errors as Record<string, { message?: string }>).unite?.message}
          {...register('unite')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Colisage *"
          type="number"
          step="1"
          error={(errors as Record<string, { message?: string }>).colisage?.message}
          {...register('colisage', { valueAsNumber: true })}
        />
        <Input
          label="Poids *"
          placeholder="12.5g"
          error={(errors as Record<string, { message?: string }>).poids?.message}
          {...register('poids')}
        />
        <label className="flex items-center gap-2 pt-6 text-sm text-steel-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-steel-700"
            {...register('actif')}
          />
          Actif
        </label>
      </div>

      {!isEditing && (
        <div className="space-y-3 rounded-lg border border-surface-border bg-surface-subtle/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Prix par classement
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Prix 1er"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('prix_1er', { valueAsNumber: true })}
            />
            <Input
              label="Prix 2e"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('prix_2e', { valueAsNumber: true })}
            />
            <Input
              label="Prix casse"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('prix_casse', { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
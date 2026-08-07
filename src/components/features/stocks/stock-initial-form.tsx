'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useProducts, useMatieres, useClassments } from '@/lib/hooks/use-catalogue'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useCreateInitialStock } from '@/lib/hooks/use-stocks'
import { stockInitialSchema, type StockInitialValues } from '@/lib/schemas/stock.schema'
import type { Location } from '@/lib/types'

interface StockInitialFormProps {
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

export function StockInitialForm({ onSuccess }: StockInitialFormProps) {
  const createStock = useCreateInitialStock()

  const { data: locationsData } = useLocations()
  const { data: productsPage } = useProducts({ actif: true, per_page: 200 })
  const { data: matieresPage } = useMatieres({ actif: true, per_page: 200 })
  const { data: classementsData } = useClassments()

  const locations = useMemo(() => normalizeArray<Location>(locationsData), [locationsData])
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
  const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []
  const classements = Array.isArray(classementsData) ? classementsData : []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StockInitialValues>({
    resolver: zodResolver(stockInitialSchema) as unknown as Resolver<StockInitialValues>,
    defaultValues: {
      location_id: 0,
      entite_type: 'produit',
      entite_id: 0,
      classement_id: undefined,
      stock_total: 0,
      motif: 'inventaire',
    },
  })

  const entiteType = watch('entite_type')

  useEffect(() => {
    setValue('entite_id', 0, { shouldValidate: true, shouldDirty: true })
    setValue('classement_id', undefined, { shouldValidate: true, shouldDirty: true })
  }, [entiteType, setValue])

  const articleOptions =
    entiteType === 'produit'
      ? products.map((product) => ({
          value: product.id,
          label: `${product.designation} (${product.nomencla})`,
        }))
      : matieres.map((matiere) => ({
          value: matiere.id,
          label: `${matiere.nom} (${matiere.reference})`,
        }))

  const onSubmit = async (values: StockInitialValues) => {
    const payload: StockInitialValues = {
      location_id: Number(values.location_id),
      entite_type: values.entite_type,
      entite_id: Number(values.entite_id),
      classement_id: values.entite_type === 'produit' ? values.classement_id : undefined,
      stock_total: Number(values.stock_total),
      motif: values.motif?.trim() || 'inventaire',
    }

    await createStock.mutateAsync(payload)
    reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Location *"
        placeholder="Choisir une location"
        options={locations.map((location) => ({
          value: location.id,
          label: location.nom,
        }))}
        error={errors.location_id?.message}
        {...register('location_id', { valueAsNumber: true })}
      />

      <Select
        label="Type d’article *"
        options={[
          { value: 'produit', label: 'Produit fini' },
          { value: 'matiere', label: 'Matière première' },
        ]}
        error={errors.entite_type?.message}
        {...register('entite_type')}
      />

      <Select
        label="Article *"
        placeholder="Choisir un article"
        options={articleOptions}
        error={errors.entite_id?.message}
        {...register('entite_id', { valueAsNumber: true })}
      />

      {entiteType === 'produit' && (
        <Select
          label="Classement *"
          placeholder="Choisir un classement"
          options={classements.map((classement) => ({
            value: classement.id,
            label: classement.qualite_libelle ?? classement.qualite_libelle ?? classement.qualite,
          }))}
          error={errors.classement_id?.message}
          {...register('classement_id', { valueAsNumber: true })}
        />
      )}

      <Input
        type="number"
        min="0"
        step="0.001"
        label="Stock physique initial *"
        placeholder="0"
        error={errors.stock_total?.message}
        {...register('stock_total', { valueAsNumber: true })}
      />

      <Input
        label="Motif"
        placeholder="Inventaire"
        error={errors.motif?.message}
        {...register('motif')}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={createStock.isPending}>
          Déclarer le stock
        </Button>
      </div>
    </form>
  )
}
// src/components/features/production/bp-form.tsx
'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bonProductionSchema, type BonProductionSchema } from '@/lib/schemas/production.schema'
import { useCreateBonProduction } from '@/lib/hooks/use-production'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface BpFormProps {
  onSuccess?: () => void
}

export function BpForm({ onSuccess }: BpFormProps) {
  const { mutate: create, isPending } = useCreateBonProduction()
  const { data: locationsData } = useLocations()
  const { data: productsPage } = useProducts({ actif: true, per_page: 200 })

  const locations = Array.isArray(locationsData) ? locationsData : []
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BonProductionSchema>({
    resolver: zodResolver(bonProductionSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (!locations.length || !products.length) return

    reset({
      date: new Date().toISOString().split('T')[0],
      location_id: locations[0]?.id ?? 0,
      produit_id: products[0]?.id ?? 0,
      machine_production: '',
      quantite_cible: 0,
    })
  }, [locations, products, reset])

  return (
    <form onSubmit={handleSubmit((data) => create(data, { onSuccess }))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Select
          label="Site *"
          options={locationOptions}
          placeholder="Choisir un site"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
      </div>

      <Select
        label="Produit *"
        options={productOptions}
        placeholder="Choisir un produit"
        error={errors.produit_id?.message}
        {...register('produit_id', { valueAsNumber: true })}
      />

      <Input
        label="Machine *"
        placeholder="Machine INJ-01"
        error={errors.machine_production?.message}
        {...register('machine_production')}
      />

      <Input
        label="Quantité cible *"
        type="number"
        step="0.001"
        placeholder="5000"
        error={errors.quantite_cible?.message}
        {...register('quantite_cible', { valueAsNumber: true })}
      />

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={isPending}>
          Créer le BP
        </Button>
      </div>
    </form>
  )
}
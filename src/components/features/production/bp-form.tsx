'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCreateBonProduction } from '@/lib/hooks/use-production'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { bonProductionSchema, type BonProductionSchema } from '@/lib/schemas/production.schema'

interface BpFormProps {
  onSuccess?: () => void
}

export function BpForm({ onSuccess }: BpFormProps) {
  const { mutate: createBonProduction, isPending } = useCreateBonProduction()
  const { data: locationsData } = useLocations()
  const { data: productsPage } = useProducts({ actif: true, per_page: 100 })

  const locations = Array.isArray(locationsData) ? locationsData : []
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BonProductionSchema>({
    resolver: zodResolver(bonProductionSchema) as any,
    defaultValues: {
      date: today,
      location_id: 0,
      produit_id: 0,
      machine_production: '',
      quantite_cible: 1,
    },
  })

  useEffect(() => {
    if (!locations.length || !products.length) return

    reset({
      date: today,
      location_id: locations[0]?.id ?? 0,
      produit_id: products[0]?.id ?? 0,
      machine_production: '',
      quantite_cible: 1,
    })
  }, [locations, products, reset, today])

  const onSubmit = (values: BonProductionSchema) => {
    createBonProduction(values, {
      onSuccess: () => {
        reset({
          date: today,
          location_id: locations[0]?.id ?? 0,
          produit_id: products[0]?.id ?? 0,
          machine_production: '',
          quantite_cible: 1,
        })
        onSuccess?.()
      },
    })
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
// src/components/features/production/bp-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bonProductionSchema, type BonProductionSchema } from '@/lib/schemas/production.schema'
import { useCreateBonProduction } from '@/lib/hooks/use-production'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BpFormProps { onSuccess?: () => void }

export function BpForm({ onSuccess }: BpFormProps) {
  const { mutate: create, isPending } = useCreateBonProduction()

  const { register, handleSubmit, formState: { errors } } = useForm<BonProductionSchema>({
    resolver: zodResolver(bonProductionSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  return (
    <form onSubmit={handleSubmit((data) => create(data, { onSuccess }))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Site (location_id) *"
          type="number"
          placeholder="ID du site"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
      </div>
      <Input
        label="Produit (produit_id) *"
        type="number"
        placeholder="ID du produit"
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
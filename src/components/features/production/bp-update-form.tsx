'use client'

import { useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useMachines, useUpdateBonProduction } from '@/lib/hooks/use-production'
import { bonProductionSchema, type BonProductionSchema } from '@/lib/schemas/production.schema'
import type { BonProduction, Machine } from '@/lib/types'

interface BpUpdateFormProps {
  bp: BonProduction
  onSuccess?: () => void
}

export function BpUpdateForm({ bp, onSuccess }: BpUpdateFormProps) {
  const updateBp = useUpdateBonProduction()
  const { data: machinesData } = useMachines({ actif: true })

  const machines = useMemo(
    () => (Array.isArray(machinesData) ? machinesData : []),
    [machinesData],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Pick<BonProductionSchema, 'machine_id' | 'quantite_cible'>>({
    resolver: zodResolver(
      bonProductionSchema.pick({
        machine_id: true,
        quantite_cible: true,
      }),
    ) as unknown as Resolver<Pick<BonProductionSchema, 'machine_id' | 'quantite_cible'>>,
    defaultValues: {
      machine_id: bp.machine_id ?? bp.machine?.id ?? 0,
      quantite_cible: Number(bp.quantite_cible) || 1,
    },
  })

  const onSubmit = (values: Pick<BonProductionSchema, 'machine_id' | 'quantite_cible'>) => {
    updateBp.mutate(
      {
        id: bp.id,
        payload: {
          machine_id: Number(values.machine_id),
          quantite_cible: Number(values.quantite_cible),
        },
      },
      { onSuccess },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Machine *"
        options={machines.map((machine: Machine) => ({
          value: machine.id,
          label: machine.nom,
        }))}
        placeholder="Choisir une machine"
        error={errors.machine_id?.message}
        {...register('machine_id', { valueAsNumber: true })}
      />

      <Input
        label="Quantité cible *"
        type="number"
        step="0.001"
        min="0.001"
        error={errors.quantite_cible?.message}
        {...register('quantite_cible', { valueAsNumber: true })}
      />

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={updateBp.isPending}>
          Modifier
        </Button>
      </div>
    </form>
  )
}
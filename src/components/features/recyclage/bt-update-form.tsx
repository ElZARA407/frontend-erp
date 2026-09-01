'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useMachines } from '@/lib/hooks/use-production'
import { useUpdateBonTransformation } from '@/lib/hooks/use-recyclage'
import type { Machine } from '@/lib/types'
import type { BonTransformation } from '@/lib/recyclage.types'

interface BtUpdateFormProps {
  bt: BonTransformation
  onSuccess?: () => void
}

type FormValues = {
  machine_id: number
  quantite_entree: number
  observations?: string
}

export function BtUpdateForm({ bt, onSuccess }: BtUpdateFormProps) {
  const updateBt = useUpdateBonTransformation()
  const { data: machinesData } = useMachines({ actif: true })

  const machines = useMemo(
    () => (Array.isArray(machinesData) ? machinesData : []),
    [machinesData],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      machine_id: bt.machine_id ?? bt.machine?.id ?? 0,
      quantite_entree: Number(bt.quantite_entree) || 0,
      observations: bt.observations ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    updateBt.mutate(
      {
        id: bt.id,
        payload: {
          machine_id: Number(values.machine_id),
          quantite_entree: Number(values.quantite_entree),
          observations: values.observations?.trim() || undefined,
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
        {...register('machine_id', { valueAsNumber: true, min: 1 })}
      />

      <Input
        label="Quantité prévue *"
        type="number"
        step="0.001"
        min="0.001"
        error={errors.quantite_entree?.message}
        {...register('quantite_entree', { valueAsNumber: true, min: 0.001 })}
      />

      <Input
        label="Observations"
        placeholder="Remarque facultative"
        error={errors.observations?.message}
        {...register('observations')}
      />

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={updateBt.isPending}>
          Modifier
        </Button>
      </div>
    </form>
  )
}
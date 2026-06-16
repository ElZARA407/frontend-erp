// src/components/features/rh/employe-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  rhEmployeSchema,
  rhEmployeUpdateSchema,
  type RhEmployeSchema,
  type RhEmployeUpdateSchema,
} from '@/lib/schemas/rh.schema'
import {
  useCreateEmploye,
  useUpdateEmploye,
} from '@/lib/hooks/use-rh'
import type { RhEmploye, RhPoste } from '@/lib/rh.types'

interface EmployeFormProps {
  postes: RhPoste[]
  defaultValues?: Partial<RhEmploye> & { id?: number }
  onSuccess?: () => void
}

type FormValues = RhEmployeSchema | RhEmployeUpdateSchema

export function EmployeForm({ postes, defaultValues, onSuccess }: EmployeFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createEmploye = useCreateEmploye()
  const updateEmploye = useUpdateEmploye()

  const schema = isEditing ? rhEmployeUpdateSchema : rhEmployeSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      matricule: defaultValues?.matricule ?? '',
      nom: defaultValues?.nom ?? '',
      prenom: defaultValues?.prenom ?? '',
      poste_id: defaultValues?.poste?.id ?? postes[0]?.id ?? 0,
      date_embauche: defaultValues?.date_embauche ?? '',
      date_depart: defaultValues?.date_depart ?? '',
      actif: defaultValues?.actif ?? true,
    } as never,
  })

  useEffect(() => {
    reset({
      matricule: defaultValues?.matricule ?? '',
      nom: defaultValues?.nom ?? '',
      prenom: defaultValues?.prenom ?? '',
      poste_id: defaultValues?.poste?.id ?? postes[0]?.id ?? 0,
      date_embauche: defaultValues?.date_embauche ?? '',
      date_depart: defaultValues?.date_depart ?? '',
      actif: defaultValues?.actif ?? true,
    } as never)
  }, [defaultValues, postes, reset])

  const onSubmit = (values: FormValues) => {
    if (isEditing && defaultValues?.id) {
      const payload = {
        nom: (values as RhEmployeUpdateSchema).nom,
        prenom: (values as RhEmployeUpdateSchema).prenom,
        poste_id: Number((values as RhEmployeUpdateSchema).poste_id),
        date_embauche: (values as RhEmployeUpdateSchema).date_embauche,
        date_depart: (values as RhEmployeUpdateSchema).date_depart ?? null,
        actif: (values as RhEmployeUpdateSchema).actif,
      }

      updateEmploye.mutate(
        { id: defaultValues.id, payload },
        { onSuccess }
      )
      return
    }

    const createValues = values as RhEmployeSchema

    createEmploye.mutate(
      {
        matricule: createValues.matricule,
        nom: createValues.nom,
        prenom: createValues.prenom,
        poste_id: Number(createValues.poste_id),
        date_embauche: createValues.date_embauche,
        date_depart: createValues.date_depart ?? null,
        actif: Boolean(createValues.actif),
      },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Matricule *"
          placeholder="EMP-001"
          disabled={isEditing}
          error={(errors as Record<string, { message?: string }>).matricule?.message}
          {...register('matricule')}
        />
        <Select
          label="Poste *"
          options={postes.map((poste) => ({
            value: poste.id,
            label: poste.nom,
          }))}
          placeholder="Choisir un poste"
          error={(errors as Record<string, { message?: string }>).poste_id?.message}
          {...register('poste_id', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nom *"
          placeholder="Rakoto"
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Prénom *"
          placeholder="Jean"
          error={errors.prenom?.message}
          {...register('prenom')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date d'embauche *"
          type="date"
          error={(errors as Record<string, { message?: string }>).date_embauche?.message}
          {...register('date_embauche')}
        />
        <Input
          label="Date de départ"
          type="date"
          error={(errors as Record<string, { message?: string }>).date_depart?.message}
          {...register('date_depart')}
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
        <Button type="submit" loading={createEmploye.isPending || updateEmploye.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
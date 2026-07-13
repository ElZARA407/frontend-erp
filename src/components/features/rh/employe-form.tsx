'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  rhEmployeSchema,
  rhEmployeUpdateSchema,
} from '@/lib/schemas/rh.schema'
import { useCreateEmploye, useUpdateEmploye } from '@/lib/hooks/use-rh'
import type { RhEmploye, RhEmployePayload, RhPoste } from '@/lib/rh.types'

interface EmployeFormProps {
  postes: RhPoste[]
  defaultValues?: Partial<RhEmploye> & { id?: number }
  onSuccess?: () => void
}

type EmployeFormValues = {
  matricule: string
  nom: string
  prenom: string
  poste_id: string
  date_embauche: string
  date_depart?: string
  actif: boolean
}

function normalizeOptionalDate(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function EmployeForm({ postes, defaultValues, onSuccess }: EmployeFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createEmploye = useCreateEmploye()
  const updateEmploye = useUpdateEmploye()
  const schema = isEditing ? rhEmployeUpdateSchema : rhEmployeSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<EmployeFormValues>,
    defaultValues: {
      matricule: defaultValues?.matricule ?? '',
      nom: defaultValues?.nom ?? '',
      prenom: defaultValues?.prenom ?? '',
      poste_id: defaultValues?.poste?.id ? String(defaultValues.poste.id) : '',
      date_embauche: defaultValues?.date_embauche ?? '',
      date_depart: defaultValues?.date_depart ?? '',
      actif: defaultValues?.actif ?? true,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const formErrors = errors as Record<string, { message?: string }>

  const onSubmit = (values: EmployeFormValues) => {
    const posteId = Number(values.poste_id)

    if (!Number.isFinite(posteId) || posteId <= 0) {
      return
    }

    const payloadBase: RhEmployePayload = {
      matricule: values.matricule.trim(),
      nom: values.nom.trim(),
      prenom: values.prenom.trim(),
      poste_id: posteId,
      date_embauche: values.date_embauche,
      date_depart: normalizeOptionalDate(values.date_depart) ?? null,
      actif: Boolean(values.actif),
    }

    if (isEditing && defaultValues?.id) {
      const payload: Partial<RhEmployePayload> = {
        nom: payloadBase.nom,
        prenom: payloadBase.prenom,
        poste_id: payloadBase.poste_id,
        date_embauche: payloadBase.date_embauche,
        date_depart: payloadBase.date_depart,
        actif: payloadBase.actif,
      }

      updateEmploye.mutate(
        { id: defaultValues.id, payload },
        { onSuccess },
      )
      return
    }

    createEmploye.mutate(payloadBase, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Matricule *"
          placeholder="EMP-001"
          disabled={isEditing}
          error={formErrors.matricule?.message}
          {...register('matricule')}
        />
        <Select
          label="Poste *"
          options={postes.map((poste) => ({
            value: poste.id,
            label: poste.nom,
          }))}
          placeholder="Choisir un poste"
          error={formErrors.poste_id?.message}
          {...register('poste_id')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nom *"
          placeholder="Rakoto"
          error={formErrors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Prénom *"
          placeholder="Jean"
          error={formErrors.prenom?.message}
          {...register('prenom')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date d'embauche *"
          type="date"
          error={formErrors.date_embauche?.message}
          {...register('date_embauche')}
        />
        <Input
          label="Date de départ"
          type="date"
          error={formErrors.date_depart?.message}
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
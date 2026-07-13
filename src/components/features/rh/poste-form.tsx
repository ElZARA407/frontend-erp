'use client'

import { useForm,type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { rhPosteSchema, type RhPosteSchema } from '@/lib/schemas/rh.schema'
import { useCreatePoste, useUpdatePoste } from '@/lib/hooks/use-rh'
import type { RhPoste } from '@/lib/rh.types'

interface PosteFormProps {
  defaultValues?: Partial<RhPoste> & { id?: number }
  onSuccess?: () => void
}

export function PosteForm({ defaultValues, onSuccess }: PosteFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createPoste = useCreatePoste()
  const updatePoste = useUpdatePoste()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RhPosteSchema>({
    resolver: zodResolver(rhPosteSchema) as unknown as Resolver<RhPosteSchema>,
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      taux_horaire: defaultValues?.taux_horaire ?? 0,
      salaire_mensuel: defaultValues?.salaire_mensuel ?? undefined,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = (values: RhPosteSchema) => {
    if (isEditing && defaultValues?.id) {
      updatePoste.mutate(
        { id: defaultValues.id, payload: values },
        { onSuccess },
      )
      return
    }

    createPoste.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom du poste *"
        placeholder="Opérateur de production"
        error={errors.nom?.message}
        {...register('nom')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Taux horaire *"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.taux_horaire?.message}
          {...register('taux_horaire')}
        />
        <Input
          label="Salaire mensuel"
          type="number"
          step="0.01"
          placeholder="0"
          error={errors.salaire_mensuel?.message}
          {...register('salaire_mensuel')}
        />
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createPoste.isPending || updatePoste.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
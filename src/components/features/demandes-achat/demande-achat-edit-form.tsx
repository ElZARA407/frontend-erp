// src/components/features/demandes-achat/demande-achat-edit-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateDemandeAchat } from '@/lib/hooks/use-lot3'
import type { DemandeAchat } from '@/lib/lot3.types'
import { demandeAchatUpdateSchema, type DemandeAchatUpdateSchema } from '@/lib/schemas/lot3.schema'

interface DemandeAchatEditFormProps {
  demande: DemandeAchat
  onSuccess?: () => void
}

export function DemandeAchatEditForm({ demande, onSuccess }: DemandeAchatEditFormProps) {
  const updateDemande = useUpdateDemandeAchat()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemandeAchatUpdateSchema>({
    resolver: zodResolver(demandeAchatUpdateSchema) as any,
    defaultValues: {
      date_demande: demande.date_demande,
      observations: demande.observations ?? '',
    },
  })    

  return (
    <form
      onSubmit={handleSubmit((values) =>
        updateDemande.mutate(
          { id: demande.id, payload: values },
          { onSuccess }
        )
      )}
      className="space-y-5"
    >
      <Input
        label="Date de demande *"
        type="date"
        error={errors.date_demande?.message}
        {...register('date_demande')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Observations</label>
        <textarea
          rows={4}
          className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
          placeholder="Observation generale"
          {...register('observations')}
        />
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={updateDemande.isPending}>
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
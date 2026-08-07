// src/components/features/clients/client-form.tsx
'use client'

import { useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientSchema } from '@/lib/schemas/client.schema'
import { useCreateClient, useUpdateClient } from '@/lib/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Client } from '@/lib/types'

interface ClientFormProps {
  defaultValues?: Client | null
  onSuccess?: () => void
}

function emptyToNull(value: string | undefined): string | null {
  const normalized = value?.trim() ?? ''
  return normalized === '' ? null : normalized
}

function buildDefaultValues(defaultValues?: Client | null): ClientSchema {
  return {
    nom: defaultValues?.nom ?? '',
    reference: defaultValues?.reference ?? '',
    est_divers: defaultValues?.est_divers ?? false,
    NIF: defaultValues?.NIF ?? '',
    STAT: defaultValues?.STAT ?? '',
    adresse: defaultValues?.adresse ?? '',
    email: defaultValues?.email ?? '',
    contact: defaultValues?.contact ?? '',
    interlocutaire: defaultValues?.interlocutaire ?? '',
    code_compta: defaultValues?.code_compta ?? '',
    facturation: defaultValues?.facturation ?? '',
    actif: defaultValues?.actif ?? true,
  }
}

export function ClientForm({ defaultValues, onSuccess }: ClientFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient(defaultValues?.id ?? 0)

  const initialValues = useMemo(() => buildDefaultValues(defaultValues), [defaultValues])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema) as unknown as Resolver<ClientSchema>,
    defaultValues: initialValues,
  })

  const estDivers = watch('est_divers')
  const isPending = createClient.isPending || updateClient.isPending

  const onSubmit = async (values: ClientSchema) => {
    const payload: ClientSchema = {
      nom: values.nom.trim(),
      reference: values.reference.trim(),
      est_divers: Boolean(values.est_divers),
      NIF: emptyToNull(values.NIF) ?? '',
      STAT: emptyToNull(values.STAT) ?? '',
      adresse: values.adresse.trim(),
      email: emptyToNull(values.email) ?? '',
      contact: values.contact.trim(),
      interlocutaire: emptyToNull(values.interlocutaire) ?? '',
      code_compta: emptyToNull(values.code_compta) ?? '',
      facturation: emptyToNull(values.facturation) ?? '',
      actif: Boolean(values.actif),
    }

    if (isEditing && defaultValues?.id) {
      await updateClient.mutateAsync(payload)
    } else {
      await createClient.mutateAsync(payload)
    }

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nom *"
          placeholder={estDivers ? 'CLIENT DIVERS' : 'SHOPRITE Madagascar'}
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Référence *"
          placeholder="CLT-001"
          error={errors.reference?.message}
          {...register('reference')}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-steel-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-steel-700"
          {...register('est_divers')}
        />
        Client divers
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="NIF" placeholder="1234567890" error={errors.NIF?.message} {...register('NIF')} />
        <Input label="STAT" placeholder="############" error={errors.STAT?.message} {...register('STAT')} />
      </div>

      <Input
        label="Adresse *"
        placeholder="Andraharo, Antananarivo"
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Contact *"
          placeholder="+261 34 000 0000"
          error={errors.contact?.message}
          {...register('contact')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="contact@client.mg"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Interlocuteur"
          placeholder="Jean Dupont"
          error={errors.interlocutaire?.message}
          {...register('interlocutaire')}
        />
        <Input
          label="Facturation"
          placeholder="30"
          error={errors.facturation?.message}
          {...register('facturation')}
        />
      </div>

      <Input
        label="Code compta"
        placeholder="411001"
        error={errors.code_compta?.message}
        {...register('code_compta')}
      />

      {isEditing && (
        <label className="flex items-center gap-2 text-sm text-steel-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-steel-700"
            {...register('actif')}
          />
          Client actif
        </label>
      )}

      <div className="flex justify-end gap-2 border-t border-surface-border pt-2">
        <Button type="submit" loading={isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}
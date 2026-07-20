'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fournisseurSchema, type FournisseurSchema } from '@/lib/schemas/lot3.schema'
import { useCreateFournisseur, useUpdateFournisseur } from '@/lib/hooks/use-lot3'
import type { Fournisseur } from '@/lib/lot3.types'

interface FournisseurFormProps {
  defaultValues?: Partial<Fournisseur> & { id?: number }
  onSuccess?: () => void
}

export function FournisseurForm({ defaultValues, onSuccess }: FournisseurFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createFournisseur = useCreateFournisseur()
  const updateFournisseur = useUpdateFournisseur()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FournisseurSchema>({
    resolver: zodResolver(fournisseurSchema) as unknown as Resolver<FournisseurSchema>,
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      reference: defaultValues?.reference ?? '',
      NIF: defaultValues?.NIF ?? '',
      STAT: defaultValues?.STAT ?? '',
      adresse: defaultValues?.adresse ?? '',
      email: defaultValues?.email ?? '',
      contact: defaultValues?.contact ?? '',
      interlocutaire: defaultValues?.interlocutaire ?? '',
      code_compta: defaultValues?.code_compta ?? '',
      actif: defaultValues?.actif ?? true,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = (values: FournisseurSchema) => {
    const payload = {
      nom: values.nom.trim(),
      reference: values.reference.trim(),
      NIF: values.NIF?.trim() || null,
      STAT: values.STAT?.trim() || null,
      adresse: values.adresse.trim(),
      email: values.email?.trim() || null,
      contact: values.contact.trim(),
      interlocutaire: values.interlocutaire?.trim() || null,
      code_compta: values.code_compta?.trim() || null,
      actif: Boolean(values.actif),
    }

    if (isEditing && defaultValues?.id) {
      updateFournisseur.mutate(
        { id: defaultValues.id, payload },
        { onSuccess },
      )
      return
    }

    createFournisseur.mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nom *"
          placeholder="CIMPA"
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Référence *"
          placeholder="FRN-001"
          error={errors.reference?.message}
          {...register('reference')}
          readOnly={isEditing}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="NIF" placeholder="1234567890" error={errors.NIF?.message} {...register('NIF')} />
        <Input label="STAT" placeholder="STAT001" error={errors.STAT?.message} {...register('STAT')} />
      </div>

      <Input
        label="Adresse *"
        placeholder="Antananarivo"
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Contact *"
          placeholder="+261 34 00 000 00"
          error={errors.contact?.message}
          {...register('contact')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="contact@fournisseur.mg"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Interlocuteur" placeholder="Jean Dupont" error={errors.interlocutaire?.message} {...register('interlocutaire')} />
        <Input label="Code compta" placeholder="CMP-001" error={errors.code_compta?.message} {...register('code_compta')} />
      </div>

      <label className="flex items-center gap-2 text-sm text-steel-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-steel-700"
          {...register('actif')}
        />
        Actif
      </label>

      <label className="flex items-center gap-2 text-sm text-steel-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-steel-700"
          {...register('est_divers')}
        />
        Fournisseur divers
      </label>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createFournisseur.isPending || updateFournisseur.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
// src/components/features/clients/client-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientSchema } from '@/lib/schemas/client.schema'
import { useCreateClient } from '@/lib/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ClientFormProps {
  defaultValues?: Partial<ClientSchema>
  onSuccess?: () => void
}

export function ClientForm({ defaultValues, onSuccess }: ClientFormProps) {
  const { mutate: create, isPending } = useCreateClient()

  const { register, handleSubmit, formState: { errors } } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  })

  const onSubmit = (data: ClientSchema) => {
    create(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nom *"
          placeholder="SHOPRITE Madagascar"
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="NIF"  placeholder="1234567890" {...register('NIF')} />
        <Input label="STAT" placeholder="############" {...register('STAT')} />
      </div>
      <Input
        label="Adresse *"
        placeholder="Andraharo, Antananarivo"
        error={errors.adresse?.message}
        {...register('adresse')}
      />
      <div className="grid grid-cols-2 gap-4">
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
          {...register('email')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Interlocuteur" placeholder="Jean Dupont" {...register('interlocutaire')} />
        <Input label="Facturation"   placeholder="30" {...register('facturation')} />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
        <Button type="submit" loading={isPending}>
          Créer le client
        </Button>
      </div>
    </form>
  )
}
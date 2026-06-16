// src/components/features/organisation/utilisateur-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  organisationUtilisateurCreateSchema,
  organisationUtilisateurEditSchema,
  type OrganisationUtilisateurCreateSchema,
  type OrganisationUtilisateurEditSchema,
} from '@/lib/schemas/organisation.schema'
import {
  useCreateUser,
  useUpdateUser,
} from '@/lib/hooks/use-organisation'
import type {
  OrganisationLocation,
  OrganisationRole,
  OrganisationUtilisateur,
} from '@/lib/organisation.types'

interface UtilisateurFormProps {
  defaultValues?: Partial<OrganisationUtilisateur> & { id?: number }
  roles: OrganisationRole[]
  locations: OrganisationLocation[]
  onSuccess?: () => void
}

type FormValues = OrganisationUtilisateurCreateSchema | OrganisationUtilisateurEditSchema

export function UtilisateurForm({
  defaultValues,
  roles,
  locations,
  onSuccess,
}: UtilisateurFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const schema = isEditing ? organisationUtilisateurEditSchema : organisationUtilisateurCreateSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any, // Cast resolver to bypass the schema type gap
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      email: defaultValues?.email ?? '',
      password: '',
      role_id: defaultValues?.role?.id ?? 0,
      location_id: defaultValues?.location?.id ?? 0,
      actif: defaultValues?.actif ?? true,
    } as FormValues,
  })

  useEffect(() => {
    reset({
      nom: defaultValues?.nom ?? '',
      email: defaultValues?.email ?? '',
      password: '',
      role_id: defaultValues?.role?.id ?? 0,
      location_id: defaultValues?.location?.id ?? 0,
      actif: defaultValues?.actif ?? true,
    } as FormValues)
  }, [defaultValues, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      nom: values.nom,
      email: values.email,
      role_id: Number(values.role_id),
      location_id: Number(values.location_id),
      actif: Boolean(values.actif),
      ...(values.password ? { password: values.password } : {}),
    }

    if (isEditing && defaultValues?.id) {
      updateUser.mutate(
        { id: defaultValues.id, payload },
        { onSuccess }
      )
      return
    }

    createUser.mutate(payload as OrganisationUtilisateurCreateSchema, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nom complet *"
          placeholder="Jean Dupont"
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Email *"
          type="email"
          placeholder="utilisateur@cmp.mg"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Rôle *"
          options={roles.map((role) => ({
            value: role.id,
            label: role.nom,
          }))}
          placeholder="Choisir le rôle"
          error={errors.role_id?.message}
          {...register('role_id', { valueAsNumber: true })}
        />

        <Select
          label="Location *"
          options={locations.map((location) => ({
            value: location.id,
            label: `${location.nom} (${location.type})`,
          }))}
          placeholder="Choisir la location"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
      </div>

      <Input
        label={isEditing ? 'Nouveau mot de passe' : 'Mot de passe *'}
        type="password"
        placeholder={isEditing ? 'Laisser vide pour ne pas changer' : 'Mot de passe sécurisé'}
        error={(errors as Record<string, { message?: string }>).password?.message}
        {...register('password' as never)}
      />

      <label className="flex items-center gap-2 text-sm text-steel-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-steel-700"
          {...register('actif')}
        />
        Compte actif
      </label>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createUser.isPending || updateUser.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
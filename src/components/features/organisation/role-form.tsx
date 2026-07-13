'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  organisationRoleSchema,
  type OrganisationRoleSchema,
} from '@/lib/schemas/organisation.schema'
import { useCreateRole, useUpdateRole } from '@/lib/hooks/use-organisation'

interface RoleFormProps {
  defaultValues?: Partial<OrganisationRoleSchema> & { id?: number }
  onSuccess?: () => void
}

type RoleFormValues = z.input<typeof organisationRoleSchema>

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function RoleForm({ defaultValues, onSuccess }: RoleFormProps) {
  const isEditing = Boolean(defaultValues?.id)
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(organisationRoleSchema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      description: defaultValues?.description ?? '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = (values: RoleFormValues) => {
    const payload = {
      nom: values.nom.trim(),
      description: normalizeOptionalText(values.description),
    }

    if (isEditing && defaultValues?.id) {
      updateRole.mutate(
        { id: defaultValues.id, payload },
        { onSuccess },
      )
      return
    }

    createRole.mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom du rôle *"
        placeholder="commercial"
        error={errors.nom?.message}
        {...register('nom')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Description</label>
        <textarea
          rows={4}
          placeholder="Description du rôle"
          className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createRole.isPending || updateRole.isPending}>
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
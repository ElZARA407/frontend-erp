// src/components/features/catalogue/categorie-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  catalogueCategorySchema,
  type CatalogueCategorySchema,
} from '@/lib/schemas/catalogue.schema'
import { useCreateCategory } from '@/lib/hooks/use-catalogue'

interface CategorieFormProps {
  onSuccess?: () => void
}

export function CategorieForm({ onSuccess }: CategorieFormProps) {
  const createCategory = useCreateCategory()

  const { register, handleSubmit, formState: { errors } } = useForm<CatalogueCategorySchema>({
    resolver: zodResolver(catalogueCategorySchema),
    defaultValues: {
      nom: 'INJ',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => createCategory.mutate(values, { onSuccess }))}
      className="space-y-4"
    >
      <Select
        label="Nom *"
        options={[
          { value: 'INJ', label: 'INJ' },
          { value: 'HDPE', label: 'HDPE' },
          { value: 'PET', label: 'PET' },
          { value: 'MCH', label: 'MCH' },
        ]}
        error={errors.nom?.message}
        {...register('nom')}
      />

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createCategory.isPending}>
          Créer
        </Button>
      </div>
    </form>
  )
}
import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

export const achatLineSchema = z
  .object({
    article_type: z.enum(['matiere', 'produit']),
    matiere_id: z.coerce.number().optional(),
    produit_id: z.coerce.number().optional(),
    classement_id: z.coerce.number().optional(),
    quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
    prix_unitaire: z.coerce.number().min(0, 'Le prix doit être positif'),
    observations_ligne: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.article_type === 'matiere' && !value.matiere_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['matiere_id'],
        message: 'La matière est requise',
      })
    }

    if (value.article_type === 'produit' && !value.produit_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['produit_id'],
        message: 'Le produit MCH est requis',
      })
    }

    if (value.article_type === 'produit' && !value.classement_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['classement_id'],
        message: 'Le classement est requis',
      })
    }
  })

export const achatSchema = z.object({
  fournisseur_id: z.coerce.number().int().positive('Le fournisseur est requis'),
  date: z.string().min(1, 'La date est requise'),
  location_id: z.coerce.number().int().positive('Le site est requis'),
  vehicule: optionalText,
  observations: optionalText,
  lignes: z.array(achatLineSchema).min(1, 'Ajoutez au moins une ligne'),
})

export type AchatSchema = z.infer<typeof achatSchema>
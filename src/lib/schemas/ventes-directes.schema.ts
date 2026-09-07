import { z } from 'zod'
import { hasDuplicateBy, todayString } from './schema-utils'

export const venteDirecteLineSchema = z.object({
  produit_id: z.coerce.number().int().positive('Le produit est requis'),
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
  prix_unitaire: z.coerce.number().positive('Le prix unitaire doit être supérieur à 0'),
})

export const venteDirecteSchema = z
  .object({
    client_id: z.coerce.number().int().positive('Le client est requis'),
    date: z.string().min(1, 'La date est requise'),
    location_id: z.coerce.number().int().positive('La location est requise'),
    lignes: z.array(venteDirecteLineSchema).min(1, 'Ajoutez au moins une ligne'),
  })
  .superRefine((values, ctx) => {
    if (values.date > todayString()) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Une vente directe ne doit pas être datée dans le futur',
      })
    }

    if (hasDuplicateBy(values.lignes, (line) => `${line.produit_id}-${line.classement_id}`)) {
      ctx.addIssue({
        code: 'custom',
        path: ['lignes'],
        message: 'Un même produit avec le même classement ne doit pas être répété',
      })
    }
  })

export type VenteDirecteSchema = z.infer<typeof venteDirecteSchema>
export type VenteDirecteLineSchema = z.infer<typeof venteDirecteLineSchema>
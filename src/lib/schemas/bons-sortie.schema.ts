import { z } from 'zod'
import { hasDuplicateBy, optionalPositiveInt, optionalText } from './schema-utils'

export const bonSortieLineSchema = z.object({
  produit_id: z.coerce.number().int().positive('Le produit est requis'),
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
})

export const bonSortieSchema = z
  .object({
    location_id: z.coerce.number().int().positive('La location source est requise'),
    destination_location_id: optionalPositiveInt,
    date: z.string().min(1, 'La date est requise'),
    motif: z.enum([
      'transfert',
      'echantillon',
      'perte',
      'casse',
      'consommation_interne',
      'don',
      'destruction',
      'autre',
      'usage_interne',
    ]),
    client_id: optionalPositiveInt,
    motif_detail: optionalText,
    observations: optionalText,
    lignes: z.array(bonSortieLineSchema).min(1, 'Ajoutez au moins une ligne'),
  })
  .superRefine((values, ctx) => {
    if (values.motif === 'transfert' && !values.destination_location_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['destination_location_id'],
        message: 'La destination est requise pour un transfert',
      })
    }

    if (
      values.motif === 'transfert' &&
      values.destination_location_id &&
      Number(values.destination_location_id) === Number(values.location_id)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['destination_location_id'],
        message: 'La destination doit être différente de la localisation source',
      })
    }

    if (values.motif === 'echantillon' && !values.client_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['client_id'],
        message: 'Le client est requis pour un échantillon',
      })
    }

    if (
      ['perte', 'casse', 'destruction', 'autre'].includes(values.motif) &&
      (!values.motif_detail || values.motif_detail.length < 3)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['motif_detail'],
        message: 'Précisez le motif avec au moins 3 caractères',
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

export type BonSortieSchema = z.infer<typeof bonSortieSchema>
export type BonSortieLineSchema = z.infer<typeof bonSortieLineSchema>
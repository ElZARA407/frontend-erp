import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().int().positive().optional())

export const bonSortieLineSchema = z.object({
  produit_id: z.coerce.number().int().positive('Le produit est requis'),
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
})

export const bonSortieSchema = z
  .object({
    location_id: z.coerce.number().int().positive('La location est requise'),
    destination_location_id: optionalNumber,
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
    client_id: optionalNumber,
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

    if (values.motif === 'echantillon' && !values.client_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['client_id'],
        message: 'Le client est requis pour un échantillon',
      })
    }

    if (
      ['perte', 'casse', 'destruction', 'autre'].includes(values.motif) &&
      !values.motif_detail
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['motif_detail'],
        message: 'Le détail du motif est requis',
      })
    }
  })

export type BonSortieSchema = z.infer<typeof bonSortieSchema>
export type BonSortieLineSchema = z.infer<typeof bonSortieLineSchema>
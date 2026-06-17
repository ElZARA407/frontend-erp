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
}, z.number().optional())

export const bonSortieLineSchema = z.object({
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
})

export const bonSortieSchema = z.object({
  location_id: z.coerce.number().int().positive('La location est requise'),
  date: z.string().min(1, 'La date est requise'),
  motif: z.enum(['usage_interne', 'perte', 'echantillon', 'don', 'autre']),
  client_id: optionalNumber,
  observations: optionalText,
  lignes: z.array(bonSortieLineSchema).min(1, 'Ajoutez au moins une ligne'),
})

export type BonSortieSchema = z.infer<typeof bonSortieSchema>
export type BonSortieLineSchema = z.infer<typeof bonSortieLineSchema>
// src/lib/schemas/achat.schema.ts
import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

export const achatLineSchema = z.object({
  matiere_id: z.coerce.number().int().positive('La matière est requise'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
  prix_unitaire: z.coerce.number().min(0, 'Le prix doit être positif'),
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
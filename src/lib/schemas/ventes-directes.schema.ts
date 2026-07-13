import { z } from 'zod'

export const venteDirecteLineSchema = z.object({
  produit_id: z.coerce.number().int().positive('Le produit est requis'),
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
  prix_unitaire: z.coerce.number().min(0, 'Le prix unitaire doit être positif'),
})

export const venteDirecteSchema = z.object({
  client_id: z.coerce.number().int().positive('Le client est requis'),
  date: z.string().min(1, 'La date est requise'),
  location_id: z.coerce.number().int().positive('La location est requise'),
  lignes: z.array(venteDirecteLineSchema).min(1, 'Ajoutez au moins une ligne'),
})

export type VenteDirecteSchema = z.infer<typeof venteDirecteSchema>
export type VenteDirecteLineSchema = z.infer<typeof venteDirecteLineSchema>
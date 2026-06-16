// src/lib/schemas/production.schema.ts
import { z } from 'zod'

export const bonProductionSchema = z.object({
  date:                z.string().min(1, 'Date requise'),
  // 💡 Changed required_error to message below:
  location_id:         z.number({ message: 'Site requis' }).int().positive(),
  produit_id:          z.number({ message: 'Produit requis' }).int().positive(),
  machine_production:  z.string().min(1, 'Machine requise').max(100),
  quantite_cible:      z.number({ message: 'Quantité cible requise' }).positive(),
})
export type BonProductionSchema = z.infer<typeof bonProductionSchema>

export const sessionSchema = z.object({
  date_session:       z.string().min(1, 'Date requise'),
  machine_production: z.string().min(1, 'Machine requise'),
  cout_electricite:   z.number().nonnegative().optional(),
})
export type SessionSchema = z.infer<typeof sessionSchema>

// src/lib/schemas/client.schema.ts
import { z } from 'zod'

export const clientSchema = z.object({
  nom:            z.string().min(1, 'Nom requis').max(150),
  reference:      z.string().min(1, 'Référence requise').max(30),
  NIF:            z.string().max(50).optional().or(z.literal('')),
  STAT:           z.string().max(50).optional().or(z.literal('')),
  adresse:        z.string().min(1, 'Adresse requise'),
  email:          z.string().email('Format invalide').optional().or(z.literal('')),
  contact:        z.string().min(1, 'Contact requis').max(30),
  interlocutaire: z.string().max(150).optional().or(z.literal('')),
  code_compta:    z.string().max(20).optional().or(z.literal('')),
  facturation:    z.string().max(20).optional().or(z.literal('')),
})
export type ClientSchema = z.infer<typeof clientSchema>
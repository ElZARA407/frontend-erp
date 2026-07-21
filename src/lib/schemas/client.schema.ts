// src/lib/schemas/client.schema.ts
import { z } from 'zod'

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(''))

export const clientSchema = z.object({
  nom: z.string().trim().min(1, 'Nom requis').max(150),
  reference: z.string().trim().min(1, 'Référence requise').max(30),
  est_divers: z.boolean().optional(),
  NIF: optionalText(50),
  STAT: optionalText(50),
  adresse: z.string().trim().min(1, 'Adresse requise'),
  email: z.string().trim().email('Format invalide').optional().or(z.literal('')),
  contact: z.string().trim().min(1, 'Contact requis').max(30),
  interlocutaire: optionalText(150),
  code_compta: optionalText(20),
  facturation: optionalText(20),
  actif: z.boolean().optional(),
})

export type ClientSchema = z.infer<typeof clientSchema>
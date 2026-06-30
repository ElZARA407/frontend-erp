// src/lib/schemas/lot3.schema.ts
import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}, z.number().optional())

export const fournisseurSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(150, '150 caracteres maximum'),
  reference: z.string().min(1, 'La reference est requise').max(30, '30 caracteres maximum'),
  NIF: optionalText,
  STAT: optionalText,
  adresse: z.string().min(2, 'L’adresse est requise'),
  email: optionalText.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    { message: 'Email invalide' }
  ),
  contact: z.string().min(2, 'Le contact est requis').max(30, '30 caracteres maximum'),
  interlocutaire: optionalText,
  code_compta: optionalText,
  actif: z.coerce.boolean(),
})

export const contratLineSchema = z.object({
  classement_id: z.coerce.number().int().positive('Le classement est requis'),
  quantite_contractuelle: z.coerce.number().positive('La quantite doit etre superieure a 0'),
  frequence: z.enum(['hebdomadaire', 'bimensuel', 'mensuel']),
  prix_unitaire: z.coerce.number().min(0, 'Le prix doit etre positif'),
})

export const contratSchema = z.object({
  client_id: z.coerce.number().int().positive('Le client est requis'),
  mois: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format attendu: AAAA-MM'),
  lignes: z.array(contratLineSchema).min(1, 'Ajoutez au moins une ligne'),
})

export const demandeAchatLineSchema = z.object({
  entite_type: z.enum(['matiere', 'produit']),
  entite_id: z.coerce.number().int().positive('L’article est requis'),
  quantite: z.coerce.number().positive('La quantite doit etre superieure a 0'),
  observation_ligne: optionalText,
})

export const demandeAchatSchema = z.object({
  date_demande: z.string().min(1, 'La date est requise'),
  observations: optionalText,
  lignes: z.array(demandeAchatLineSchema).min(1, 'Ajoutez au moins une ligne'),
})

export const demandeAchatUpdateSchema = z.object({
  date_demande: z.string().min(1, 'La date est requise'),
  observations: optionalText,
})

export type FournisseurSchema = z.infer<typeof fournisseurSchema>
export type ContratSchema = z.infer<typeof contratSchema>
export type DemandeAchatSchema = z.infer<typeof demandeAchatSchema>
export type DemandeAchatUpdateSchema = z.infer<typeof demandeAchatUpdateSchema>
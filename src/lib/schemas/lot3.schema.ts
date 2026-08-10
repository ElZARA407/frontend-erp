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
  est_divers: z.coerce.boolean().optional(),
})

export const contratLineSchema = z
  .object({
    produit_id: z.coerce.number().int().positive('Le produit est requis'),
    classement_id: z.coerce.number().int().positive('Le classement est requis'),
    quantite_contractuelle: z.coerce.number().positive('La quantite doit etre superieure a 0'),
    frequence: z.enum([
      'quotidienne',
      'hebdomadaire',
      'bimensuel',
      'mensuel',
      'tous_x_jours',
      'personnalisee',
    ]),
    frequence_jours: optionalNumber.nullable().optional(),
    date_debut: optionalText.nullable().optional(),
    date_fin: optionalText.nullable().optional(),
    prix_unitaire: z.coerce.number().min(0, 'Le prix doit etre positif'),
  })
  .superRefine((value, ctx) => {
    if (value.frequence === 'tous_x_jours' && !value.frequence_jours) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['frequence_jours'],
        message: 'Le nombre de jours est requis',
      })
    }

    if (value.date_debut && value.date_fin && value.date_fin < value.date_debut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_fin'],
        message: 'La date fin doit etre apres la date debut',
      })
    }
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
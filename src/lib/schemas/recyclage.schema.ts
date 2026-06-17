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

export const bonTransformationSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  location_id: z.coerce.number().int().positive('Le site est requis'),
  matiere_brute_id: z.coerce.number().int().positive('La matière brute est requise'),
  matiere_broyee_id: z.coerce.number().int().positive('La matière broyée est requise'),
  machine_broyage: z.string().min(1, 'La machine est requise').max(100, '100 caractères maximum'),
  quantite_entree: z.coerce.number().positive('La quantité doit être supérieure à 0'),
})

export const btSessionSchema = z.object({
  date_session: z.string().min(1, 'La date est requise'),
  machine_broyage: z.string().min(1, 'La machine est requise').max(100, '100 caractères maximum'),
})

export const btMatiereSchema = z.object({
  matiere_id: z.coerce.number().int().positive('La matière est requise'),
  type: z.enum(['entree', 'sortie']),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
  quantite_restituee: optionalNumber,
})

export const btEmployeSchema = z.object({
  employe_id: z.coerce.number().int().positive('L’employé est requis'),
  heures_brutes: z.coerce.number().positive('Les heures doivent être supérieures à 0'),
})

export const btEvenementSchema = z.object({
  type_evenement: z.enum(['broyage', 'pause', 'panne', 'autre']),
  heure_debut: z.string().min(1, 'L’heure de début est requise'),
  heure_fin: optionalText,
  description: optionalText,
})

export type BonTransformationSchema = z.infer<typeof bonTransformationSchema>
export type BtSessionSchema = z.infer<typeof btSessionSchema>
export type BtMatiereSchema = z.infer<typeof btMatiereSchema>
export type BtEmployeSchema = z.infer<typeof btEmployeSchema>
export type BtEvenementSchema = z.infer<typeof btEvenementSchema>
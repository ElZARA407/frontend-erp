import { z } from 'zod'

function emptyToUndefined(value: unknown) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().max(500, 'Maximum 500 caractères').optional()
)

const optionalNumber = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '') return undefined
      const parsed = Number(trimmed)
      return Number.isNaN(parsed) ? value : parsed
    }

    return value
  },
  z.number().min(0, 'La valeur doit être positive').optional()
)

export const bonProductionSchema = z.object({
  date: z.string().min(1, 'Date requise'),
  location_id: z.coerce.number().int().positive('Site requis'),
  produit_id: z.coerce.number().int().positive('Produit requis'),
  machine_production: z.string().trim().min(1, 'Machine requise').max(100),
  quantite_cible: z.coerce.number().positive('Quantité cible requise'),
})
export type BonProductionSchema = z.infer<typeof bonProductionSchema>

export const sessionSchema = z.object({
  date_session: z.string().min(1, 'Date requise'),
  machine_production: z.string().trim().min(1, 'Machine requise').max(100),
  cout_electricite: optionalNumber,
})
export type SessionSchema = z.infer<typeof sessionSchema>

export const bpMatiereSchema = z.object({
  matiere_id: z.coerce.number().int().positive('Matière requise'),
  quantite_utilisee: z.coerce.number().positive('Quantité utilisée requise'),
  quantite_restituee: optionalNumber,
})
export type BpMatiereSchema = z.infer<typeof bpMatiereSchema>

export const bpObtenuSchema = z.object({
  classement_id: z.coerce.number().int().positive('Classement requis'),
  quantite_produite: z.coerce.number().positive('Quantité produite requise'),
  destination_location_id: z.coerce.number().int().positive('Destination requise'),
})
export type BpObtenuSchema = z.infer<typeof bpObtenuSchema>

export const bpEmployeSchema = z.object({
  employe_id: z.coerce.number().int().positive('Employé requis'),
  heures_brutes: z.coerce.number().positive('Heures requises'),
})
export type BpEmployeSchema = z.infer<typeof bpEmployeSchema>

export const bpEvenementSchema = z.object({
  type_evenement: z.enum(['production', 'pause', 'panne', 'autre']),
  heure_debut: z.string().min(1, 'Heure début requise'),
  heure_fin: optionalText,
  description: optionalText,
})
export type BpEvenementSchema = z.infer<typeof bpEvenementSchema>
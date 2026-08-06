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
  machine_id: z.coerce.number().int().positive('La machine est requise'),
  quantite_entree: z.coerce.number().positive('La quantité prévue doit être supérieure à 0'),
  observations: optionalText,
})

export const btSessionSchema = z.object({
  date_session: z.string().min(1, 'La date est requise'),
  machine_id: z.coerce.number().int().positive('La machine est requise'),
  sorties: z.array(
    z.object({
      quantite_utilisee: z.coerce.number().positive('La quantité utilisée est requise'),
      quantite_restituee: z.coerce.number().min(0).optional(),
    }).refine(
      (value) => (value.quantite_restituee ?? 0) <= value.quantite_utilisee,
      {
        message: 'La quantité restituée ne peut pas dépasser la quantité utilisée',
        path: ['quantite_restituee'],
      }
    )
  ).min(1, 'Ajoute au moins une sortie de matière brute'),
  entrees: z.array(
    z.object({
      matiere_id: z.coerce.number().int().positive('La matière broyée est requise'),
      quantite: z.coerce.number().positive('La quantité produite est requise'),
    })
  ).min(1, 'Ajoute au moins une matière broyée obtenue'),
  employes: z.array(
    z.object({
      employe_id: z.coerce.number().int().positive('L’employé est requis'),
      heures_brutes: optionalNumber,
    })
  ).optional(),
  evenements: z.array(
    z.object({
      type_evenement: z.enum(['broyage', 'pause', 'panne', 'autre']),
      heure_debut: z.string().min(1, 'L’heure de début est requise'),
      heure_fin: optionalText,
      description: optionalText,
    })
  ).optional(),
})

export type BonTransformationSchema = z.infer<typeof bonTransformationSchema>
export type BtSessionSchema = z.infer<typeof btSessionSchema>
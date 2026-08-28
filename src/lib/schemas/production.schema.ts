import { z } from 'zod'
import {
  hasDuplicateBy,
  optionalLongText,
  optionalPositiveNumber,
  optionalText,
} from './schema-utils'

function timeToMinutes(value?: string | null) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

function isEndAfterStart(start?: string | null, end?: string | null) {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)

  if (startMinutes === null || endMinutes === null) return true
  return endMinutes > startMinutes
}

export const bonProductionSchema = z.object({
  date: z.string().min(1, 'Date requise'),
  location_id: z.coerce.number().int().positive('Site requis'),
  produit_id: z.coerce.number().int().positive('Produit requis'),
  machine_id: z.coerce.number().int().positive('Machine requise'),
  quantite_cible: z.coerce.number().positive('La quantité cible doit être supérieure à 0'),
})

export type BonProductionSchema = z.infer<typeof bonProductionSchema>

export const bpMatiereSchema = z
  .object({
    matiere_id: z.coerce.number().int().positive('Matière requise'),
    quantite_utilisee: z.coerce.number().positive('La quantité utilisée doit être supérieure à 0'),
    quantite_restituee: optionalPositiveNumber,
  })
  .superRefine((value, ctx) => {
    if ((value.quantite_restituee ?? 0) > value.quantite_utilisee) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantite_restituee'],
        message: 'La quantité restituée ne peut pas dépasser la quantité utilisée',
      })
    }
  })

export type BpMatiereSchema = z.infer<typeof bpMatiereSchema>

export const bpObtenuSchema = z.object({
  produit_id: z.coerce.number().int().positive('Produit requis'),
  classement_id: z.coerce.number().int().positive('Classement requis'),
  quantite_produite: z.coerce.number().positive('La quantité produite doit être supérieure à 0'),
  destination_location_id: z.coerce.number().int().positive('Destination requise'),
})

export type BpObtenuSchema = z.infer<typeof bpObtenuSchema>

export const bpEmployeSchema = z.object({
  employe_id: z.coerce.number().int().positive('Employé requis'),
  heures_brutes: optionalPositiveNumber.refine(
    (value) => value === undefined || value <= 24,
    'Les heures brutes ne peuvent pas dépasser 24 h',
  ),
})

export type BpEmployeSchema = z.infer<typeof bpEmployeSchema>

export const bpEvenementSchema = z
  .object({
    type_evenement: z.enum(['production', 'pause', 'panne', 'autre']),
    heure_debut: z.string().min(1, 'Heure début requise'),
    heure_fin: z.string().min(1, 'Heure fin requise'),
    description: optionalLongText,
  })
  .superRefine((value, ctx) => {
    if (!isEndAfterStart(value.heure_debut, value.heure_fin)) {
      ctx.addIssue({
        code: 'custom',
        path: ['heure_fin'],
        message: 'L’heure de fin doit être après l’heure de début',
      })
    }
  })

export type BpEvenementSchema = z.infer<typeof bpEvenementSchema>

export const machineSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(100, '100 caractères maximum'),
  description: optionalLongText,
})

export type MachineSchema = z.infer<typeof machineSchema>

export const sessionSchema = z
  .object({
    date_session: z.string().min(1, 'Date requise'),
    machine_id: z.coerce.number().int().positive('Machine requise'),
    cout_electricite: optionalPositiveNumber,
    matieres: z.array(bpMatiereSchema).min(1, 'Ajoutez au moins une matière consommée'),
    obtenus: z.array(bpObtenuSchema).min(1, 'Ajoutez au moins un produit obtenu'),
    employes: z.array(bpEmployeSchema).min(1, 'Ajoutez au moins un employé'),
    evenements: z.array(bpEvenementSchema).min(1, 'Ajoutez au moins un événement de production'),
  })
  .superRefine((values, ctx) => {

    const hasProductionEvent = values.evenements.some(
      (event) => event.type_evenement === 'production',
    )

    if (!hasProductionEvent) {
      ctx.addIssue({
        code: 'custom',
        path: ['evenements'],
        message: 'Ajoutez au moins un événement de type Production',
      })
    }

    if (hasDuplicateBy(values.matieres, (line) => String(line.matiere_id))) {
      ctx.addIssue({
        code: 'custom',
        path: ['matieres'],
        message: 'Une même matière ne doit pas être ajoutée plusieurs fois',
      })
    }

    if (hasDuplicateBy(values.employes, (line) => String(line.employe_id))) {
      ctx.addIssue({
        code: 'custom',
        path: ['employes'],
        message: 'Un même employé ne doit pas être ajouté plusieurs fois',
      })
    }

    if (
      hasDuplicateBy(
        values.obtenus,
        (line) => `${line.produit_id}-${line.classement_id}-${line.destination_location_id}`,
      )
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['obtenus'],
        message: 'Le même produit, classement et destination existe déjà dans les produits obtenus',
      })
    }
  })

export type SessionSchema = z.infer<typeof sessionSchema>
export type SessionBatchSchema = SessionSchema
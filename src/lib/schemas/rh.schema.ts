// src/lib/schemas/rh.schema.ts
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

const optionalDate = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

export const rhPosteSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(100, '100 caractères maximum'),
  taux_horaire: z.coerce.number().min(0, 'Le taux horaire doit être positif'),
  salaire_mensuel: optionalNumber,
})

export const rhEmployeSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis').max(20, '20 caractères maximum'),
  nom: z.string().min(2, 'Le nom est requis').max(100, '100 caractères maximum'),
  prenom: z.string().min(2, 'Le prénom est requis').max(100, '100 caractères maximum'),
  poste_id: z.coerce.number().int().positive('Le poste est requis'),
  date_embauche: z.string().min(1, 'La date d’embauche est requise'),
  date_depart: optionalDate,
  actif: z.coerce.boolean(),
})

export const rhEmployeUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(100, '100 caractères maximum'),
  prenom: z.string().min(2, 'Le prénom est requis').max(100, '100 caractères maximum'),
  poste_id: z.coerce.number().int().positive('Le poste est requis'),
  date_embauche: z.string().min(1, 'La date d’embauche est requise'),
  date_depart: optionalDate,
  actif: z.coerce.boolean(),
})

export type RhPosteSchema = z.infer<typeof rhPosteSchema>
export type RhEmployeSchema = z.infer<typeof rhEmployeSchema>
export type RhEmployeUpdateSchema = z.infer<typeof rhEmployeUpdateSchema>
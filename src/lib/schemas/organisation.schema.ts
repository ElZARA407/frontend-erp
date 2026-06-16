// src/lib/schemas/organisation.schema.ts
import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

const optionalPassword = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional())

export const organisationRoleSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(50, '50 caractères maximum'),
  description: optionalText,
})

export const organisationLocationSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(100, '100 caractères maximum'),
  type: z.enum(['bureau', 'usine'], {
    message: 'Le type est requis',
  }),
})

export const organisationUtilisateurCreateSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(150, '150 caractères maximum'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role_id: z.coerce.number().int().positive('Le rôle est requis'),
  location_id: z.coerce.number().int().positive('La location est requise'),
  actif: z.coerce.boolean(),
})

export const organisationUtilisateurEditSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(150, '150 caractères maximum'),
  email: z.string().email('Email invalide'),
  password: optionalPassword,
  role_id: z.coerce.number().int().positive('Le rôle est requis'),
  location_id: z.coerce.number().int().positive('La location est requise'),
  actif: z.coerce.boolean(),
})

export type OrganisationRoleSchema = z.infer<typeof organisationRoleSchema>
export type OrganisationLocationSchema = z.infer<typeof organisationLocationSchema>
export type OrganisationUtilisateurCreateSchema = z.infer<typeof organisationUtilisateurCreateSchema>
export type OrganisationUtilisateurEditSchema = z.infer<typeof organisationUtilisateurEditSchema>
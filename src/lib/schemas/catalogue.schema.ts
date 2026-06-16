// src/lib/schemas/catalogue.schema.ts
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

export const catalogueCategorySchema = z.object({
  nom: z.enum(['INJ', 'HDPE', 'PET', 'MCH']),
})

export const catalogueProductCreateSchema = z.object({
  nomencla: z.string().min(1, 'La nomenclature est requise').max(30, '30 caractères maximum'),
  designation: z.string().min(2, 'La désignation est requise').max(150, '150 caractères maximum'),
  categorie_id: z.coerce.number().int().positive('La catégorie est requise'),
  contenance: optionalText,
  format: optionalText,
  unite: z.string().min(1, 'L’unité est requise').max(10, '10 caractères maximum'),
  colisage: z.coerce.number().min(1, 'Le colisage doit être supérieur ou égal à 1'),
  poids: z.string().min(1, 'Le poids est requis').max(10, '10 caractères maximum'),
  actif: z.coerce.boolean(),
  prix_1er: optionalNumber,
  prix_2e: optionalNumber,
  prix_casse: optionalNumber,
})

export const catalogueProductUpdateSchema = z.object({
  designation: z.string().min(2, 'La désignation est requise').max(150, '150 caractères maximum'),
  contenance: optionalText,
  format: optionalText,
  colisage: z.coerce.number().min(1, 'Le colisage doit être supérieur ou égal à 1'),
  poids: z.string().min(1, 'Le poids est requis').max(10, '10 caractères maximum'),
  actif: z.coerce.boolean(),
})

export const catalogueMatiereCreateSchema = z.object({
  reference: z.string().min(1, 'La référence est requise').max(30, '30 caractères maximum'),
  nom: z.string().min(2, 'Le nom est requis').max(150, '150 caractères maximum'),
  type: z.enum(['preformes', 'broyee', 'brute', 'vierge', 'colorant', 'autre']),
  description: optionalText,
  unite: z.string().min(1, 'L’unité est requise').max(10, '10 caractères maximum'),
  prix_moyen: optionalNumber,
  actif: z.coerce.boolean(),
})

export const catalogueMatiereUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis').max(150, '150 caractères maximum'),
  description: optionalText,
  unite: z.string().min(1, 'L’unité est requise').max(10, '10 caractères maximum'),
  actif: z.coerce.boolean(),
})

export type CatalogueCategorySchema = z.infer<typeof catalogueCategorySchema>
export type CatalogueProductCreateSchema = z.infer<typeof catalogueProductCreateSchema>
export type CatalogueProductUpdateSchema = z.infer<typeof catalogueProductUpdateSchema>
export type CatalogueMatiereCreateSchema = z.infer<typeof catalogueMatiereCreateSchema>
export type CatalogueMatiereUpdateSchema = z.infer<typeof catalogueMatiereUpdateSchema>
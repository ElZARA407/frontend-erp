import { z } from 'zod'

const optionalClassementId = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
  z.number().int().positive().optional(),
)

export const ajustementStockSchema = z.object({
  location_id: z.coerce.number().int().positive('La location est requise'),
  entite_type: z.enum(['matiere', 'produit']),
  entite_id: z.coerce.number().int().positive('L’article est requis'),
  classement_id: optionalClassementId,
  stock_physique: z.coerce.number().min(0, 'Le stock physique ne peut pas etre negatif'),
  motif: z.string().trim().min(5, 'Le motif doit contenir au moins 5 caracteres').max(500, 'Maximum 500 caracteres'),
})

export const stockInitialSchema = z.object({
  location_id: z.coerce.number().int().positive('La location est requise'),
  entite_type: z.enum(['matiere', 'produit']),
  entite_id: z.coerce.number().int().positive('L’article est requis'),
  classement_id: optionalClassementId,
  stock_total: z.coerce.number().min(0, 'Le stock initial ne peut pas etre negatif'),
  motif: z.string().trim().max(500, 'Maximum 500 caracteres').optional(),
}).superRefine((values, ctx) => {
  if (values.entite_type === 'produit' && !values.classement_id) {
    ctx.addIssue({
      code: 'custom',
      path: ['classement_id'],
      message: 'Le classement est requis pour un produit',
    })
  }

  if (values.entite_type === 'matiere' && values.classement_id) {
    ctx.addIssue({
      code: 'custom',
      path: ['classement_id'],
      message: 'Le classement doit rester vide pour une matière',
    })
  }
})

export type AjustementStockValues = z.infer<typeof ajustementStockSchema>
export type StockInitialValues = z.infer<typeof stockInitialSchema>
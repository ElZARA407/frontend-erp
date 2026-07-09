import { z } from 'zod'

export const ajustementStockSchema = z.object({
  location_id: z.coerce.number().int().positive('La location est requise'),
  entite_type: z.enum(['matiere', 'produit']),
  entite_id: z.coerce.number().int().positive('L’article est requis'),
  classement_id: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().positive().optional()
  ),
  stock_physique: z.coerce.number().min(0, 'Le stock physique ne peut pas etre negatif'),
  motif: z.string().trim().min(5, 'Le motif doit contenir au moins 5 caracteres').max(500, 'Maximum 500 caracteres'),
})

export type AjustementStockValues = z.infer<typeof ajustementStockSchema>
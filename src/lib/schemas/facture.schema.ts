import { z } from 'zod'

export const factureCreateSchema = z.object({
  livraison_id: z.coerce.number().int().positive('La livraison est requise'),
})

export const payerFactureSchema = z.object({
  mode_paiement: z.enum(['espece', 'virement', 'cheque', 'mobile_money'], {
    message: 'Le mode de paiement est requis',
  }),
  montant_paye: z.coerce.number().positive('Le montant payé est requis'),
})

export type FactureCreateSchema = z.infer<typeof factureCreateSchema>
export type PayerFactureSchema = z.infer<typeof payerFactureSchema>
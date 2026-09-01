import { z } from 'zod'
import { hasDuplicateBy, isBefore, todayString } from './schema-utils'

export const ligneCommandeSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  produit_id: z.coerce.number().int().positive('Produit requis'),
  classement_id: z.coerce.number().int().positive('Classement requis'),
  quantite: z.coerce.number().positive('La quantité doit être supérieure à 0'),
  prix_unitaire: z.coerce.number().positive('Le prix unitaire doit être supérieur à 0'),
})

const commandeBaseSchema = z.object({
  client_id: z.coerce.number().int().positive('Client requis'),
  date: z.string().min(1, 'Date requise'),
  date_livraison_prevue: z.string().min(1, 'Date de livraison requise'),
  location_id: z.coerce.number().int().positive('Site requis'),
  echeance: z.coerce.number().int().min(0, '0 signifie paiement au comptant'),
  lignes: z.array(ligneCommandeSchema).min(1, 'Au moins une ligne requise'),
})

function buildCommandeSchema(options: { requireFutureDeliveryDate: boolean }) {
  return commandeBaseSchema.superRefine((values, ctx) => {
    if (options.requireFutureDeliveryDate && isBefore(values.date_livraison_prevue, todayString())) {
      ctx.addIssue({
        code: 'custom',
        path: ['date_livraison_prevue'],
        message: 'La date de livraison ne peut pas être antérieure à aujourd’hui',
      })
    }

    if (values.date_livraison_prevue < values.date) {
      ctx.addIssue({
        code: 'custom',
        path: ['date_livraison_prevue'],
        message: 'La date de livraison doit être après ou égale à la date de commande',
      })
    }

    if (hasDuplicateBy(values.lignes, (line) => `${line.produit_id}-${line.classement_id}`)) {
      ctx.addIssue({
        code: 'custom',
        path: ['lignes'],
        message: 'Un même produit avec le même classement ne doit pas être répété',
      })
    }
  })
}

export const commandeSchema = buildCommandeSchema({
  requireFutureDeliveryDate: true,
})

export const commandeUpdateSchema = buildCommandeSchema({
  requireFutureDeliveryDate: false,
})

export type CommandeSchema = z.infer<typeof commandeBaseSchema>
// src/lib/schemas/commande.schema.ts
import { z } from 'zod'

export const ligneCommandeSchema = z.object({
  classement_id: z.number({ message: 'Produit requis' }).int().positive(),
  quantite:      z.number({ message: 'Quantité requise' }).positive('Quantité > 0'),
  prix_unitaire: z.number({ message: 'Prix requis' }).nonnegative(),
})

export const commandeSchema = z.object({
  client_id:             z.number({ message: 'Client requis' }).int().positive(),
  date:                  z.string().min(1, 'Date requise'),
  date_livraison_prevue: z.string().optional().or(z.literal('')),
  location_id:           z.number({ message: 'Site requis' }).int().positive(),
  echeance:              z.number().int().refine(v => [15, 30, 60].includes(v), 'Échéance invalide'),
  lignes:                z.array(ligneCommandeSchema).min(1, 'Au moins une ligne requise'),
})

export type CommandeSchema = z.infer<typeof commandeSchema>

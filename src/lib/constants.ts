// src/lib/constants.ts

export const APP_NAME = 'CMP ERP'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const ROLES = {
  ADMIN:             'admin',
  RESPONSABLE_PROD:  'responsable_prod',
  OPERATEUR_SAISIE:  'operateur_saisie',
  COMMERCIAL:        'commercial',
  LOGISTIQUE:        'logistique',
  FINANCE:           'finance',
  RESPONSABLE_ACHAT: 'responsable_achat',
} as const

export const STATUT_COMMANDE_CONFIG = {
  livree:      { label: 'Livrée',               color: 'success' },
  non_livree:  { label: 'Non livrée',           color: 'warning' },
  partielle:   { label: 'Partiellement livrée', color: 'info'    },
} as const

export const STATUT_FACTURE_CONFIG = {
  en_attente:          { label: 'En attente',          color: 'muted'   },
  emise:               { label: 'Émise',               color: 'info'    },
  partiellement_payee: { label: 'Part. payée',         color: 'warning' },
  payee:               { label: 'Payée',               color: 'success' },
  annulee:             { label: 'Annulée',             color: 'danger'  },
} as const

export const STATUT_PRODUCTION_CONFIG = {
  ouvert:   { label: 'Ouvert',   color: 'info'    },
  en_cours: { label: 'En cours', color: 'warning' },
  cloture:  { label: 'Clôturé', color: 'success' },
  annule:   { label: 'Annulé',  color: 'danger'  },
} as const

export const MODES_PAIEMENT = [
  { value: 'espece',       label: 'Espèces'   },
  { value: 'virement',     label: 'Virement'  },
  { value: 'cheque',       label: 'Chèque'    },
  { value: 'mobile_money', label: 'Mobile Money' },
] as const

export const QUALITES_PRODUIT = [
  { value: '1er',   label: '1ère qualité' },
  { value: '2e',    label: '2ème qualité' },
  { value: 'casse', label: 'Casse'        },
] as const

export const MOTIFS_SORTIE = [
  { value: 'usage_interne', label: 'Usage interne' },
  { value: 'perte',         label: 'Perte'         },
  { value: 'echantillon',   label: 'Échantillon'   },
  { value: 'don',           label: 'Don'           },
  { value: 'autre',         label: 'Autre'         },
] as const

export const DEFAULT_PAGE_SIZE = 20

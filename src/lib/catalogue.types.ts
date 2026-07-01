// src/lib/catalogue.types.ts
import type { PaginatedResponse, Stock } from '@/lib/types'

export type CatalogueCategoryName = 'INJ' | 'HDPE' | 'PET' | 'MCH'
export type CatalogueMatiereType = 'preformes' | 'broyee' | 'brute' | 'vierge' | 'colorant' | 'autre'
export type CatalogueProductQuality = '1er' | '2e' | 'casse'

export interface CatalogueCategory {
  id: number
  nom: CatalogueCategoryName
  produits_count?: number
  created_at?: string
}

export interface CatalogueProductClassment {
  id: number
  qualite: CatalogueProductQuality
  qualite_libelle: string
  prix_specifique: number | null
  actif: boolean
  stock_disponible?: number
  produit?: {
    id: number
    nomencla: string
    designation: string
  }
}

export interface CatalogueProduct {
  id: number
  nomencla: string
  designation: string
  contenance: string | null
  format: string | null
  unite: string
  colisage: number
  poids: string
  actif: boolean
  categorie?: {
    id: number
    nom: CatalogueCategoryName
  }
  stocks_par_qualite?: Array<{
    classement_id: number
    qualite: string
    libelle: string
    stock_total: number
  }>
  created_at?: string
}

export interface CatalogueMatiere {
  id: number
  reference: string
  nom: string
  type: CatalogueMatiereType
  description: string | null
  unite: string
  prix_moyen: number
  actif: boolean
  stock_total?: number
  en_rupture?: boolean
  created_at?: string
}

export interface CatalogueCategoryPayload {
  nom: CatalogueCategoryName
}

export interface CatalogueProductCreatePayload {
  nomencla: string
  designation: string
  categorie_id: number
  contenance?: string | null
  format?: string | null
  unite: string
  colisage: number
  poids: string
  actif: boolean
  classements: Array<{
    qualite: CatalogueProductQuality
    prix_specifique?: number | null
  }>
}

export interface CatalogueProductUpdatePayload {
  designation: string
  contenance?: string | null
  format?: string | null
  colisage: number
  poids: string
  actif: boolean
}

export interface CatalogueMatiereCreatePayload {
  reference: string
  nom: string
  type: CatalogueMatiereType
  description?: string | null
  unite: string
  prix_moyen?: number | null
  actif: boolean
}

export interface CatalogueMatiereUpdatePayload {
  nom: string
  description?: string | null
  unite: string
  actif: boolean
}

export interface CatalogueProductFilters {
  search?: string
  categorie_id?: number
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown
}

export interface CatalogueMatiereFilters {
  search?: string
  type?: string
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type CatalogueProductsPage = PaginatedResponse<CatalogueProduct>
export type CatalogueMatieresPage = PaginatedResponse<CatalogueMatiere>
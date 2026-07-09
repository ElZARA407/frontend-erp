import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { catalogueApi } from '@/lib/api/catalogue'
import type {
  CatalogueCategoryPayload,
  CatalogueMatiereCreatePayload,
  CatalogueMatiereFilters,
  CatalogueMatiereUpdatePayload,
  CatalogueProductCreatePayload,
  CatalogueProductFilters,
  CatalogueProductUpdatePayload,
} from '@/lib/catalogue.types'

export const CATALOGUE_KEYS = {
  categories: ['catalogue', 'categories'] as const,
  products: ['catalogue', 'products'] as const,
  matieres: ['catalogue', 'matieres'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: CATALOGUE_KEYS.categories,
    queryFn: catalogueApi.listCategories,
    staleTime: 60_000,
  })
}

export function useProducts(filters: CatalogueProductFilters = {}) {
  return useQuery({
    queryKey: [...CATALOGUE_KEYS.products, filters],
    queryFn: () => catalogueApi.listProducts(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [...CATALOGUE_KEYS.products, id],
    queryFn: () => catalogueApi.getProduct(id),
    enabled: !!id,
  })
}

export function useMatieres(filters: CatalogueMatiereFilters = {}) {
  return useQuery({
    queryKey: [...CATALOGUE_KEYS.matieres, filters],
    queryFn: () => catalogueApi.listMatieres(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useMatiere(id: number) {
  return useQuery({
    queryKey: [...CATALOGUE_KEYS.matieres, id],
    queryFn: () => catalogueApi.getMatiere(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CatalogueCategoryPayload) => catalogueApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.categories })
      toast.success('Catégorie créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la catégorie.'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => catalogueApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.categories })
      toast.success('Catégorie supprimée.')
    },
    onError: () => toast.error('Impossible de supprimer cette catégorie.'),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CatalogueProductCreatePayload) => catalogueApi.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.products })
      toast.success('Produit créé.')
    },
    onError: () => toast.error('Erreur lors de la création du produit.'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CatalogueProductUpdatePayload }) =>
      catalogueApi.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.products })
      toast.success('Produit mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour du produit.'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => catalogueApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.products })
      toast.success('Produit archivé.')
    },
    onError: () => toast.error('Impossible d’archiver ce produit.'),
  })
}

export function useImportProducts() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) => catalogueApi.importProducts(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.products })
      toast.success('Import produits terminé.')
    },
    onError: () => toast.error('Erreur lors de l’import Excel des produits.'),
  })
}

export function useCreateMatiere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CatalogueMatiereCreatePayload) => catalogueApi.createMatiere(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.matieres })
      toast.success('Matière première créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la matière première.'),
  })
}

export function useUpdateMatiere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CatalogueMatiereUpdatePayload }) =>
      catalogueApi.updateMatiere(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.matieres })
      toast.success('Matière première mise à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour de la matière première.'),
  })
}

export function useDeleteMatiere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => catalogueApi.deleteMatiere(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.matieres })
      toast.success('Matière première archivée.')
    },
    onError: () => toast.error('Impossible d’archiver cette matière première.'),
  })
}

export function useImportMatieres() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) => catalogueApi.importMatieres(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.matieres })
      toast.success('Import matières terminé.')
    },
    onError: () => toast.error('Erreur lors de l’import Excel des matières.'),
  })
}
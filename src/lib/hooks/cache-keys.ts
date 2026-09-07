import type { QueryClient } from '@tanstack/react-query'

export const CACHE_KEYS = {
  dashboard: ['dashboard'] as const,
  reports: ['rapports'] as const,

  catalogue: ['catalogue'] as const,
  stocks: ['stocks'] as const,
  mouvements: ['stocks', 'mouvements'] as const,

  commandes: ['commandes'] as const,
  ventesDirectes: ['ventes-directes'] as const,
  livraisons: ['livraisons'] as const,
  factures: ['factures'] as const,
  bonsSortie: ['bons-sortie'] as const,

  achats: ['achats'] as const,
  production: ['production'] as const,
  recyclage: ['recyclage'] as const,
}

export function invalidateStockImpact(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.stocks })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.mouvements })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.catalogue })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.dashboard })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.reports })
}

export function invalidateCommercialImpact(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.commandes })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.ventesDirectes })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.livraisons })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.factures })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.bonsSortie })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.catalogue })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.dashboard })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.reports })
}

export function invalidateAchatImpact(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.achats })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.stocks })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.mouvements })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.catalogue })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.dashboard })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.reports })
}

export function invalidateProductionImpact(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.production })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.stocks })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.mouvements })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.catalogue })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.dashboard })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.reports })
}

export function invalidateRecyclageImpact(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.recyclage })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.stocks })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.mouvements })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.catalogue })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.dashboard })
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.reports })
}
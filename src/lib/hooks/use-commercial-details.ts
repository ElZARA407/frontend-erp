// src/lib/hooks/use-commercial-details.ts
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { clientsApi } from '@/lib/api/clients'
import { lot3Api } from '@/lib/api/lot3'
import { livraisonsApi } from '@/lib/api/livraisons'
import type { ApiResponse } from '@/lib/types'
import type { Contrat, Fournisseur } from '@/lib/lot3.types'
import { buildQueryString } from '@/lib/utils'

export interface ClientEncoursFacture {
  numero: string
  date: string | null
  total: number
  echeance: string | null
  jours_retard: number
}

export interface ClientEncoursResponse {
  client_id: number
  client_nom: string
  encours_total: number
  factures: ClientEncoursFacture[]
}

export interface ClientHistoriqueResponse {
  client_id: number
  annee: string
  ca_annuel: number
  nb_commandes: number
  nb_factures: number
}

export const COMMERCIAL_DETAIL_KEYS = {
  clientEncours: ['commercial', 'client-encours'] as const,
  clientHistorique: ['commercial', 'client-historique'] as const,
  fournisseur: ['commercial', 'fournisseur'] as const,
  contrat: ['commercial', 'contrat'] as const,
  livraison: ['commercial', 'livraison'] as const,
}

export function useClientEncours(clientId?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.clientEncours, clientId],
    queryFn: async () => {
      const data = await clientsApi.encours(clientId as number)
      return data as ClientEncoursResponse
    },
    enabled: clientId !== undefined && clientId !== null,
    staleTime: 30_000,
  })
}

export function useClientHistorique(clientId?: number, annee?: string) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.clientHistorique, clientId, annee],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ClientHistoriqueResponse>>(
        `/commercial/clients/${clientId}/historique${buildQueryString({ annee })}`
      )
      return data.data
    },
    enabled: clientId !== undefined && clientId !== null && !!annee,
    staleTime: 30_000,
  })
}

export function useFournisseurDetail(fournisseurId?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.fournisseur, fournisseurId],
    queryFn: () => lot3Api.fournisseurs.get(fournisseurId as number),
    enabled: fournisseurId !== undefined && fournisseurId !== null,
    staleTime: 60_000,
  })
}

export function useContratDetail(contratId?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.contrat, contratId],
    queryFn: () => lot3Api.contrats.get(contratId as number),
    enabled: contratId !== undefined && contratId !== null,
    staleTime: 60_000,
  })
}

export function useLivraisonDetail(livraisonId?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.livraison, livraisonId],
    queryFn: () => livraisonsApi.get(livraisonId as number),
    enabled: livraisonId !== undefined && livraisonId !== null,
    staleTime: 60_000,
  })
}
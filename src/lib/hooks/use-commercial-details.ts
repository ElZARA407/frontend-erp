import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { buildQueryString } from '@/lib/utils'
import type { Client, Fournisseur, ApiResponse } from '@/lib/types'
import { lot3Api } from '../api/lot3'
import { livraisonsApi } from '../api/livraisons'

export interface ClientHistoriqueResponse {
  annee: number
  ca_annuel: number
  total_commandes: number
  total_ventes_directes: number
  total_facture: number
  total_paye: number
  reste_a_payer: number
  nb_commandes: number
  nb_ventes_directes: number
  nb_livraisons: number
  nb_factures: number
  commandes: Array<{
    id: number
    numero: string
    date: string | null
    statut: unknown
    total: number
    location: string | null
  }>
  ventes_directes: Array<{
    id: number
    numero: string
    date: string | null
    statut: unknown
    total: number
    location: string | null
  }>
  livraisons: Array<{
    id: number
    numero: string
    date_livraison: string | null
    statut: string
    source_type: string
    source_id: number
    est_facturee: boolean
  }>
  factures: Array<{
    id: number
    numero: string
    date_facture: string | null
    statut: unknown
    montant_total: number
    montant_paye: number
    reste_a_payer: number
  }>
}

export interface FournisseurHistoriqueResponse {
  annee: number
  total_achats: number
  total_valide: number
  total_brouillon: number
  nb_achats: number
  nb_valides: number
  nb_brouillons: number
  achats: Array<{
    id: number
    numero: string
    date: string | null
    vehicule: string | null
    statut: string
    total: number
    location: string | null
    lignes_count: number
    lignes: Array<{
      id: number
      matiere: {
        id: number
        reference: string
        nom: string
      } | null
      quantite: number
      prix_unitaire: number
      total_ligne: number
    }>
  }>
}

export const COMMERCIAL_DETAIL_KEYS = {
  client: ['commercial', 'client'] as const,
  fournisseur: ['commercial', 'fournisseur'] as const,
  clientHistorique: ['commercial', 'client-historique'] as const,
  fournisseurHistorique: ['commercial', 'fournisseur-historique'] as const,
  contrat: ['commercial', 'contrat'] as const,
  livraison: ['commercial', 'livraison'] as const,
}

export function useClient(clientId: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.client, clientId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Client>>(
        `/commercial/clients/${clientId}`
      )
      return data.data
    },
    enabled: clientId > 0,
  })
}

export function useFournisseur(fournisseurId: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.fournisseur, fournisseurId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Fournisseur>>(
        `/commercial/fournisseurs/${fournisseurId}`
      )
      return data.data
    },
    enabled: fournisseurId > 0,
  })
}

export function useClientHistorique(clientId: number, annee?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.clientHistorique, clientId, annee],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ClientHistoriqueResponse>>(
        `/commercial/clients/${clientId}/historique${buildQueryString({ annee })}`
      )
      return data.data
    },
    enabled: clientId > 0,
  })
}

export function useFournisseurHistorique(fournisseurId: number, annee?: number) {
  return useQuery({
    queryKey: [...COMMERCIAL_DETAIL_KEYS.fournisseurHistorique, fournisseurId, annee],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<FournisseurHistoriqueResponse>>(
        `/commercial/fournisseurs/${fournisseurId}/historique${buildQueryString({ annee })}`
      )
      return data.data
    },
    enabled: fournisseurId > 0,
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
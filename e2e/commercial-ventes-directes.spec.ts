import { expect, test } from '@playwright/test'
import { loginAs } from './helpers/auth'
import {
  apiData,
  bffJson,
  paginatedItems,
  plainItems,
} from './helpers/bff'

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
}

type Client = {
  id: number
  reference: string
  nom: string
}

type Location = {
  id: number
  nom: string
}

type Classement = {
  id: number
  qualite: string
  actif: boolean
}

type Produit = {
  id: number
  nomencla: string
  designation: string
}

type LigneCommande = {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  prix_unitaire: number
}

type Commande = {
  id: number
  numero: string
  lignes: LigneCommande[]
}

type VenteDirecte = {
  id: number
  numero: string
  statut: string | { valeur?: string }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function idempotencyKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

test.describe('ERP CMP — commercial et ventes directes via BFF', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('création d’une commande avec les références E2E', async ({ page }) => {
    const clientsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/commercial/clients?search=E2E-CLIENT-001&actif=true&per_page=10',
    )

    const locationsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/organisation/locations?search=E2E%20Usine%20principale',
    )

    const productsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/catalogue/produits?search=E2E-PF-001&actif=true&per_page=10',
    )

    const classementsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/catalogue/classements',
    )

    const client = paginatedItems<Client>(clientsPayload).find(
      (item) => item.reference === 'E2E-CLIENT-001',
    )

    const location = plainItems<Location>(locationsPayload).find(
      (item) => item.nom === 'E2E Usine principale',
    )

    const product = paginatedItems<Produit>(productsPayload).find(
      (item) => item.nomencla === 'E2E-PF-001',
    )

    const classement = plainItems<Classement>(classementsPayload).find(
      (item) => item.qualite === '1er' && item.actif,
    )

    expect(client, 'Client E2E introuvable.').toBeTruthy()
    expect(location, 'Location E2E introuvable.').toBeTruthy()
    expect(product, 'Produit E2E introuvable.').toBeTruthy()
    expect(classement, 'Classement E2E introuvable.').toBeTruthy()

    const payload = {
      client_id: client!.id,
      location_id: location!.id,
      date: today(),
      date_livraison_prevue: today(),
      echeance: 30,
      lignes: [
        {
          produit_id: product!.id,
          classement_id: classement!.id,
          quantite: 1,
          prix_unitaire: 2500,
        },
      ],
    }

    const response = await bffJson<ApiEnvelope<Commande>>(
      page,
      'POST',
      '/commercial/commandes',
      {
        data: payload,
        expectedStatus: 201,
      },
    )

    const commande = apiData<Commande>(response)

    expect(response.success).toBe(true)
    expect(commande.id).toBeGreaterThan(0)
    expect(commande.numero).toBeTruthy()
    expect(commande.lignes).toHaveLength(1)
    expect(commande.lignes[0]).toMatchObject({
      produit_id: product!.id,
      classement_id: classement!.id,
      quantite: 1,
      prix_unitaire: 2500,
    })
  })

  test('une vente directe est idempotente puis peut être validée et annulée', async ({
    page,
  }) => {
    const clientsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/commercial/clients?search=E2E-CLIENT-001&actif=true&per_page=10',
    )

    const locationsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/organisation/locations?search=E2E%20Usine%20principale',
    )

    const productsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/catalogue/produits?search=E2E-PF-001&actif=true&per_page=10',
    )

    const classementsPayload = await bffJson<unknown>(
      page,
      'GET',
      '/catalogue/classements',
    )

    const client = paginatedItems<Client>(clientsPayload).find(
      (item) => item.reference === 'E2E-CLIENT-001',
    )

    const location = plainItems<Location>(locationsPayload).find(
      (item) => item.nom === 'E2E Usine principale',
    )

    const product = paginatedItems<Produit>(productsPayload).find(
      (item) => item.nomencla === 'E2E-PF-001',
    )

    const classement = plainItems<Classement>(classementsPayload).find(
      (item) => item.qualite === '1er' && item.actif,
    )

    expect(client).toBeTruthy()
    expect(location).toBeTruthy()
    expect(product).toBeTruthy()
    expect(classement).toBeTruthy()

    const payload = {
      client_id: client!.id,
      location_id: location!.id,
      date: today(),
      lignes: [
        {
          produit_id: product!.id,
          classement_id: classement!.id,
          quantite: 1,
          prix_unitaire: 2500,
        },
      ],
    }

    const createKey = idempotencyKey('e2e-vente-create')

    const firstCreate = await bffJson<ApiEnvelope<VenteDirecte>>(
      page,
      'POST',
      '/commercial/ventes-directes',
      {
        data: payload,
        headers: {
          'Idempotency-Key': createKey,
        },
        expectedStatus: 201,
      },
    )

    const secondCreate = await bffJson<ApiEnvelope<VenteDirecte>>(
      page,
      'POST',
      '/commercial/ventes-directes',
      {
        data: payload,
        headers: {
          'Idempotency-Key': createKey,
        },
        expectedStatus: 201,
      },
    )

    const vente = apiData<VenteDirecte>(firstCreate)
    const venteRejouee = apiData<VenteDirecte>(secondCreate)

    expect(firstCreate.success).toBe(true)
    expect(vente.id).toBeGreaterThan(0)

    expect(
    venteRejouee.id,
    'La même Idempotency-Key ne doit jamais créer une seconde vente directe.',
    ).toBe(vente.id)

    const validation = await bffJson<ApiEnvelope<VenteDirecte>>(
      page,
      'POST',
      `/commercial/ventes-directes/${vente.id}/valider`,
      {
        headers: {
          'Idempotency-Key': idempotencyKey('e2e-vente-validate'),
        },
      },
    )

    expect(validation.success).toBe(true)

    const annulation = await bffJson<ApiEnvelope<VenteDirecte>>(
      page,
      'POST',
      `/commercial/ventes-directes/${vente.id}/annuler`,
      {
        headers: {
          'Idempotency-Key': idempotencyKey('e2e-vente-cancel'),
        },
      },
    )

    expect(annulation.success).toBe(true)

    const venteAnnulee = apiData<VenteDirecte>(annulation)
    const statut =
      typeof venteAnnulee.statut === 'string'
        ? venteAnnulee.statut
        : venteAnnulee.statut?.valeur

    expect(statut).toBe('annulee')
  })
})
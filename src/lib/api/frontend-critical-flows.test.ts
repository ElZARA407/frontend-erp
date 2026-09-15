import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from './client'
import { achatsApi } from './achats'
import { bonsSortieApi } from './bons-sortie'
import { catalogueApi } from './catalogue'
import { commandesApi } from './commandes'
import { dashboardApi } from './dashboard'
import { facturesApi } from './factures'
import { livraisonsApi } from './livraisons'
import { organisationApi } from './organisation'
import { productionApi } from './production'
import { recyclageApi } from './recyclage'
import { reportsApi } from './reports'
import { rhApi } from './rh'
import { stocksApi } from './stocks'
import { ventesDirectesApi } from './ventes-directes'

const get = vi.mocked(apiClient.get)
const post = vi.mocked(apiClient.post)
const put = vi.mocked(apiClient.put)
const patch = vi.mocked(apiClient.patch)
const remove = vi.mocked(apiClient.delete)

const apiResponse = { data: { success: true, data: {} } }
const paginatedResponse = {
  data: {
    success: true,
    data: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0,
    },
  },
}

describe('contrats API des parcours frontend critiques', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    put.mockReset()
    patch.mockReset()
    remove.mockReset()

    get.mockResolvedValue(paginatedResponse as never)
    post.mockResolvedValue(apiResponse as never)
    put.mockResolvedValue(apiResponse as never)
    patch.mockResolvedValue(apiResponse as never)
    remove.mockResolvedValue(apiResponse as never)
  })

  it('transmet recherche, tri et pagination pour les listes principales', async () => {
    await catalogueApi.listProducts({
      search: 'bouteille',
      page: 2,
      per_page: 20,
      sort_by: 'designation',
      sort_dir: 'asc',
    })

    await stocksApi.list({
      search: 'PET',
      page: 3,
      per_page: 25,
      sort_by: 'date',
      sort_dir: 'desc',
    })

    await commandesApi.list({
      search: 'CMD',
      statut: 'non_livree',
      page: 2,
      per_page: 10,
    })

    await ventesDirectesApi.list({
      search: 'VD',
      page: 2,
      per_page: 10,
    })

    await livraisonsApi.list({
      search: 'BL',
      statut: 'prepare',
      page: 2,
      per_page: 10,
    })

    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/catalogue/produits?'),
    )
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/stocks?'),
    )
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/commercial/commandes?'),
    )
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/commercial/ventes-directes?'),
    )
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/logistique/livraisons?'),
    )
  })

  it('transmet une clé d’idempotence pour les écritures critiques', async () => {
    await ventesDirectesApi.create(
      {
        client_id: 1,
        location_id: 1,
        date: '2026-01-10',
        lignes: [],
      } as never,
      'idem-vente',
    )

    await ventesDirectesApi.valider(10, 'idem-validation-vente')
    await ventesDirectesApi.annuler(10, 'idem-annulation-vente')

    await facturesApi.creerDepuisLivraison(
      { livraison_id: 5 } as never,
      'idem-facture',
    )

    await facturesApi.payer(
      8,
      { montant: 5000, date_paiement: '2026-01-10' } as never,
      'idem-paiement',
    )

    await facturesApi.annuler(8, 'idem-annulation-facture')

    expect(post).toHaveBeenCalledWith(
      '/commercial/ventes-directes',
      expect.any(Object),
      { headers: { 'Idempotency-Key': 'idem-vente' } },
    )

    expect(post).toHaveBeenCalledWith(
      '/commercial/ventes-directes/10/valider',
      undefined,
      { headers: { 'Idempotency-Key': 'idem-validation-vente' } },
    )

    expect(post).toHaveBeenCalledWith(
      '/commercial/ventes-directes/10/annuler',
      undefined,
      { headers: { 'Idempotency-Key': 'idem-annulation-vente' } },
    )

    expect(post).toHaveBeenCalledWith(
      '/finance/factures',
      expect.any(Object),
      { headers: { 'Idempotency-Key': 'idem-facture' } },
    )

    expect(post).toHaveBeenCalledWith(
      '/finance/factures/8/payer',
      expect.any(Object),
      { headers: { 'Idempotency-Key': 'idem-paiement' } },
    )

    expect(post).toHaveBeenCalledWith(
      '/finance/factures/8/annuler',
      undefined,
      { headers: { 'Idempotency-Key': 'idem-annulation-facture' } },
    )
  })

  it('couvre les créations et validations des domaines opérationnels', async () => {
    await achatsApi.create({
      fournisseur_id: 1,
      location_id: 1,
      date: '2026-01-10',
      lignes: [],
    })

    await achatsApi.valider(1)

    await bonsSortieApi.create({
      location_source_id: 1,
      location_destination_id: 2,
      lignes: [],
    } as never)

    await bonsSortieApi.valider(2)

    await livraisonsApi.confirmer(3)
    await livraisonsApi.annuler(3)

    await productionApi.create({
      produit_id: 1,
      location_id: 1,
      date: '2026-01-10',
      quantite_cible: 10,
    } as never)

    await productionApi.cloture(4)
    await productionApi.annuler(4)

    await recyclageApi.create({
      matiere_brute_id: 1,
      matiere_broyee_id: 2,
      location_id: 1,
      date: '2026-01-10',
      quantite_cible: 10,
    } as never)

    await recyclageApi.cloture(5)

    expect(post).toHaveBeenCalledWith(
      '/achats/bons-reception',
      expect.any(Object),
    )
    expect(post).toHaveBeenCalledWith('/achats/bons-reception/1/valider')
    expect(post).toHaveBeenCalledWith(
      '/logistique/bons-sortie',
      expect.any(Object),
    )
    expect(post).toHaveBeenCalledWith('/logistique/bons-sortie/2/valider')
    expect(post).toHaveBeenCalledWith('/logistique/livraisons/3/confirmer')
    expect(post).toHaveBeenCalledWith('/logistique/livraisons/3/annuler')
  })

  it('couvre les référentiels catalogue, RH et organisation', async () => {
    await catalogueApi.createCategory({ nom: 'PET' })
    await catalogueApi.createMatiere({
      reference: 'MP-TEST',
      nom: 'Matière test',
      type: 'brute',
      unite: 'kg',
    } as never)

    await catalogueApi.createProduct({
      designation: 'Produit test',
      categorie_id: 1,
      unite: 'pcs',
      colisage: 1,
      poids: '1kg',
      seuil: 1,
    } as never)

    await rhApi.createPoste({
      nom: 'Opérateur',
      taux_horaire: 10,
    })

    await rhApi.createEmploye({
      matricule: 'EMP-001',
      nom: 'Test',
      prenom: 'Jean',
      poste_id: 1,
      date_embauche: '2026-01-01',
      actif: true,
    })

    await organisationApi.createLocation({
      nom: 'Usine test',
      type: 'usine',
    })

    await organisationApi.toggleUserActive(9)

    expect(post).toHaveBeenCalledWith(
      '/catalogue/categories',
      { nom: 'PET' },
    )
    expect(post).toHaveBeenCalledWith(
      '/catalogue/matieres-premieres',
      expect.any(Object),
    )
    expect(post).toHaveBeenCalledWith(
      '/catalogue/produits',
      expect.any(Object),
    )
    expect(post).toHaveBeenCalledWith('/rh/postes', expect.any(Object))
    expect(post).toHaveBeenCalledWith('/rh/employes', expect.any(Object))
    expect(post).toHaveBeenCalledWith(
      '/organisation/locations',
      expect.any(Object),
    )
    expect(patch).toHaveBeenCalledWith(
      '/organisation/utilisateurs/9/toggle-actif',
    )
  })

  it('couvre dashboard, rapports, export et accès aux factures', async () => {
    get.mockResolvedValue(apiResponse as never)

    await dashboardApi.index({
      date_debut: '2026-01-01',
      date_fin: '2026-01-31',
    })

    await dashboardApi.production()
    await dashboardApi.stock()
    await dashboardApi.commercial()
    await dashboardApi.finance()
    await dashboardApi.pilotage()

    await reportsApi.overview({
      date_debut: '2026-01-01',
      date_fin: '2026-01-31',
    })

    await reportsApi.export('finance', {
      date_debut: '2026-01-01',
      date_fin: '2026-01-31',
    })

    await facturesApi.enRetard()

    expect(get).toHaveBeenCalledWith(expect.stringContaining('/dashboard?'))
    expect(get).toHaveBeenCalledWith('/dashboard/production')
    expect(get).toHaveBeenCalledWith('/dashboard/stock')
    expect(get).toHaveBeenCalledWith('/dashboard/commercial')
    expect(get).toHaveBeenCalledWith('/dashboard/finance')
    expect(get).toHaveBeenCalledWith('/dashboard/pilotage')
    expect(get).toHaveBeenCalledWith(expect.stringContaining('/rapports?'))
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/rapports/export?'),
      { responseType: 'blob' },
    )
    expect(get).toHaveBeenCalledWith('/finance/factures/retards')
  })

  it('utilise les verbes HTTP corrects pour les modifications et suppressions', async () => {
    await catalogueApi.updateProduct(2, { designation: 'Produit modifié' } as never)
    await catalogueApi.deleteProduct(2)

    await bonsSortieApi.update(4, { observations: 'Mise à jour' })
    await bonsSortieApi.delete(4)

    await organisationApi.updateRole(1, { description: 'Mise à jour' })
    await organisationApi.deleteRole(1)

    await rhApi.updateEmploye(3, { actif: false })
    await rhApi.deleteEmploye(3)

    expect(put).toHaveBeenCalledWith(
      '/catalogue/produits/2',
      { designation: 'Produit modifié' },
    )
    expect(remove).toHaveBeenCalledWith('/catalogue/produits/2')

    expect(put).toHaveBeenCalledWith(
      '/logistique/bons-sortie/4',
      { observations: 'Mise à jour' },
    )
    expect(remove).toHaveBeenCalledWith('/logistique/bons-sortie/4')

    expect(put).toHaveBeenCalledWith(
      '/organisation/roles/1',
      { description: 'Mise à jour' },
    )
    expect(remove).toHaveBeenCalledWith('/organisation/roles/1')

    expect(put).toHaveBeenCalledWith('/rh/employes/3', { actif: false })
    expect(remove).toHaveBeenCalledWith('/rh/employes/3')
  })
})
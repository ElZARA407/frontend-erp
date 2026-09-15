import { describe, expect, it } from 'vitest'
import {
  canAccessRoute,
  canEditBusinessDocument,
  canPerform,
  canSeeDashboardWidget,
  canSeeReportTab,
  getVisibleRoles,
} from './permissions'

describe('droits frontend ERP', () => {
  it('expose tous les rôles attendus', () => {
    expect(getVisibleRoles()).toEqual([
      'admin',
      'responsable_prod',
      'operateur_saisie',
      'commercial',
      'logistique',
      'finance',
      'responsable_achat',
    ])
  })

  it('autorise toutes les routes à un administrateur', () => {
    const routes = [
      '/dashboard',
      '/organisation',
      '/rh',
      '/catalogue',
      '/stocks',
      '/achats',
      '/demandes-achat',
      '/production',
      '/recyclage',
      '/clients',
      '/fournisseurs',
      '/contrats',
      '/commandes',
      '/ventes-directes',
      '/livraisons',
      '/bons-sortie',
      '/factures',
      '/rapports',
    ]

    for (const route of routes) {
      expect(canAccessRoute('admin', route)).toBe(true)
    }
  })

  it('applique les restrictions de navigation par rôle', () => {
    expect(canAccessRoute('commercial', '/clients')).toBe(true)
    expect(canAccessRoute('commercial', '/commandes/12')).toBe(true)
    expect(canAccessRoute('commercial', '/factures')).toBe(false)

    expect(canAccessRoute('finance', '/factures')).toBe(true)
    expect(canAccessRoute('finance', '/production')).toBe(false)

    expect(canAccessRoute('logistique', '/stocks')).toBe(true)
    expect(canAccessRoute('logistique', '/bons-sortie/5')).toBe(true)
    expect(canAccessRoute('logistique', '/rh')).toBe(false)

    expect(canAccessRoute('responsable_prod', '/production')).toBe(true)
    expect(canAccessRoute('responsable_prod', '/recyclage')).toBe(true)
    expect(canAccessRoute('responsable_prod', '/clients')).toBe(false)

    expect(canAccessRoute('responsable_achat', '/achats')).toBe(true)
    expect(canAccessRoute('responsable_achat', '/fournisseurs')).toBe(true)
    expect(canAccessRoute('responsable_achat', '/livraisons')).toBe(false)
  })

  it('refuse les rôles inconnus et les accès hors périmètre', () => {
    expect(canAccessRoute(null, '/clients')).toBe(false)
    expect(canAccessRoute('inconnu', '/stocks')).toBe(false)
    expect(canAccessRoute(null, '/dashboard')).toBe(true)
  })

  it('protège les actions sensibles', () => {
    expect(canPerform('admin', 'manage_users')).toBe(true)
    expect(canPerform('admin', 'pay')).toBe(true)

    expect(canPerform('finance', 'pay')).toBe(true)
    expect(canPerform('finance', 'delete')).toBe(false)

    expect(canPerform('commercial', 'create')).toBe(true)
    expect(canPerform('commercial', 'deliver')).toBe(true)
    expect(canPerform('commercial', 'manage_users')).toBe(false)

    expect(canPerform('operateur_saisie', 'create')).toBe(true)
    expect(canPerform('operateur_saisie', 'validate')).toBe(false)

    expect(canPerform(null, 'create')).toBe(false)
  })

  it('restreint les onglets de rapports', () => {
    expect(canSeeReportTab('admin', 'finance')).toBe(true)
    expect(canSeeReportTab('finance', 'finance')).toBe(true)
    expect(canSeeReportTab('finance', 'production')).toBe(false)
    expect(canSeeReportTab('commercial', 'commercial')).toBe(true)
    expect(canSeeReportTab('commercial', 'stock')).toBe(false)
    expect(canSeeReportTab('responsable_prod', 'recyclage')).toBe(true)
    expect(canSeeReportTab('responsable_achat', 'mouvements')).toBe(true)
  })

  it('restreint les widgets du dashboard selon le rôle', () => {
    expect(canSeeDashboardWidget('admin', 'valeur_totale_stock')).toBe(true)
    expect(canSeeDashboardWidget('commercial', 'top_clients')).toBe(true)
    expect(canSeeDashboardWidget('commercial', 'bons_production_en_cours')).toBe(false)
    expect(canSeeDashboardWidget('finance', 'factures_en_attente')).toBe(true)
    expect(canSeeDashboardWidget('logistique', 'stock_entrees_sorties')).toBe(true)
    expect(canSeeDashboardWidget('operateur_saisie', 'top_clients')).toBe(false)
  })

  it('bloque la modification d’un document déjà validé pour les non-admins', () => {
    expect(canEditBusinessDocument('commercial', 'commande', 'non_livree')).toMatchObject({
      allowed: true,
      mode: 'normal',
    })

    expect(canEditBusinessDocument('commercial', 'commande', 'livree')).toMatchObject({
      allowed: false,
      mode: 'readonly',
    })

    expect(canEditBusinessDocument('admin', 'commande', 'livree')).toMatchObject({
      allowed: true,
      mode: 'admin_correction',
    })

    expect(canEditBusinessDocument('admin', 'calcul', 'termine')).toMatchObject({
      allowed: false,
      mode: 'readonly',
    })

    expect(
      canEditBusinessDocument('responsable_prod', 'bp_session', { valeur: 'ouverte' }),
    ).toMatchObject({
      allowed: true,
      mode: 'normal',
    })
  })
})
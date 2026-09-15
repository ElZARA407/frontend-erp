import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth.store'

const utilisateur = {
  id: 7,
  nom: 'Administrateur Test',
  email: 'admin@cmp.test',
  actif: true,
  created_at: '2024-01-01T00:00:00.000Z',
  role: {
    id: 1,
    nom: 'admin',
  },
  location: {
    id: 1,
    nom: 'Site principal',
    type: 'usine',
  },
}

describe('store d’authentification', () => {
  beforeEach(() => {
    localStorage.clear()

    useAuthStore.setState({
      utilisateur: null,
      isAuthenticated: false,
      hasHydrated: true,
    })
  })

  it('enregistre correctement un utilisateur connecté', () => {
    useAuthStore.getState().setUtilisateur(utilisateur)

    expect(useAuthStore.getState()).toMatchObject({
      utilisateur,
      isAuthenticated: true,
      hasHydrated: true,
    })
  })

  it('identifie le rôle de l’utilisateur courant', () => {
    useAuthStore.getState().setUtilisateur(utilisateur)

    expect(useAuthStore.getState().hasRole('admin')).toBe(true)
    expect(useAuthStore.getState().hasRole('commercial')).toBe(false)
  })

  it('supprime entièrement la session lors de la déconnexion', () => {
    useAuthStore.getState().setUtilisateur(utilisateur)
    useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({
      utilisateur: null,
      isAuthenticated: false,
      hasHydrated: true,
    })
  })

  it('gère explicitement la fin de réhydratation Zustand', () => {
    useAuthStore.getState().setHasHydrated(false)

    expect(useAuthStore.getState().hasHydrated).toBe(false)

    useAuthStore.getState().setHasHydrated(true)

    expect(useAuthStore.getState().hasHydrated).toBe(true)
  })
})
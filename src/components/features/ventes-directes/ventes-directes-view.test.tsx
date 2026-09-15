import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { VentesDirectesView } from './ventes-directes-view'

const push = vi.fn()
const useVentesDirectes = vi.fn()
const useClients = vi.fn()
const validerMutate = vi.fn()
const annulerMutate = vi.fn()
const createIdempotencyKey = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/idempotency', () => ({
  createIdempotencyKey: () => createIdempotencyKey(),
}))

vi.mock('@/lib/hooks/use-clients', () => ({
  useClients: (...args: unknown[]) => useClients(...args),
}))

vi.mock('@/lib/hooks/use-ventes-directes', () => ({
  useVentesDirectes: (...args: unknown[]) => useVentesDirectes(...args),
  useValiderVenteDirecte: () => ({
    mutate: validerMutate,
    isPending: false,
  }),
  useAnnulerVenteDirecte: () => ({
    mutate: annulerMutate,
    isPending: false,
  }),
}))

vi.mock('@/lib/hooks/use-permissions', () => ({
  usePermissions: () => ({
    can: (action: string) => action === 'validate',
    canEditDocument: (_type: string, statut: string) => ({
      allowed: statut === 'brouillon',
      label: 'Modifier',
    }),
  }),
}))

vi.mock('./vente-directe-form', () => ({
  VenteDirecteForm: () => <p>Formulaire vente simulé</p>,
}))

vi.mock('../livraisons/livraison-form', () => ({
  LivraisonForm: () => <p>Formulaire livraison simulé</p>,
}))

const ventesPage = {
  data: {
    data: [
      {
        id: 10,
        numero: 'VD-00010',
        date: '2026-01-15',
        total: 25000,
        statut: 'brouillon',
        client: { id: 1, nom: 'Client Alpha' },
        location: { id: 1, nom: 'Usine principale' },
        lignes: [
          {
            id: 1,
            quantite: 5,
            quantite_restante: 5,
          },
        ],
      },
      {
        id: 11,
        numero: 'VD-00011',
        date: '2026-01-16',
        total: 30000,
        statut: 'validee',
        client: { id: 2, nom: 'Client Beta' },
        location: { id: 1, nom: 'Usine principale' },
        lignes: [
          {
            id: 2,
            quantite: 6,
            quantite_restante: 6,
          },
        ],
      },
    ],
    current_page: 1,
    last_page: 2,
    total: 21,
    from: 1,
    to: 20,
  },
}

describe('écran ventes directes — parcours opérationnel', () => {
  beforeEach(() => {
    push.mockReset()
    useVentesDirectes.mockReset()
    useClients.mockReset()
    validerMutate.mockReset()
    annulerMutate.mockReset()
    createIdempotencyKey.mockReset()

    createIdempotencyKey.mockReturnValue('idem-vente-unique')

    useClients.mockReturnValue({
      data: {
        data: {
          data: [
            { id: 1, nom: 'Client Alpha' },
            { id: 2, nom: 'Client Beta' },
          ],
        },
      },
      isLoading: false,
    })

    useVentesDirectes.mockReturnValue({
      data: ventesPage,
      isLoading: false,
    })
  })

  it('affiche les ventes, leurs états et les actions métier', () => {
    renderWithProviders(<VentesDirectesView />)

    expect(
      screen.getByRole('heading', { name: 'Ventes directes' }),
    ).toBeInTheDocument()

    expect(screen.getByText('VD-00010')).toBeInTheDocument()
    expect(screen.getByText('VD-00011')).toBeInTheDocument()
    expect(screen.getByText('Brouillon')).toBeInTheDocument()
    expect(screen.getByText('Validee')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Livrer' })).toBeInTheDocument()
  })

  it('met à jour les filtres, le client et le tri', async () => {
    const user = userEvent.setup()

    renderWithProviders(<VentesDirectesView />)

    await user.click(screen.getByRole('button', { name: 'Brouillons' }))

    await user.selectOptions(screen.getByLabelText('Client'), '1')

    await user.type(screen.getByLabelText('Du'), '2026-01-01')
    await user.type(screen.getByLabelText('Au'), '2026-01-31')

    await user.selectOptions(screen.getByLabelText('Trier par'), 'nom')
    await user.click(screen.getByRole('button', { name: 'Décroissant' }))

    await waitFor(() => {
      expect(useVentesDirectes).toHaveBeenLastCalledWith(
        expect.objectContaining({
          statut: 'brouillon',
          client_id: 1,
          date_debut: '2026-01-01',
          date_fin: '2026-01-31',
          page: 1,
          per_page: 20,
          sort_by: 'nom',
          sort_dir: 'asc',
        }),
      )
    })
  })

  it('ouvre la confirmation puis valide avec une clé idempotente', async () => {
    const user = userEvent.setup()

    renderWithProviders(<VentesDirectesView />)

    await user.click(screen.getByRole('button', { name: 'Valider' }))

    expect(screen.getByText('Validation')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Oui' }))

    expect(createIdempotencyKey).toHaveBeenCalledOnce()
    expect(validerMutate).toHaveBeenCalledWith(
      {
        id: 10,
        idempotencyKey: 'idem-vente-unique',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('ouvre la confirmation puis annule avec une clé idempotente', async () => {
    const user = userEvent.setup()

    renderWithProviders(<VentesDirectesView />)

    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(screen.getByText('Annulation')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Oui' }))

    expect(createIdempotencyKey).toHaveBeenCalledOnce()
    expect(annulerMutate).toHaveBeenCalledWith(
      {
        id: 11,
        idempotencyKey: 'idem-vente-unique',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('ouvre la création de livraison depuis une vente validée', async () => {
    const user = userEvent.setup()

    renderWithProviders(<VentesDirectesView />)

    await user.click(screen.getByRole('button', { name: 'Livrer' }))

    expect(
      screen.getByText('Créer un BL depuis VD-00011'),
    ).toBeInTheDocument()

    expect(screen.getByText('Formulaire livraison simulé')).toBeInTheDocument()
  })

  it('navigue vers le détail d’une vente', async () => {
    const user = userEvent.setup()

    renderWithProviders(<VentesDirectesView />)

    await user.click(screen.getByText('VD-00010'))

    expect(push).toHaveBeenCalledWith('/ventes-directes/10')
  })

  it('affiche un état vide sans action métier abusive', () => {
    useVentesDirectes.mockReturnValue({
      data: {
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          total: 0,
          from: 0,
          to: 0,
        },
      },
      isLoading: false,
    })

    renderWithProviders(<VentesDirectesView />)

    expect(
      screen.getByText('Aucune vente directe trouvee'),
    ).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument()
  })
})
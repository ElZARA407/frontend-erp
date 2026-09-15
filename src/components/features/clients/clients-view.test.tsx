import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { ClientsView } from './clients-view'

const push = vi.fn()
const useClients = vi.fn()
const deleteMutate = vi.fn()
const importMutateAsync = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/hooks/use-clients', () => ({
  useClients: (...args: unknown[]) => useClients(...args),
  useDeleteClient: () => ({
    mutate: deleteMutate,
    isPending: false,
  }),
  useImportClients: () => ({
    mutateAsync: importMutateAsync,
    isPending: false,
  }),
}))

vi.mock('./client-form', () => ({
  ClientForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div>
      <p>Formulaire client simulé</p>
      <button type="button" onClick={onSuccess}>
        Enregistrer le client simulé
      </button>
    </div>
  ),
}))

const clientsPage = {
  data: {
    data: [
      {
        id: 1,
        reference: 'CL-001',
        nom: 'Client Alpha',
        contact: 'Jean Alpha',
        NIF: 'NIF-001',
        est_divers: false,
        actif: true,
      },
      {
        id: 2,
        reference: 'CL-002',
        nom: 'Client Divers',
        contact: 'Marie Divers',
        NIF: null,
        est_divers: true,
        actif: false,
      },
    ],
    current_page: 1,
    last_page: 3,
    total: 22,
    from: 1,
    to: 10,
  },
}

describe('écran clients — parcours utilisateur', () => {
  beforeEach(() => {
    push.mockReset()
    useClients.mockReset()
    deleteMutate.mockReset()
    importMutateAsync.mockReset()

    useClients.mockReturnValue({
      data: clientsPage,
      isLoading: false,
    })
  })

  it('affiche la liste, le total et les actions disponibles', () => {
    renderWithProviders(<ClientsView />)

    expect(screen.getByRole('heading', { name: 'Clients' })).toBeInTheDocument()
    expect(screen.getByText('22 clients')).toBeInTheDocument()

    expect(screen.getByText('CL-001')).toBeInTheDocument()
    expect(screen.getByText('Client Alpha')).toBeInTheDocument()
    expect(screen.getByText('Client Divers')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Nouveau client' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Importer Excel' }),
    ).toBeInTheDocument()
  })

  it('transmet recherche, filtres et tri au hook de données', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ClientsView />)

    await user.type(
      screen.getByPlaceholderText('Rechercher un client...'),
      'Alpha',
    )

    await user.click(screen.getByRole('button', { name: 'Inactifs' }))

    await user.selectOptions(
      screen.getByLabelText('Type client'),
      'true',
    )

    await user.selectOptions(
      screen.getByLabelText('Trier par'),
      'nom',
    )

    await user.click(screen.getByRole('button', { name: 'Décroissant' }))

    await waitFor(() => {
      expect(useClients).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'Alpha',
          actif: false,
          est_divers: true,
          page: 1,
          per_page: 10,
          sort_by: 'nom',
          sort_dir: 'asc',
        }),
      )
    })
  })

  it('navigue vers le détail lorsqu’une ligne est sélectionnée', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ClientsView />)

    await user.click(screen.getByText('Client Alpha'))

    expect(push).toHaveBeenCalledWith('/clients/1')
  })

  it('ouvre et ferme le formulaire de création', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ClientsView />)

    await user.click(screen.getByRole('button', { name: 'Nouveau client' }))

    expect(screen.getByRole('heading', { name: 'Nouveau client' })).toBeInTheDocument()
    expect(screen.getByText('Formulaire client simulé')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Enregistrer le client simulé' }),
    )

    await waitFor(() => {
      expect(screen.queryByText('Formulaire client simulé')).not.toBeInTheDocument()
    })
  })

  it('demande confirmation avant archivage', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ClientsView />)

    await user.click(screen.getByRole('button', { name: 'Archiver' }))

    expect(screen.getByText('Archivage')).toBeInTheDocument()
    expect(
      screen.getByText('Voulez vous vraiment archiver ce client ?'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Oui' }))

    expect(deleteMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('affiche un état vide utilisable', () => {
    useClients.mockReturnValue({
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

    renderWithProviders(<ClientsView />)

    expect(screen.getByText('Aucun client trouvé')).toBeInTheDocument()
    expect(
      screen.getByText('Ajustez vos filtres ou créez un nouveau client.'),
    ).toBeInTheDocument()
  })

  it('affiche un état de chargement sans données métier incomplètes', () => {
    useClients.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderWithProviders(<ClientsView />)

    expect(screen.queryByText('Client Alpha')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Clients' })).toBeInTheDocument()
  })
})
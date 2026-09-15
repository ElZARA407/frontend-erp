import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './login-form'

const loginMutation = vi.fn()

vi.mock('@/lib/hooks/use-auth', () => ({
  useLogin: () => ({
    mutate: loginMutation,
    isPending: false,
  }),
}))

describe('formulaire de connexion', () => {
  beforeEach(() => {
    loginMutation.mockReset()
  })

  it('affiche les champs indispensables et le bouton de connexion', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('Adresse email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('empêche la soumission lorsque les données sont invalides', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(loginMutation).not.toHaveBeenCalled()
  })

  it('soumet les identifiants valides au hook de connexion', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Adresse email'), 'admin@cmp.test')
    await user.type(screen.getByLabelText('Mot de passe'), 'MotDePasseTest123!')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(loginMutation).toHaveBeenCalledWith({
      email: 'admin@cmp.test',
      password: 'MotDePasseTest123!',
    })
  })

  it('permet d’afficher puis masquer le mot de passe', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Mot de passe')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Masquer le mot de passe' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }))

    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
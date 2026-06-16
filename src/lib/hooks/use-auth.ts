// src/lib/hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/auth.store'
import type { LoginSchema } from '../schemas/auth.schema'

export function useLogin() {
  const router = useRouter()
  const setUtilisateur = useAuthStore((s) => s.setUtilisateur)

  return useMutation({
    mutationFn: (payload: LoginSchema) => authApi.login(payload),
    onSuccess: (data) => {
      setUtilisateur(data.utilisateur)
      toast.success(`Bienvenue, ${data.utilisateur.nom}`)
      router.push('/dashboard')
    },
    onError: () => {
      toast.error('Email ou mot de passe incorrect.')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      qc.clear()
      router.push('/login')
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn:  authApi.me,
    staleTime: 5 * 60 * 1000,
  })
}
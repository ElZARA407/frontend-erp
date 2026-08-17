// src/lib/api/client.ts
import axios, { AxiosError, type AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'sonner'


const TOKEN_KEY = 'cmp_token'

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'Strict' })
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`,
  headers: { Accept: 'application/json' },
  timeout: 30_000,
})

type ApiErrorPayload = {
  message?: string
  error?: string
  exception?: string
  errors?: Record<string, string[] | string>
}

let lastAuthRedirectAt = 0
let lastServerToastAt = 0

function getBackendMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const payload = data as ApiErrorPayload

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const first = Object.values(payload.errors)[0]

    if (Array.isArray(first)) {
      return first[0] ?? null
    }

    if (typeof first === 'string') {
      return first
    }
  }

  return null
}

function shouldForceReconnect(status?: number, message?: string | null): boolean {
  const normalized = (message ?? '').toLowerCase()

  return (
    status === 401 ||
    status === 419 ||
    normalized.includes('unauthenticated') ||
    normalized.includes('token') ||
    normalized.includes('route [login] not defined')
  )
}

function redirectToLogin(message = 'Votre session a expiré. Veuillez vous reconnecter.') {
  if (typeof window === 'undefined') return

  const now = Date.now()

  if (now - lastAuthRedirectAt < 2000) {
    return
  }

  lastAuthRedirectAt = now

  toast.error(message)

  localStorage.removeItem('token')
  localStorage.removeItem('auth-token')
  localStorage.removeItem('auth-storage')
  localStorage.removeItem('auth')

  const currentPath = window.location.pathname + window.location.search

  if (!window.location.pathname.includes('/login')) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
  }
}

function showServerError(message: string) {
  const now = Date.now()

  if (now - lastServerToastAt < 2500) {
    return
  }

  lastServerToastAt = now
  toast.error(message)
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status
    const backendMessage = getBackendMessage(error.response?.data)

    if (shouldForceReconnect(status, backendMessage)) {
      redirectToLogin('Votre session a expiré ou votre accès n’est plus valide. Veuillez vous reconnecter.')
      return Promise.reject(error)
    }

    if (status === 500) {
      showServerError(
        backendMessage ??
          'Erreur serveur. Une opération a échoué côté. Si le problème persiste, contactez l’administrateur.',
      )
    } else if (status === 403) {
      showServerError(backendMessage ?? 'Vous n’avez pas l’autorisation d’effectuer cette action.')
    } else if (status === 404) {
      showServerError(backendMessage ?? 'La ressource demandée est introuvable.')
    } else if (status === 422) {
      showServerError(backendMessage ?? 'Certaines informations saisies sont invalides.')
    } else if (!status) {
      showServerError('Impossible de joindre le serveur. Véuillez contacter l’administrateur.')
    }

    return Promise.reject(error)
  },
)

export default apiClient
import axios, { AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'sonner'


const REQUEST_ID_HEADER = 'X-Request-ID'
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/backend/v1',
  headers: { Accept: 'application/json' },
  timeout: 30_000,
})

type ApiErrorPayload = {
  message?: string
  error?: string
  errors?: Record<string, string[] | string>
  code?: string
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

    if (Array.isArray(first)) return first[0] ?? null
    if (typeof first === 'string') return first
  }

  return null
}

function redirectToLogin(message: string) {
  if (typeof window === 'undefined') return

  const now = Date.now()

  if (now - lastAuthRedirectAt < 2_000) return

  lastAuthRedirectAt = now
  toast.error(message)

  const currentPath = window.location.pathname + window.location.search

  if (!window.location.pathname.includes('/login')) {
    window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }
}

function showServerError(message: string) {
  const now = Date.now()

  if (now - lastServerToastAt < 2_500) return

  lastServerToastAt = now
  toast.error(message)
}

apiClient.interceptors.request.use((config) => {

  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    config.headers[REQUEST_ID_HEADER] = window.crypto.randomUUID()
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
    const message = getBackendMessage(error.response?.data)

    if (status === 401 || status === 419) {
      redirectToLogin('Votre session a expiré. Veuillez vous reconnecter.')
    } else if (status === 403) {
      showServerError(message ?? 'Vous n’avez pas l’autorisation d’effectuer cette action.')
    } else if (status === 404) {
      showServerError(message ?? 'La ressource demandée est introuvable.')
    } else if (status === 503) {
      showServerError(message ?? 'Le service ERP est momentanément indisponible.')
    } else if (status && status >= 500) {
      showServerError(message ?? 'Une erreur serveur est survenue. Veuillez réessayer.')
    } else if (!status) {
      showServerError('Impossible de joindre le service ERP.')
    }

    return Promise.reject(error)
  },
)

export default apiClient
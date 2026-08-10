import axios from 'axios'
import { toast } from 'sonner'

type ApiErrorPayload = {
  message?: unknown
  errors?: unknown
  code?: unknown
}

function firstValidationError(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    if (typeof value === 'string' && value.trim() !== '') return value
  }

  return null
}

export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return fallback
  }

  const status = error.response?.status
  const payload = error.response?.data

  const validationMessage = firstValidationError(payload?.errors)
  if (validationMessage) return validationMessage

  if (typeof payload?.message === 'string' && payload.message.trim() !== '') {
    return payload.message
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  }

  if (status === 400) return 'La demande envoyée est invalide.'
  if (status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.'
  if (status === 403) return 'Vous n’avez pas l’autorisation de faire cette action.'
  if (status === 404) return 'La ressource demandée est introuvable.'
  if (status === 409) return 'Cette action est impossible dans l’état actuel.'
  if (status === 422) return 'Certaines informations sont invalides ou incomplètes.'
  if (status && status >= 500) return 'Erreur serveur. Veuillez réessayer ou contacter l’administrateur.'

  return fallback
}

export function notifyApiError(error: unknown, fallback = 'Une erreur est survenue.'): void {
  toast.error(getApiErrorMessage(error, fallback))
}
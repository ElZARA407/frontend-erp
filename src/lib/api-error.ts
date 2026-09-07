import axios from 'axios'
import { toast } from 'sonner'

type ApiErrorPayload = {
  message?: unknown
  errors?: unknown
  code?: unknown
  request_id?: unknown
}

function firstValidationError(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    if (typeof value === 'string' && value.trim() !== '') return value
  }

  return null
}

function getRequestId(error: unknown): string | null {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return null

  const headerValue = error.response?.headers?.['x-request-id']
  const bodyValue = error.response?.data?.request_id

  if (typeof headerValue === 'string' && headerValue.trim()) return headerValue
  if (typeof bodyValue === 'string' && bodyValue.trim()) return bodyValue

  return null
}

function withReference(message: string, error: unknown): string {
  const requestId = getRequestId(error)

  if (!requestId) return message

  return `${message} Référence : ${requestId}`
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue.',
): string {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return fallback
  }

  const status = error.response?.status
  const payload = error.response?.data

  const validationMessage = firstValidationError(payload?.errors)
  if (validationMessage) return validationMessage

  if (typeof payload?.message === 'string' && payload.message.trim() !== '') {
    return withReference(payload.message, error)
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Impossible de contacter le service ERP.'
  }

  if (status === 400) return withReference('La demande envoyée est invalide.', error)
  if (status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.'
  if (status === 403) return withReference('Vous n’avez pas l’autorisation de faire cette action.', error)
  if (status === 404) return withReference('La ressource demandée est introuvable.', error)
  if (status === 409) return withReference('Cette action est impossible dans l’état actuel.', error)
  if (status === 422) return 'Certaines informations sont invalides ou incomplètes.'
  if (status === 503) return withReference('Le service ERP est momentanément indisponible.', error)

  if (status && status >= 500) {
    return withReference(
      'Erreur serveur. Veuillez réessayer ou contacter l’administrateur.',
      error,
    )
  }

  return fallback
}

export function notifyApiError(
  error: unknown,
  fallback = 'Une erreur est survenue.',
): void {
  toast.error(getApiErrorMessage(error, fallback))
}
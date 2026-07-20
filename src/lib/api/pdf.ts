import axios from 'axios'
import apiClient from './client'

export type PdfDocumentType = 'br' | 'livraison' | 'bon_sortie' | 'facture'

export interface PdfExportDocument {
  id: number
  numero: string
}

export interface PdfExportPayload {
  type: PdfDocumentType
  document: PdfExportDocument
}

export class PdfExportError extends Error {
  status?: number | null
  code?: string
  details?: unknown

  constructor(
    message: string,
    options: { status?: number | null; code?: string; details?: unknown } = {},
  ) {
    super(message)
    this.name = 'PdfExportError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-]+/g, '_')
}

function endpointFor(type: PdfDocumentType, id: number): string {
  if (type === 'br') return `/achats/bons-reception/${id}/pdf`
  if (type === 'livraison') return `/logistique/livraisons/${id}/pdf`
  if (type === 'bon_sortie') return `/logistique/bons-sortie/${id}/pdf`
  return `/finance/factures/${id}/pdf`
}

function labelFor(type: PdfDocumentType): string {
  if (type === 'br') return 'bon de réception'
  if (type === 'livraison') return 'bon de livraison'
  if (type === 'bon_sortie') return 'bon de sortie'
  return 'facture'
}

async function parseBlobError(blob: Blob): Promise<string | null> {
  try {
    const text = await blob.text()
    if (!text) return null

    try {
      const json = JSON.parse(text) as {
        message?: string
        error?: string
        exception?: string
      }

      return json.message ?? json.error ?? json.exception ?? text
    } catch {
      return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || null
    }
  } catch {
    return null
  }
}

async function normalizePdfError(
  error: unknown,
  payload: PdfExportPayload,
): Promise<PdfExportError> {
  const documentLabel = labelFor(payload.type)

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null

    if (!error.response) {
      return new PdfExportError(
        `Impossible de joindre le backend PDF pour ce ${documentLabel}.`,
        {
          status: null,
          code: `PDF_EXPORT_${payload.type.toUpperCase()}_NETWORK`,
          details: {
            type: payload.type,
            document: payload.document,
            axiosCode: error.code,
            axiosMessage: error.message,
            probableCause:
              'Backend Laravel arrêté, URL API incorrecte, CORS, timeout, réponse PDF interrompue, ou Content-Length invalide.',
          },
        },
      )
    }

    if (error.response.data instanceof Blob) {
      const parsedMessage = await parseBlobError(error.response.data)

      return new PdfExportError(
        parsedMessage || `Export PDF impossible pour ce ${documentLabel}.`,
        {
          status,
          code: `PDF_EXPORT_${payload.type.toUpperCase()}_${status ?? 'ERROR'}`,
          details: {
            type: payload.type,
            document: payload.document,
            backend: parsedMessage,
          },
        },
      )
    }

    const responseData = error.response.data as
      | { message?: string; error?: string; exception?: string }
      | undefined

    const message =
      responseData?.message ??
      responseData?.error ??
      responseData?.exception ??
      error.message ??
      `Export PDF impossible pour ce ${documentLabel}.`

    return new PdfExportError(message, {
      status,
      code: `PDF_EXPORT_${payload.type.toUpperCase()}_${status ?? 'ERROR'}`,
      details: {
        type: payload.type,
        document: payload.document,
        backend: responseData,
      },
    })
  }

  if (error instanceof Error) {
    return new PdfExportError(error.message, {
      status: null,
      code: `PDF_EXPORT_${payload.type.toUpperCase()}_ERROR`,
      details: {
        type: payload.type,
        document: payload.document,
      },
    })
  }

  return new PdfExportError(`Export PDF impossible pour ce ${documentLabel}.`, {
    status: null,
    code: `PDF_EXPORT_${payload.type.toUpperCase()}_UNKNOWN`,
    details: {
      type: payload.type,
      document: payload.document,
      error,
    },
  })
}

interface PdfBase64Response {
  success: boolean
  message?: string
  data?: {
    filename?: string
    mime_type?: string
    content_base64?: string
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mimeType })
}

export async function exportPdf(payload: PdfExportPayload): Promise<void> {
  try {
    const { data } = await apiClient.get<PdfBase64Response>(
      endpointFor(payload.type, payload.document.id),
      { timeout: 60_000 },
    )

    const contentBase64 = data.data?.content_base64
    const filename = data.data?.filename ?? `${payload.document.numero}.pdf`
    const mimeType = data.data?.mime_type ?? 'application/pdf'

    if (!contentBase64) {
      throw new PdfExportError(
        data.message ?? 'Le backend n’a pas retourné le contenu PDF.',
        {
          status: 200,
          code: `PDF_EXPORT_${payload.type.toUpperCase()}_EMPTY_CONTENT`,
          details: {
            type: payload.type,
            document: payload.document,
            backend: data,
          },
        },
      )
    }

    const blob = base64ToBlob(contentBase64, mimeType)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = sanitizeFilename(filename)
    link.rel = 'noopener'

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (error instanceof PdfExportError) {
      throw error
    }

    throw await normalizePdfError(error, payload)
  }
}

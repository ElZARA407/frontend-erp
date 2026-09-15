import { expect, type Page } from '@playwright/test'

type BffMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function bffJson<T>(
  page: Page,
  method: BffMethod,
  path: string,
  options: {
    data?: unknown
    headers?: Record<string, string>
    expectedStatus?: number
  } = {},
): Promise<T> {
  const response = await page.request.fetch(`/api/backend/v1${path}`, {
    method,
    data: options.data,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })

  const body = await response.text()

  expect(
    response.status(),
    `${method} ${path} a retourné ${response.status()} : ${body}`,
  ).toBe(options.expectedStatus ?? 200)

  return body ? (JSON.parse(body) as T) : (null as T)
}

export function paginatedItems<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== 'object') return []

  const root = payload as { data?: unknown }
  const firstData = root.data

  if (Array.isArray(firstData)) return firstData as T[]

  if (!firstData || typeof firstData !== 'object') return []

  const page = firstData as { data?: unknown }

  return Array.isArray(page.data) ? (page.data as T[]) : []
}

export function plainItems<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== 'object') return []

  const root = payload as { data?: unknown }

  return Array.isArray(root.data) ? (root.data as T[]) : []
}

export function apiData<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Réponse API invalide : data est absente.')
  }

  const root = payload as { data?: unknown }

  if (root.data === undefined || root.data === null) {
    throw new Error('Réponse API invalide : data est absente.')
  }

  return root.data as T
}
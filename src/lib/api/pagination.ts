import type { PaginatedResponse } from '@/lib/types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function extractPaginatedResponse<T>(payload: unknown, defaultPerPage = 10): PaginatedResponse<T> {
  const root = isRecord(payload) && 'data' in payload ? payload.data : payload
  const page = isRecord(root) && 'data' in root ? root : { data: Array.isArray(root) ? root : [] }
  const meta = isRecord(page) && isRecord(page.meta) ? page.meta : page
  const rows = Array.isArray(page.data) ? (page.data as T[]) : []

  const perPage = Math.max(1, toNumber(meta.per_page, toNumber(page.per_page, rows.length || defaultPerPage)))
  const currentPage = Math.max(1, toNumber(meta.current_page, toNumber(page.current_page, 1)))
  const total = Math.max(0, toNumber(meta.total, toNumber(page.total, rows.length)))
  const lastPage = Math.max(1, toNumber(meta.last_page, toNumber(page.last_page, Math.ceil(total / perPage))))
  const from = total === 0 ? 0 : Math.max(1, toNumber(meta.from, toNumber(page.from, (currentPage - 1) * perPage + 1)))
  const to = total === 0 ? 0 : Math.max(0, toNumber(meta.to, toNumber(page.to, from + rows.length - 1)))

  return {
    success: true,
    data: {
      data: rows,
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
      from,
      to,
    },
  }
}
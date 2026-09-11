import { describe, expect, it } from 'vitest'
import { extractPaginatedResponse } from './pagination'

describe('extractPaginatedResponse', () => {
  it('extrait une réponse Laravel paginée enveloppée par l’API', () => {
    const result = extractPaginatedResponse<{ id: number; nom: string }>({
      success: true,
      data: {
        data: [
          { id: 10, nom: 'Client Alpha' },
          { id: 11, nom: 'Client Beta' },
        ],
        meta: {
          current_page: 2,
          per_page: 2,
          total: 5,
          last_page: 3,
        },
      },
    })

    expect(result.success).toBe(true)

    expect(result.data.data).toEqual([
      { id: 10, nom: 'Client Alpha' },
      { id: 11, nom: 'Client Beta' },
    ])

    expect(result.data.current_page).toBe(2)
    expect(result.data.per_page).toBe(2)
    expect(result.data.total).toBe(5)
    expect(result.data.last_page).toBe(3)
    expect(result.data.from).toBe(3)
    expect(result.data.to).toBe(4)
  })

  it('utilise des valeurs sûres quand la réponse est incomplète', () => {
    const result = extractPaginatedResponse<{ id: number }>(null)

    expect(result.success).toBe(true)
    expect(result.data.data).toEqual([])
    expect(result.data.current_page).toBe(1)
    expect(result.data.per_page).toBe(10)
    expect(result.data.total).toBe(0)
    expect(result.data.last_page).toBe(1)
    expect(result.data.from).toBe(0)
    expect(result.data.to).toBe(0)
  })

  it('accepte une liste simple sans métadonnées', () => {
    const result = extractPaginatedResponse<{ id: number }>([
      { id: 1 },
      { id: 2 },
    ])

    expect(result.success).toBe(true)
    expect(result.data.data).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.data.current_page).toBe(1)
    expect(result.data.per_page).toBe(2)
    expect(result.data.total).toBe(2)
    expect(result.data.last_page).toBe(1)
    expect(result.data.from).toBe(1)
    expect(result.data.to).toBe(2)
  })
})
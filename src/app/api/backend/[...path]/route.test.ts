import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

type ProxyContext = {
  params: Promise<{
    path: string[]
  }>
}

function context(path: string[]): ProxyContext {
  return {
    params: Promise.resolve({ path }),
  }
}

describe('proxy BFF /api/backend', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('transmet intégralement les paramètres de recherche, tri et pagination', async () => {
    process.env.BACKEND_API_URL = 'https://api.erp-cmp.example'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': 'backend-request-id',
        },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const request = new NextRequest(
      'http://localhost:3000/api/backend/v1/commercial/clients?search=alpha&sort_by=nom&sort_dir=asc&page=2&per_page=25',
      {
        headers: {
          Cookie: 'cmp_access_token=token-secret',
          'X-Request-ID': 'frontend-request-id',
        },
      },
    )

    const response = await GET(
      request,
      context(['v1', 'commercial', 'clients']),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Request-ID')).toBe('backend-request-id')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ]

    expect(url).toBe(
      'https://api.erp-cmp.example/api/v1/commercial/clients?search=alpha&sort_by=nom&sort_dir=asc&page=2&per_page=25',
    )

    const headers = new Headers(options.headers)

    expect(options.method).toBe('GET')
    expect(headers.get('Authorization')).toBe('Bearer token-secret')
    expect(headers.get('X-Request-ID')).toBe('frontend-request-id')
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('transmet le corps JSON et la clé d’idempotence sur une écriture', async () => {
    process.env.BACKEND_API_URL = 'https://api.erp-cmp.example'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: 42 } }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Replayed': 'true',
        },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      entite_type: 'produit',
      entite_id: 15,
      location_id: 2,
      quantite: 10,
    }

    const request = new NextRequest(
      'http://localhost:3000/api/backend/v1/stocks/ajustements',
      {
        method: 'POST',
        headers: {
          Cookie: 'cmp_access_token=token-secret',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idem-stock-ajustement-0001',
          'X-Request-ID': 'frontend-request-id',
        },
        body: JSON.stringify(payload),
      },
    )

    const response = await POST(
      request,
      context(['v1', 'stocks', 'ajustements']),
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('Idempotency-Replayed')).toBe('true')

    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ]

    expect(url).toBe(
      'https://api.erp-cmp.example/api/v1/stocks/ajustements',
    )
    expect(options.method).toBe('POST')

    const headers = new Headers(options.headers)

    expect(headers.get('Authorization')).toBe('Bearer token-secret')
    expect(headers.get('Idempotency-Key')).toBe(
      'idem-stock-ajustement-0001',
    )
    expect(headers.get('X-Request-ID')).toBe('frontend-request-id')
    expect(new TextDecoder().decode(options.body as ArrayBuffer)).toBe(
      JSON.stringify(payload),
    )
  })

  it('retourne 503 quand BACKEND_API_URL est absente', async () => {
    delete process.env.BACKEND_API_URL

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const request = new NextRequest(
      'http://localhost:3000/api/backend/v1/stocks',
    )

    const response = await GET(request, context(['v1', 'stocks']))

    expect(response.status).toBe(503)

    const payload = await response.json()

    expect(payload).toMatchObject({
      success: false,
      code: 'BACKEND_UNAVAILABLE',
    })

    expect(consoleError).toHaveBeenCalled()
  })
})
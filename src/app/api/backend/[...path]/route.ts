import { NextRequest, NextResponse } from 'next/server'

const TOKEN_COOKIE = 'cmp_access_token'

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    throw new Error('BACKEND_API_URL est absente de la configuration serveur.')
  }

  return baseUrl
}

function getUpstreamUrl(request: NextRequest, path: string[]): string {
  const apiPath = path.map(encodeURIComponent).join('/')

  // Conserve impérativement ?search, ?page, ?sort_by, etc.
  return `${getBackendBaseUrl()}/api/${apiPath}${request.nextUrl.search}`
}

function copyRequestHeaders(request: NextRequest, token?: string): Headers {
  const headers = new Headers()

  headers.set('Accept', request.headers.get('Accept') ?? 'application/json')

  const contentType = request.headers.get('Content-Type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const requestId = request.headers.get('X-Request-ID')
  if (requestId) {
    headers.set('X-Request-ID', requestId)
  }

  // Indispensable aux créations, paiements, imports et ajustements protégés.
  const idempotencyKey = request.headers.get('Idempotency-Key')
  if (idempotencyKey) {
    headers.set('Idempotency-Key', idempotencyKey)
  }

  return headers
}

function copyResponseHeaders(upstream: Response): Headers {
  const headers = new Headers()

  const contentType = upstream.headers.get('Content-Type')
  const contentDisposition = upstream.headers.get('Content-Disposition')
  const cacheControl = upstream.headers.get('Cache-Control')
  const requestId = upstream.headers.get('X-Request-ID')
  const idempotencyReplayed = upstream.headers.get('Idempotency-Replayed')

  if (contentType) headers.set('Content-Type', contentType)
  if (contentDisposition) headers.set('Content-Disposition', contentDisposition)
  if (cacheControl) headers.set('Cache-Control', cacheControl)
  if (requestId) headers.set('X-Request-ID', requestId)
  if (idempotencyReplayed) {
    headers.set('Idempotency-Replayed', idempotencyReplayed)
  }

  return headers
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params
    const method = request.method.toUpperCase()
    const token = request.cookies.get(TOKEN_COOKIE)?.value
    const hasBody = !['GET', 'HEAD'].includes(method)

    const upstream = await fetch(getUpstreamUrl(request, path), {
      method,
      headers: copyRequestHeaders(request, token),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
    })

    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: copyResponseHeaders(upstream),
    })
  } catch (error) {
    console.error('Proxy API CMP indisponible', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Le service ERP est momentanément indisponible.',
        code: 'BACKEND_UNAVAILABLE',
      },
      { status: 503 },
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
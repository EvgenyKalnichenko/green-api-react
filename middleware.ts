const HOP_BY_HOP = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'transfer-encoding',
])

export const config = {
  matcher: '/green-api/:path*',
}

export default async function middleware(request: Request) {
  const incoming = new URL(request.url)
  const host = (request.headers.get('x-green-api-host') || 'https://api.green-api.com').replace(
    /\/$/,
    '',
  )
  const targetUrl = `${host}${incoming.pathname.replace(/^\/green-api/, '')}${incoming.search}`

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    Object.assign(init, { duplex: 'half' })
  }

  const upstream = await fetch(targetUrl, init)
  const outHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      outHeaders.set(key, value)
    }
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  })
}

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  maxDuration: 60,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const host = String(req.headers['x-green-api-host'] || 'https://api.green-api.com').replace(
      /\/$/,
      '',
    )
    const apiPath = String(req.query.path || '')
    const query = new URLSearchParams()

    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'path' || value == null) continue
      if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
      else query.set(key, value)
    }

    const search = query.toString()
    const target = `${host}/${apiPath}${search ? `?${search}` : ''}`
    const method = req.method || 'GET'
    const headers = new Headers()

    if (req.headers['content-type']) {
      headers.set('content-type', String(req.headers['content-type']))
    }

    const init: RequestInit = { method, headers }
    if (method !== 'GET' && method !== 'HEAD' && req.body != null) {
      if (typeof req.body === 'string') {
        init.body = req.body
      } else if (Buffer.isBuffer(req.body)) {
        init.body = new Uint8Array(req.body)
      } else {
        init.body = JSON.stringify(req.body)
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json')
        }
      }
    }

    const response = await fetch(target, init)
    const buffer = Buffer.from(await response.arrayBuffer())

    res.status(response.status)
    response.headers.forEach((value, key) => {
      if (key === 'content-encoding' || key === 'transfer-encoding' || key === 'content-length') {
        return
      }
      res.setHeader(key, value)
    })
    res.send(buffer)
  } catch (error) {
    res.status(502).send(error instanceof Error ? error.message : 'proxy error')
  }
}

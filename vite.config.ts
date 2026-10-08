import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

function readBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function proxyGreenApi(req: IncomingMessage, res: ServerResponse) {
  try {
    const host = String(req.headers['x-green-api-host'] || 'https://api.green-api.com').replace(
      /\/$/,
      '',
    )
    const target = `${host}${req.url || ''}`
    const method = req.method || 'GET'
    const headers = new Headers()
    if (req.headers['content-type']) {
      headers.set('content-type', String(req.headers['content-type']))
    }
    const response = await fetch(target, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : await readBody(req),
    })
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      if (key === 'content-encoding' || key === 'transfer-encoding') return
      res.setHeader(key, value)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    res.statusCode = 502
    res.end(error instanceof Error ? error.message : 'proxy error')
  }
}

function greenApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith('/green-api')) {
      next()
      return
    }
    req.url = req.url.replace(/^\/green-api/, '') || '/'
    void proxyGreenApi(req, res)
  }
}

function greenApiProxy(): Plugin {
  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use(greenApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(greenApiMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), greenApiProxy()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
})

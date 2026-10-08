import { createReadStream, existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.PORT || 4173)

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function proxyGreenApi(req, res) {
  try {
    const host = String(req.headers['x-green-api-host'] || 'https://api.green-api.com').replace(
      /\/$/,
      '',
    )
    const targetPath = (req.url || '').replace(/^\/green-api/, '') || '/'
    const target = `${host}${targetPath}`
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

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  return 'application/octet-stream'
}

function sendFile(res, filePath) {
  res.setHeader('Content-Type', contentType(filePath))
  createReadStream(filePath).pipe(res)
}

const server = createServer((req, res) => {
  void (async () => {
    if ((req.url || '').startsWith('/green-api')) {
      await proxyGreenApi(req, res)
      return
    }

    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    const filePath = path.join(distDir, safePath === '/' ? 'index.html' : safePath)

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      sendFile(res, filePath)
      return
    }

    const indexPath = path.join(distDir, 'index.html')
    if (!existsSync(indexPath)) {
      res.statusCode = 500
      res.end('dist/ not found. Run npm run build first.')
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(await readFile(indexPath))
  })()
})

server.listen(port, () => {
  console.log(`Server http://localhost:${port}`)
})

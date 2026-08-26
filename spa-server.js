import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 5173
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
}

/**
 * Proxy /api/* requests to the backend server.
 */
function proxyToBackend(req, res) {
  const url = new URL(req.url, BACKEND_URL)
  const proxyReq = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: req.method,
      headers: { ...req.headers, host: url.host },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    },
  )
  proxyReq.on('error', (err) => {
    console.error('API proxy error:', err.message)
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Backend unavailable' }))
  })
  req.pipe(proxyReq)
}

const server = http.createServer((req, res) => {
  // Proxy API requests to the backend
  if (req.url.startsWith('/api/')) {
    return proxyToBackend(req, res)
  }

  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url)

  // If file exists, serve it. Otherwise serve index.html (SPA fallback)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.createReadStream(path.join(DIST, 'index.html')).pipe(res)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SPA server running at http://localhost:${PORT}`)
  console.log(`API proxy → ${BACKEND_URL}`)
})

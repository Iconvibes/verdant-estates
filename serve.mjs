import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let fp = path.join(dist, url.pathname === '/' ? 'index.html' : url.pathname)
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    fp = path.join(dist, 'index.html')
  }
  const ext = path.extname(fp)
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
  fs.createReadStream(fp).pipe(res)
})

server.listen(5173, '0.0.0.0', () => {
  console.log('Serving on http://localhost:5173')
})

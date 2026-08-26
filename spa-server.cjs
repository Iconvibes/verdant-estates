const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const dist = path.join(__dirname, 'dist')
const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ico': 'image/x-icon',
}

http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://x').pathname
  let fp = path.join(dist, urlPath === '/' ? 'index.html' : urlPath)
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    fp = path.join(dist, 'index.html')
  }
  const ext = path.extname(fp)
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
  fs.createReadStream(fp).pipe(res)
}).listen(5173, '0.0.0.0', () => console.log('SPA server on http://localhost:5173'))

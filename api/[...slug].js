/**
 * Vercel Catch-All Serverless Function
 * 
 * [...slug] matches ANY path under /api/, e.g.:
 *   /api/auth/login  → slug = ['auth', 'login']
 *   /api/health      → slug = ['health']
 *   /api/listings    → slug = ['listings']
 * 
 * This forwards ALL /api/* requests to the Express app.
 */

import app from '../server/index.js'

export default function handler(req, res) {
  return app(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

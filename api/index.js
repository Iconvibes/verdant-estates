/**
 * Vercel Serverless Function — wraps the Express app.
 *
 * Vercel imports this file for every /api/* request.  The Express app is
 * stateless between invocations (in-memory data resets on cold start), so
 * for production persistence swap the in-memory db.js for a real database.
 */

import app from '../server/index.js'

export default app

// Vercel config — disable the built-in body parser so Express handles it
export const config = {
  api: {
    bodyParser: false,
  },
}

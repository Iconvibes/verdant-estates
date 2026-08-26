/**
 * Verdant Estates API — Supabase Edition
 * Drop-in replacement for server/index.js.
 * Uses the same routes but swaps db.js for the Supabase adapter.
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import listingsRouter from '../routes/listings.js'
import enquiriesRouter from '../routes/enquiries.js'
import authRouter from '../routes/auth.js'
import savedHomesRouter from '../routes/savedHomes.js'
import alertsRouter from '../routes/alerts.js'

const app = express()
const PORT = process.env.PORT && process.env.PORT !== '0' ? process.env.PORT : 3001

// --- Security & parsing ---
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

// Global rate limit: 200 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}))

// --- Routes ---
app.use('/api/listings', listingsRouter)
app.use('/api/enquiries', enquiriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/saved', savedHomesRouter)
app.use('/api/alerts', alertsRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'supabase', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Verdant Estates API (Supabase) running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})

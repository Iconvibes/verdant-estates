import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getListings } from '../data/db.js'
import { authenticate } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ALERTS_FILE = join(__dirname, '..', 'data', 'alerts.json')
const NOTIFICATIONS_FILE = join(__dirname, '..', 'data', 'notifications.json')

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

// --- Helpers ---
function readJSON(file, fallback = []) {
  if (!existsSync(file)) {
    writeFileSync(file, JSON.stringify(fallback, null, 2))
    return fallback
  }
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function writeJSON(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2))
}

function getAlerts() {
  return readJSON(ALERTS_FILE)
}

function saveAlerts(alerts) {
  writeJSON(ALERTS_FILE, alerts)
}

function getNotifications() {
  return readJSON(NOTIFICATIONS_FILE)
}

function saveNotifications(notifications) {
  writeJSON(NOTIFICATIONS_FILE, notifications)
}

/**
 * Check if a new listing matches any alert subscriptions.
 * Returns an array of { alertId, email, property } for each match.
 */
function findMatchingAlerts(newListing) {
  const alerts = getAlerts()
  const matches = []

  for (const alert of alerts) {
    if (!alert.active) continue

    const criteria = alert.criteria || {}
    let matched = true

    // Type filter
    if (criteria.type && criteria.type !== 'All' && newListing.type !== criteria.type) {
      matched = false
    }

    // Price range
    if (criteria.minPrice && newListing.price < criteria.minPrice) {
      matched = false
    }
    if (criteria.maxPrice && newListing.price > criteria.maxPrice) {
      matched = false
    }

    // Bedrooms
    if (criteria.beds && newListing.beds < criteria.beds) {
      matched = false
    }

    // Area filter (neighbourhood search)
    if (criteria.area) {
      const q = criteria.area.toLowerCase()
      if (!newListing.address.toLowerCase().includes(q)) {
        matched = false
      }
    }

    if (matched) {
      matches.push({
        alertId: alert.id,
        email: alert.email,
        name: alert.name,
        property: newListing,
      })
    }
  }

  return matches
}

// Rate limit: 3 subscriptions per email per hour
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many subscription attempts. Please try again later.' },
})

const router = Router()

// POST /api/alerts — public, rate limited
router.post(
  '/',
  alertLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('name').optional().trim(),
    body('criteria').optional().isObject(),
    body('criteria.type').optional().isString(),
    body('criteria.minPrice').optional().isNumeric(),
    body('criteria.maxPrice').optional().isNumeric(),
    body('criteria.beds').optional().isInt({ min: 1 }),
    body('criteria.area').optional().isString(),
  ],
  (req, res) => {
    if (!validate(req, res)) return

    const alerts = getAlerts()

    // Check for duplicate email + same criteria
    const existing = alerts.find(
      (a) =>
        a.email === req.body.email &&
        a.active &&
        JSON.stringify(a.criteria) === JSON.stringify(req.body.criteria || {}),
    )
    if (existing) {
      return res.status(409).json({
        error: 'You already have an active alert for these criteria.',
        alertId: existing.id,
      })
    }

    const alert = {
      id: crypto.randomUUID(),
      email: req.body.email,
      name: req.body.name || null,
      criteria: req.body.criteria || {},
      active: true,
      createdAt: new Date().toISOString(),
    }

    alerts.push(alert)
    saveAlerts(alerts)

    res.status(201).json({
      success: true,
      message: 'Alert created. You will be notified when matching listings appear.',
      alert,
    })
  },
)

// GET /api/alerts — admin only
router.get('/', authenticate, (_req, res) => {
  const alerts = getAlerts()
  res.json({ alerts, total: alerts.length })
})

// DELETE /api/alerts/:id — public (allows unsubscribe via link)
router.delete('/:id', (req, res) => {
  const alerts = getAlerts()
  const index = alerts.findIndex((a) => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Alert not found' })
  }

  alerts[index].active = false
  alerts[index].unsubscribedAt = new Date().toISOString()
  saveAlerts(alerts)

  res.json({ success: true, message: 'Alert unsubscribed successfully.' })
})

// POST /api/alerts/notify — admin only, triggers notifications for a new listing
router.post('/notify', authenticate, [
  body('listingId').isInt({ min: 1 }).withMessage('listingId required'),
], (req, res) => {
  if (!validate(req, res)) return

  const listing = getListings().find((l) => l.id === Number(req.body.listingId))
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const matches = findMatchingAlerts(listing)
  const notifications = getNotifications()

  for (const match of matches) {
    notifications.push({
      id: crypto.randomUUID(),
      alertId: match.alertId,
      email: match.email,
      listingId: listing.id,
      listingName: listing.name,
      sentAt: new Date().toISOString(),
    })
  }
  saveNotifications(notifications)

  // In production, send actual emails here:
  // for (const match of matches) {
  //   await sendEmail({
  //     to: match.email,
  //     subject: `New listing: ${listing.name}`,
  //     html: `...`
  //   })
  // }

  res.json({
    success: true,
    matched: matches.length,
    notifications: matches.map((m) => ({
      email: m.email,
      listing: m.property.name,
    })),
  })
})

// GET /api/alerts/check/:email — check active alerts for a specific email
router.get('/check/:email', (req, res) => {
  const alerts = getAlerts()
  const active = alerts.filter(
    (a) => a.email === req.params.email && a.active,
  )
  res.json({ alerts: active, total: active.length })
})

export default router
export { findMatchingAlerts }

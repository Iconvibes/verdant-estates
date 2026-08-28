import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { getAlerts, subscribeAlert, unsubscribeAlert, getListings } from '../data/bridge.js'
import { authenticate } from '../middleware/auth.js'

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

/**
 * Check if a new listing matches any alert subscriptions.
 * Returns an array of { alertId, email, name, property } for each match.
 */
export function findMatchingAlerts(newListing) {
  // getAlerts may be sync (JSON) or async (Supabase)
  const result = getAlerts()
  // If it returns a Promise, we handle it in the calling code
  if (result && typeof result.then === 'function') {
    return result.then(alerts => matchAlerts(alerts, newListing))
  }
  return matchAlerts(result, newListing)
}

function matchAlerts(alerts, newListing) {
  const matches = []
  for (const alert of alerts) {
    if (!alert.active) continue
    const criteria = alert.filters || alert.criteria || {}
    let matched = true

    if (criteria.type && criteria.type !== 'All' && newListing.type !== criteria.type) matched = false
    if (criteria.minPrice && newListing.price < criteria.minPrice) matched = false
    if (criteria.maxPrice && newListing.price > criteria.maxPrice) matched = false
    if (criteria.beds && newListing.beds < criteria.beds) matched = false
    if (criteria.area) {
      const q = criteria.area.toLowerCase()
      if (!newListing.address.toLowerCase().includes(q)) matched = false
    }

    if (matched) {
      matches.push({ alertId: alert.id, email: alert.email, name: alert.name, property: newListing })
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

// Rate limit: 10 unsubscribes per IP per hour (prevents enumeration)
const unsubscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
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
  async (req, res) => {
    if (!validate(req, res)) return

    const alert = await subscribeAlert({
      email: req.body.email,
      name: req.body.name || null,
      filters: req.body.criteria || {},
    })

    res.status(201).json({
      success: true,
      message: 'Alert created. You will be notified when matching listings appear.',
      alert,
    })
  },
)

// GET /api/alerts — admin only
router.get('/', authenticate, async (_req, res) => {
  const alerts = await getAlerts()
  res.json({ alerts, total: alerts.length })
})

// DELETE /api/alerts/:id — public with rate limit (allows unsubscribe via email link)
router.delete('/:id', unsubscribeLimiter, async (req, res) => {
  const result = await unsubscribeAlert(req.params.id)
  if (!result) {
    return res.status(404).json({ error: 'Alert not found' })
  }
  res.json({ success: true, message: 'Alert unsubscribed successfully.' })
})

// POST /api/alerts/notify — admin only, triggers notifications for a new listing
router.post('/notify', authenticate, [
  body('listingId').isInt({ min: 1 }).withMessage('listingId required'),
], async (req, res) => {
  if (!validate(req, res)) return

  const listing = await getListings().then(listings =>
    listings.find((l) => l.id === Number(req.body.listingId))
  )
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const alerts = await getAlerts()
  const matches = matchAlerts(alerts, listing)

  // TODO: Send alert emails (Resend)
  // for (const match of matches) { sendAlertMatch(match, listing) }

  res.json({
    success: true,
    matched: matches.length,
    notifications: matches.map((m) => ({
      email: m.email,
      listing: m.property.name,
    })),
  })
})

// GET /api/alerts/check/:email — check active alerts for a specific email (rate limited)
router.get('/check/:email', unsubscribeLimiter, async (req, res) => {
  const alerts = await getAlerts()
  const active = alerts.filter(
    (a) => a.email === req.params.email && a.active,
  )
  res.json({ alerts: active, total: active.length })
})

export default router

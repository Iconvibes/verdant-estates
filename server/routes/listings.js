import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { getListings, getListingById, createListing, updateListing, deleteListing } from '../data/bridge.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

// Fields allowed for create/update (prevents mass assignment)
const ALLOWED_FIELDS = [
  'name', 'type', 'price', 'address', 'coords', 'beds', 'baths',
  'area', 'yearBuilt', 'image', 'images', 'floor_plan', 'tagline', 'description', 'features', 'agent',
]

function filterFields(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key)),
  )
}

// GET /api/listings — public, supports query filters
router.get(
  '/',
  [
    query('type').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('beds').optional().isInt({ min: 1 }),
    query('q').optional().isString(),
    query('sort').optional().isIn(['featured', 'price-asc', 'price-desc', 'newest']),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const listings = await getListings(req.query)

    // Sort
    const sort = req.query.sort || 'featured'
    listings.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'newest') return (b.yearBuilt || 0) - (a.yearBuilt || 0)
      return 0 // featured: keep DB order
    })

    res.json({ listings, total: listings.length })
  },
)

// GET /api/listings/types — get unique property types
router.get('/types', async (_req, res) => {
  const listings = await getListings()
  const types = ['All', ...new Set(listings.map((l) => l.type))]
  res.json({ types })
})

// GET /api/listings/:id — public
router.get('/:id', [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return

  const listing = await getListingById(req.params.id)
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  res.json({ listing })
})

// POST /api/listings — admin only
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('beds').isInt({ min: 1 }).withMessage('Bedrooms must be at least 1'),
    body('baths').isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
    body('area').isNumeric().withMessage('Area must be a number'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const filtered = filterFields(req.body)
    const listing = await createListing(filtered)

    // TODO: Check alert subscriptions and send notification emails
    // const matches = findMatchingAlerts(listing)
    // for (const match of matches) { sendAlertMatch(match, listing) }

    res.status(201).json({ listing })
  },
)

// PUT /api/listings/:id — admin only
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    if (!validate(req, res)) return

    const filtered = filterFields(req.body)
    const listing = await updateListing(req.params.id, filtered)
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }
    res.json({ listing })
  },
)

// DELETE /api/listings/:id — admin only
router.delete('/:id', authenticate, requireAdmin, [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return

  const deleted = await deleteListing(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  res.json({ success: true })
})

export default router

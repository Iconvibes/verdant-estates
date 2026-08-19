import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { getListings, getListingById, createListing, updateListing, deleteListing } from '../data/db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
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
  (req, res) => {
    if (!validate(req, res)) return

    const listings = getListings(req.query)

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
router.get('/types', (_req, res) => {
  const listings = getListings()
  const types = ['All', ...new Set(listings.map((l) => l.type))]
  res.json({ types })
})

// GET /api/listings/:id — public
router.get('/:id', [param('id').isInt({ min: 1 })], (req, res) => {
  if (!validate(req, res)) return

  const listing = getListingById(req.params.id)
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  res.json({ listing })
})

// POST /api/listings — admin only
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('beds').isInt({ min: 1 }).withMessage('Bedrooms must be at least 1'),
    body('baths').isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
    body('area').isNumeric().withMessage('Area must be a number'),
  ],
  (req, res) => {
    if (!validate(req, res)) return

    const listing = createListing(req.body)
    res.status(201).json({ listing })
  },
)

// PUT /api/listings/:id — admin only
router.put(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 })],
  (req, res) => {
    if (!validate(req, res)) return

    const listing = updateListing(req.params.id, req.body)
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }
    res.json({ listing })
  },
)

// DELETE /api/listings/:id — admin only
router.delete('/:id', authenticate, [param('id').isInt({ min: 1 })], (req, res) => {
  if (!validate(req, res)) return

  const deleted = deleteListing(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  res.json({ success: true })
})

export default router

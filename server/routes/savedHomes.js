import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { getSavedHomes, toggleSavedHome, clearSavedHomes, getListingById } from '../data/bridge.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All saved homes routes require authentication
router.use(authenticate)

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

// GET /api/saved — get all saved property IDs (with full listing data)
router.get('/', async (req, res) => {
  const propertyIds = await getSavedHomes(req.user.userId)
  const listings = []
  for (const id of propertyIds) {
    const listing = await getListingById(id)
    if (listing) listings.push(listing)
  }

  res.json({ savedIds: propertyIds, listings: listings.filter(Boolean) })
})

// POST /api/saved/toggle — toggle a property in/out of saved list
router.post(
  '/toggle',
  [body('propertyId').isInt({ min: 1 }).withMessage('propertyId must be a positive integer')],
  async (req, res) => {
    if (!validate(req, res)) return

    const result = await toggleSavedHome(req.user.userId, req.body.propertyId)
    const allIds = await getSavedHomes(req.user.userId)

    res.json({ ...result, savedIds: allIds })
  },
)

// DELETE /api/saved — clear all saved homes
router.delete('/', async (req, res) => {
  await clearSavedHomes(req.user.userId)
  res.json({ success: true, savedIds: [] })
})

export default router

import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { getSavedHomes, toggleSavedHome, clearSavedHomes, getListingById } from '../data/db.js'
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
router.get('/', (req, res) => {
  const propertyIds = getSavedHomes(req.user.userId)
  const listings = propertyIds
    .map((id) => getListingById(id))
    .filter(Boolean)

  res.json({ savedIds: propertyIds, listings })
})

// POST /api/saved/toggle — toggle a property in/out of saved list
router.post(
  '/toggle',
  [body('propertyId').isInt({ min: 1 }).withMessage('propertyId must be a positive integer')],
  (req, res) => {
    if (!validate(req, res)) return

    const result = toggleSavedHome(req.user.userId, req.body.propertyId)
    const allIds = getSavedHomes(req.user.userId)

    res.json({ ...result, savedIds: allIds })
  },
)

// DELETE /api/saved — clear all saved homes
router.delete('/', (req, res) => {
  clearSavedHomes(req.user.userId)
  res.json({ success: true, savedIds: [] })
})

export default router

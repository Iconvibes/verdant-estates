import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { createEnquiry, getEnquiries, updateEnquiryStatus } from '../data/bridge.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Rate limit: max 5 enquiries per IP per hour
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many enquiries. Please try again later.' },
})

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

// POST /api/enquiries — public, rate limited
router.post(
  '/',
  enquiryLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().trim(),
    body('interest').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('propertyId').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const enquiry = await createEnquiry({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      interest: req.body.interest || 'General enquiry',
      message: req.body.message,
      propertyId: req.body.propertyId || null,
      ip: req.ip,
    })

    // TODO: Send email notifications (Resend)
    // sendEnquiryConfirmation(enquiry)
    // sendNewEnquiryAlert(enquiry)

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received. We will respond within one working day.',
      id: enquiry.id,
    })
  },
)

// GET /api/enquiries — admin only
router.get('/', authenticate, async (_req, res) => {
  const enquiries = await getEnquiries()
  res.json({ enquiries, total: enquiries.length })
})

// PATCH /api/enquiries/:id — admin only, update status
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  [body('status').isIn(['new', 'contacted', 'resolved', 'archived'])],
  async (req, res) => {
    if (!validate(req, res)) return

    const updated = await updateEnquiryStatus(req.params.id, req.body.status)
    if (!updated) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }
    res.json({ enquiry: updated })
  },
)

export default router

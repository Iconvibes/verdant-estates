import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { findUserByEmail, createUser } from '../data/db.js'
import { signToken, authenticate } from '../middleware/auth.js'

const router = Router()

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  (req, res) => {
    if (!validate(req, res)) return

    const existing = findUserByEmail(req.body.email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    // In production, hash the password with bcrypt. Keeping it simple for dev.
    const user = createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // TODO: hash in production
      role: 'user',
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    })
  },
)

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => {
    if (!validate(req, res)) return

    const user = findUserByEmail(req.body.email)
    if (!user || user.password !== req.body.password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    })
  },
)

// GET /api/auth/me — get current user from token
router.get('/me', authenticate, (req, res) => {
  const user = findUserByEmail(req.user.email)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

export default router

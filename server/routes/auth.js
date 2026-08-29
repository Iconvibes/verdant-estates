import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import { findUserByEmail, createUser, updateUserPassword } from '../data/bridge.js'
import { signToken, authenticate } from '../middleware/auth.js'

const router = Router()

const SALT_ROUNDS = 12

const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return false
  }
  return true
}

/** Safe user object — never leaks password hash */
function safeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    mustChangePassword: u.mustChangePassword ?? false,
  }
}

// Rate limit: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
})

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS)

    const user = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: 'user',
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    res.status(201).json({ user: safeUser(user), token })
  },
)

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const user = await findUserByEmail(req.body.email)

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    res.json({ user: safeUser(user), token })
  },
)

// GET /api/auth/me — get current user from token
router.get('/me', authenticate, async (req, res) => {
  const user = await findUserByEmail(req.user.email)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ user: safeUser(user) })
})

// POST /api/auth/change-password — requires current password
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return

    const user = await findUserByEmail(req.user.email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const valid = await bcrypt.compare(req.body.currentPassword, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Prevent reusing the same password
    const sameAsCurrent = await bcrypt.compare(req.body.newPassword, user.password)
    if (sameAsCurrent) {
      return res.status(400).json({ error: 'New password must be different from current password' })
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS)
    const updated = await updateUserPassword(user.id, hashedPassword)

    const token = signToken({ userId: updated.id, email: updated.email, role: updated.role })

    res.json({
      user: safeUser(updated),
      token,
      message: 'Password changed successfully',
    })
  },
)

export default router

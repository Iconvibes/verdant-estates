import jwt from 'jsonwebtoken'

// Require JWT_SECRET from environment — no hardcoded fallback in production.
// On Vercel, set this via the dashboard → Settings → Environment Variables.
const JWT_SECRET = process.env.JWT_SECRET
// Dev-only fallback so local development still works without a .env
const SECRET = JWT_SECRET || 'dev-only-fallback-change-me'

// Pin algorithm to prevent algorithm confusion attacks (OWASP recommendation)
const JWT_ALGORITHM = 'HS256'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { algorithm: JWT_ALGORITHM, expiresIn: '30d' })
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, SECRET, { algorithms: [JWT_ALGORITHM] })
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Require admin role. Must be used AFTER authenticate middleware.
 */
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), SECRET, { algorithms: [JWT_ALGORITHM] })
    } catch {
      // ignore invalid token — continue unauthenticated
    }
  }
  next()
}

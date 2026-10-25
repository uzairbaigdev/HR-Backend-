import jwt from 'jsonwebtoken'

export const AUTH_COOKIE_NAME = 'auth_token'
export const AUTH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters in Backend/.env.')
  }

  return secret
}

export function createAuthToken(userId, claims = {}) {
  return jwt.sign(claims, getJwtSecret(), {
    subject: userId,
    expiresIn: '7d',
  })
}

export function authenticate(request, response, next) {
  const token = request.cookies?.[AUTH_COOKIE_NAME]

  if (!token) {
    return response.status(401).json({ message: 'Authentication is required.' })
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    request.auth = {
      userId: payload.sub,
      role: payload.role ?? null,
      roleRequestStatus: payload.roleRequestStatus ?? 'none',
    }
    return next()
  } catch {
    return response.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
    maxAge: AUTH_TOKEN_MAX_AGE,
  }
}

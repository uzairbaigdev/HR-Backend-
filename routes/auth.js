import { Router } from 'express'
import User from '../models/User.js'
import {
  AUTH_COOKIE_NAME,
  authenticate,
  authCookieOptions,
  createAuthToken,
} from '../auth.js'

const router = Router()

router.get('/me', authenticate, async (request, response) => {
  const user = await User.findById(request.auth.userId).select(
    'username email role roleRequest roleRequestStatus',
  )

  if (!user) {
    response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions())
    return response.status(401).json({ message: 'Account no longer exists.' })
  }

  if (
    request.auth.role !== user.role ||
    request.auth.roleRequestStatus !== user.roleRequestStatus
  ) {
    response.cookie(
      AUTH_COOKIE_NAME,
      createAuthToken(user.id, {
        role: user.role,
        roleRequestStatus: user.roleRequestStatus,
      }),
      authCookieOptions(),
    )
  }

  return response.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      roleRequest: user.roleRequest,
      roleRequestStatus: user.roleRequestStatus,
    },
  })
})

router.post('/logout', (_request, response) => {
  response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions())
  return response.json({ message: 'Logged out successfully.' })
})

export default router

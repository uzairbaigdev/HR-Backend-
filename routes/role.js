import { Router } from 'express'
import { timingSafeEqual } from 'node:crypto'
import {
  AUTH_COOKIE_NAME,
  authenticate,
  authCookieOptions,
  createAuthToken,
} from '../auth.js'
import User from '../models/User.js'

const router = Router()
const selectableRoles = new Set(['admin', 'hr', 'employee'])

function hasValidAdminPassword(password) {
  const expectedPassword = process.env.ADMIN_ROLE_PASSWORD

  if (!expectedPassword) {
    return null
  }

  const provided = Buffer.from(password)
  const expected = Buffer.from(expectedPassword)

  return (
    provided.length === expected.length &&
    timingSafeEqual(provided, expected)
  )
}

router.post('/', authenticate, async (request, response) => {
  const { role, adminPassword } = request.body ?? {}

  if (typeof role !== 'string' || !selectableRoles.has(role)) {
    return response.status(400).json({
      message: 'Choose one of the available roles: Admin, HR, or Employee.',
    })
  }

  if (role === 'admin') {
    if (
      typeof adminPassword !== 'string' ||
      adminPassword.length === 0 ||
      adminPassword.length > 256
    ) {
      return response.status(400).json({ message: 'Admin password is required.' })
    }

    const isPasswordValid = hasValidAdminPassword(adminPassword)

    if (isPasswordValid === null) {
      return response.status(503).json({
        message: 'Admin role access is not configured on the server.',
      })
    }

    if (!isPasswordValid) {
      return response.status(403).json({ message: 'Admin password is incorrect.' })
    }
  }

  const user = await User.findById(request.auth.userId).select(
    'username email role roleRequest roleRequestStatus',
  )

  if (!user) {
    response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions())
    return response.status(401).json({ message: 'Account no longer exists.' })
  }

  const savedUser = await User.findByIdAndUpdate(
    user.id,
    {
      $set: {
        role,
        roleRequest: null,
        roleRequestStatus: role === 'admin' ? 'approved' : 'none',
      },
    },
    { returnDocument: 'after', runValidators: true },
  ).select('username email role roleRequest roleRequestStatus')

  if (!savedUser || savedUser.role !== role) {
    throw new Error('The selected role could not be saved.')
  }

  response.cookie(
    AUTH_COOKIE_NAME,
    createAuthToken(savedUser.id, {
      role: savedUser.role,
      roleRequestStatus: savedUser.roleRequestStatus,
    }),
    authCookieOptions(),
  )

  return response.json({
    message: 'Role saved successfully.',
    pendingApproval: false,
    user: {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      roleRequest: savedUser.roleRequest,
      roleRequestStatus: savedUser.roleRequestStatus,
    },
  })
})

router.patch('/:userId/approve', authenticate, async (request, response) => {
  const approver = await User.findById(request.auth.userId).select('role')

  if (!approver || approver.role !== 'admin') {
    return response.status(403).json({ message: 'Only an administrator can approve role requests.' })
  }

  const user = await User.findById(request.params.userId)

  if (!user) {
    return response.status(404).json({ message: 'User not found.' })
  }

  if (user.roleRequest !== 'admin' || user.roleRequestStatus !== 'pending') {
    return response.status(409).json({ message: 'This user has no pending admin request.' })
  }

  user.role = 'admin'
  user.roleRequestStatus = 'approved'
  await user.save()

  return response.json({
    message: 'Admin access approved.',
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

export default router

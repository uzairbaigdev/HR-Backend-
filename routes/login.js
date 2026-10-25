import { Router } from 'express'
import bcrypt from 'bcryptjs'
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createAuthToken,
} from '../auth.js'
import User from '../models/User.js'
import { loginSchema } from '../validation/loginSchema.js'

const router = Router()

router.post('/', async (request, response) => {
  let values

  try {
    values = await loginSchema.validate(request.body ?? {}, {
      abortEarly: false,
      stripUnknown: true,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        message: error.errors[0],
        errors: error.inner.map(({ path, message }) => ({ field: path, message })),
      })
    }

    throw error
  }

  const user = await User.findOne({ email: values.email }).select('+password')
  const passwordMatches = user
    ? await bcrypt.compare(values.password, user.password)
    : false

  if (!passwordMatches) {
    return response.status(401).json({ message: 'Email or password is incorrect.' })
  }

  response.cookie(
    AUTH_COOKIE_NAME,
    createAuthToken(user.id, {
      role: user.role,
      roleRequestStatus: user.roleRequestStatus,
    }),
    authCookieOptions(),
  )

  return response.json({
    message: 'Logged in successfully.',
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
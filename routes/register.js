import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { authCookieOptions, AUTH_COOKIE_NAME, createAuthToken } from '../auth.js'
import User from '../models/User.js'
import { registerSchema } from '../validation/registerSchema.js'

const router = Router()

router.post('/', async (request, response) => {
  let values

  try {
    values = await registerSchema.validate(request.body ?? {}, {
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

  try {
    const passwordHash = await bcrypt.hash(values.password, 12)
    const user = await User.create({
      username: values.username,
      email: values.email,
      password: passwordHash,
    })

    const token = createAuthToken(user.id, {
      role: user.role,
      roleRequestStatus: user.roleRequestStatus,
    })
    response.cookie(AUTH_COOKIE_NAME, token, authCookieOptions())

    return response.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleRequest: user.roleRequest,
        roleRequestStatus: user.roleRequestStatus,
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return response
        .status(409)
        .json({ message: 'An account with that username or email already exists.' })
    }

    throw error
  }
})

export default router
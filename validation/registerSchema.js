import * as yup from 'yup'

const usernamePattern = /^[\p{L}\p{N}_. -]+$/u

export const registerSchema = yup.object({
  username: yup
    .string()
    .trim()
    .lowercase()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username cannot exceed 30 characters.')
    .matches(usernamePattern, 'Username contains unsupported characters.')
    .required('Username is required.'),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.')
    .required('Email is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .test(
      'bcrypt-byte-limit',
      'Password must be no more than 72 bytes.',
      (value) => !value || Buffer.byteLength(value, 'utf8') <= 72,
    )
    .required('Password is required.'),
})

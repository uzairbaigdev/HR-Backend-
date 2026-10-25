import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.')
    .required('Email is required.'),
  password: yup
    .string()
    .required('Password is required.')
    .test(
      'bcrypt-byte-limit',
      'Password must be no more than 72 bytes.',
      (value) => !value || Buffer.byteLength(value, 'utf8') <= 72,
    ),
})

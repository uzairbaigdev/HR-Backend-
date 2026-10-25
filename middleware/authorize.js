import User from '../models/User.js'
import Employee from '../models/Employee.js'

export function allowRoles(...roles) {
  return async (request, response, next) => {
    try {
      const user = await User.findById(request.auth.userId).select('role')

      if (!user) {
        return response.status(401).json({ message: 'Account no longer exists.' })
      }

      request.auth.role = user.role
      if (!roles.includes(user.role)) {
        return response.status(403).json({ message: 'You do not have access to this action.' })
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export async function getCurrentEmployee(userId) {
  return Employee.findOne({ userId })
}

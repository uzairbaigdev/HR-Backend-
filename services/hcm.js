import AuditLog from '../models/AuditLog.js'
import Attendance from '../models/Attendance.js'
import CompanySettings from '../models/CompanySettings.js'
import Employee from '../models/Employee.js'
import Holiday from '../models/Holiday.js'
import LeaveRequest from '../models/LeaveRequest.js'
import LeaveType from '../models/LeaveType.js'

export async function recordAudit(actorId, action, entity, entityId = '', details = {}) {
  await AuditLog.create({ actorId, action, entity, entityId, details })
}

export async function getCompanySettings() {
  let settings = await CompanySettings.findOne({ key: 'company' })
  if (!settings) settings = await CompanySettings.create({ key: 'company' })
  return settings
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

export async function countWorkingDays(start, end, settings) {
  const holidays = new Set(
    (await Holiday.find({ dateKey: { $gte: dateKey(start), $lte: dateKey(end) } }).select('dateKey'))
      .map((holiday) => holiday.dateKey),
  )
  const weekends = new Set(settings.weekends)
  let total = 0
  const current = new Date(`${dateKey(start)}T00:00:00.000Z`)
  const last = new Date(`${dateKey(end)}T00:00:00.000Z`)

  while (current <= last) {
    const key = dateKey(current)
    if (!weekends.has(current.getUTCDay()) && !holidays.has(key)) total += 1
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return total
}

export function workingDaysInMonth(year, month, weekends, holidayKeys = new Set()) {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  let total = 0
  for (let day = 1; day <= days; day += 1) {
    const current = new Date(Date.UTC(year, month - 1, day))
    if (!weekends.includes(current.getUTCDay()) && !holidayKeys.has(dateKey(current))) total += 1
  }
  return total
}

export function annualTax(grossAnnual) {
  if (grossAnnual <= 600_000) return 0
  if (grossAnnual <= 1_200_000) return (grossAnnual - 600_000) * 0.05
  if (grossAnnual <= 2_400_000) return 30_000 + (grossAnnual - 1_200_000) * 0.15
  if (grossAnnual <= 3_600_000) return 210_000 + (grossAnnual - 2_400_000) * 0.25
  return 510_000 + (grossAnnual - 3_600_000) * 0.35
}

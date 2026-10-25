import mongoose from 'mongoose'

const companySettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'company', unique: true },
    companyName: { type: String, default: 'My Company', trim: true },
    officeStart: { type: String, default: '09:00' },
    graceMinutes: { type: Number, default: 15, min: 0, max: 180 },
    halfDayHours: { type: Number, default: 5, min: 1, max: 12 },
    weekends: { type: [Number], default: [0, 6] },
    officeLatitude: { type: Number, default: null },
    officeLongitude: { type: Number, default: null },
    officeRadiusMeters: { type: Number, default: 150, min: 1 },
  },
  { timestamps: true },
)

export default mongoose.models.CompanySettings ||
  mongoose.model('CompanySettings', companySettingsSchema)

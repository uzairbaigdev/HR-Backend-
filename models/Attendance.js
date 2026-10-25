import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    dateKey: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ['present', 'late', 'half_day', 'missing_checkout'],
      required: true,
    },
    workedMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
)

attendanceSchema.index({ employeeId: 1, dateKey: 1 }, { unique: true })
attendanceSchema.index({ dateKey: 1, status: 1 })

export default mongoose.models.Attendance ||
  mongoose.model('Attendance', attendanceSchema)

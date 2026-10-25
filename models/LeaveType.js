import mongoose from 'mongoose'

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    yearlyQuota: { type: Number, default: 0, min: 0 },
    paid: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.LeaveType ||
  mongoose.model('LeaveType', leaveTypeSchema)

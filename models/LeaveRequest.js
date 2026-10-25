import mongoose from 'mongoose'

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    workingDays: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewComment: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1, status: 1 })

export default mongoose.models.LeaveRequest ||
  mongoose.model('LeaveRequest', leaveRequestSchema)

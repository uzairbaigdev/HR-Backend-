import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeCode: { type: String, required: true, unique: true, trim: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    designation: { type: String, required: true, trim: true },
    joinDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'probation', 'inactive'],
      default: 'active',
    },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    salary: {
      basic: { type: Number, required: true, min: 0 },
      allowances: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
)

employeeSchema.index({ departmentId: 1, status: 1 })

export default mongoose.models.Employee ||
  mongoose.model('Employee', employeeSchema)

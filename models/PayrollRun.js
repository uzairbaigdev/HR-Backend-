import mongoose from 'mongoose'

const payrollLineSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeCode: String,
    name: String,
    basic: Number,
    hra: Number,
    medical: Number,
    gross: Number,
    deductions: Number,
    tax: Number,
    net: Number,
    absentDays: Number,
    halfDays: Number,
    unpaidDays: Number,
  },
  { _id: false },
)

const payrollRunSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true },
    status: { type: String, enum: ['draft', 'finalized'], default: 'draft' },
    lines: { type: [payrollLineSchema], default: [] },
    totalGross: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalNet: { type: Number, default: 0 },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    finalizedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.models.PayrollRun ||
  mongoose.model('PayrollRun', payrollRunSchema)

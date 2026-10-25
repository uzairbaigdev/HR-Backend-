import mongoose from 'mongoose'

const holidaySchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export default mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema)

import mongoose from 'mongoose'

export async function connectToDatabase() {
  const uri = process.env.DATABASE_URL

  if (!uri) {
    throw new Error('DATABASE_URL is required. Set it in Backend/.env.')
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 })
  console.log('Connected to MongoDB')
}

import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { getJwtSecret } from './auth.js'
import { connectToDatabase } from './database.js'
import authRouter from './routes/auth.js'
import hcmRouter from './routes/hcm.js'
import loginRouter from './routes/login.js'
import registerRouter from './routes/register.js'
import roleRouter from './routes/role.js'

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(express.json())
app.use(cookieParser())
app.use('/api/register', registerRouter)
app.use('/api/login', loginRouter)
app.use('/api/auth', authRouter)
app.use('/api/role', roleRouter)
app.use('/api/hcm', hcmRouter)

app.get('/', (_request, response) => {
  response.send('HR System API is running')
})

app.get('/api/health', (_request, response) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1
  response.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? 'ok' : 'unavailable',
    database: isDatabaseConnected ? 'connected' : 'disconnected',
  })
})

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Request body must be valid JSON.' })
  }

  console.error('API request failed:', error)
  return response.status(500).json({ message: 'An unexpected server error occurred.' })
})

async function startServer() {
  try {
    getJwtSecret()
    await connectToDatabase()

    const server = app.listen(port, () => {
      console.log(`HR System API listening on http://localhost:${port}`)
    })

    const shutdown = async (signal) => {
      console.log(`${signal} received; shutting down`)

      try {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
        })
        await mongoose.disconnect()
      } catch (error) {
        console.error('Error while shutting down:', error)
        process.exitCode = 1
      }
    }

    process.once('SIGINT', () => shutdown('SIGINT'))
    process.once('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error('Failed to start the API:', error)
    process.exitCode = 1
  }
}

await startServer()
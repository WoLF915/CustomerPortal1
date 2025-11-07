// server-http.js - HTTP Express server for easier development
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import paymentsRoutes from './routes/payments.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3001

const app = express()

// Basic security headers
app.use(helmet())

// JSON parsing
app.use(express.json())

// CORS - allow localhost frontend for dev
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://localhost:5173'], 
  credentials: true 
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120 // limit each IP to 120 requests per windowMs
})
app.use(limiter)

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentsRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

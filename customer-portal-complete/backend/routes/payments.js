// backend/routes/payments.js
import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'
import { nanoid } from 'nanoid'
import { validateSession } from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const file = path.join(__dirname, '..', 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

const router = express.Router()

// Enhanced input sanitization function to prevent all injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Comprehensive sanitization for SQL injection, XSS, and other attacks
  return input
    .replace(/[<>\"'%;()&+\x00-\x1f\x7f-\x9f]/g, '') // Remove dangerous characters
    .replace(/script/gi, '') // Remove script tags
    .replace(/javascript/gi, '') // Remove javascript
    .replace(/vbscript/gi, '') // Remove vbscript
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URIs
    .replace(/vbscript:/gi, '') // Remove vbscript URIs
    .replace(/javascript:/gi, '') // Remove javascript URIs
    .replace(/expression/gi, '') // Remove CSS expressions
    .replace(/url\(/gi, '') // Remove CSS url functions
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/\r\n/g, '') // Remove line breaks
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\n/g, '') // Remove newlines
    .trim()
}

// Enhanced whitelist patterns for comprehensive input validation
const currencyPattern = /^[A-Z]{3}$/
const amountPattern = /^\d{1,12}(?:\.\d{1,2})?$/
const providerPattern = /^[A-Za-z0-9\s.-]{2,50}$/
const swiftPattern = /^[A-Z0-9]{8,11}$/
const payeeAccountPattern = /^\d{6,22}$/
const payeeNamePattern = /^[A-Za-z\s.'-]{2,100}$/
const descriptionPattern = /^[A-Za-z0-9\s.,!?@#$%&*()-]{0,200}$/
const userIdPattern = /^[A-Za-z0-9_-]{10,30}$/

// Create transaction (customer) - protected with session validation
router.post('/create', validateSession, async (req, res) => {
  const { userId, amount, currency, provider, payeeAccount, swift, payeeName, description } = req.body

  // Sanitize all string inputs
  const sanitizedUserId = sanitizeInput(userId)
  const sanitizedCurrency = sanitizeInput(currency)
  const sanitizedProvider = sanitizeInput(provider)
  const sanitizedPayeeAccount = sanitizeInput(payeeAccount)
  const sanitizedSwift = sanitizeInput(swift)
  const sanitizedPayeeName = payeeName ? sanitizeInput(payeeName) : ''
  const sanitizedDescription = description ? sanitizeInput(description) : ''

  if (!sanitizedUserId || !amount || !sanitizedCurrency || !sanitizedProvider || !sanitizedPayeeAccount || !sanitizedSwift) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  // Comprehensive input validation using whitelist patterns
  if (!userIdPattern.test(sanitizedUserId) ||
      !amountPattern.test(String(amount)) ||
      !currencyPattern.test(sanitizedCurrency) ||
      !providerPattern.test(sanitizedProvider) ||
      !swiftPattern.test(sanitizedSwift) ||
      !payeeAccountPattern.test(sanitizedPayeeAccount) ||
      (sanitizedPayeeName && !payeeNamePattern.test(sanitizedPayeeName)) ||
      (sanitizedDescription && !descriptionPattern.test(sanitizedDescription))) {
    return res.status(400).json({ message: 'Invalid input format - contains prohibited characters or format' })
  }

  await db.read()
  db.data ||= { users: [], transactions: [], systemSettings: {} }

  // Ensure user exists
  const user = db.data.users.find(u => u.id === sanitizedUserId && u.role === 'customer')
  if (!user) return res.status(403).json({ message: 'Not authorized' })

  // Check system limits
  const settings = db.data.systemSettings
  const amountNum = parseFloat(amount)
  if (settings.maxTransactionAmount && amountNum > settings.maxTransactionAmount) {
    return res.status(400).json({ message: 'Amount exceeds maximum limit' })
  }
  if (settings.minTransactionAmount && amountNum < settings.minTransactionAmount) {
    return res.status(400).json({ message: 'Amount below minimum limit' })
  }

  const transaction = {
    id: nanoid(),
    userId: sanitizedUserId,
    amount: String(amount),
    currency: sanitizedCurrency,
    provider: sanitizedProvider,
    payeeAccount: sanitizedPayeeAccount,
    swift: sanitizedSwift,
    payeeName: sanitizedPayeeName || 'Unknown',
    description: sanitizedDescription || 'Payment transaction',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  db.data.transactions.push(transaction)
  await db.write()

  res.status(201).json({ 
    message: 'Transaction created successfully', 
    transactionId: transaction.id,
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.createdAt
    }
  })
})

// Get transactions for customer - protected with session validation
router.get('/my/:userId', validateSession, async (req, res) => {
  const userId = req.params.userId
  
  // Validate user ID format
  if (!userIdPattern.test(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' })
  }
  
  await db.read()
  db.data ||= { users: [], transactions: [] }
  const tx = db.data.transactions.filter(t => t.userId === userId)
  res.json(tx)
})

// Staff: get all pending transactions (for staff portal)
router.get('/pending', async (req, res) => {
  await db.read()
  const pending = db.data.transactions.filter(t => t.status === 'pending')
  res.json(pending)
})

// Staff verify and submit to SWIFT (simulate submit)
router.post('/verify/:id', async (req, res) => {
  const txId = req.params.id
  
  // Validate transaction ID format
  if (!userIdPattern.test(txId)) {
    return res.status(400).json({ message: 'Invalid transaction ID format' })
  }
  
  // In production: check staff auth here
  await db.read()
  const tx = db.data.transactions.find(t => t.id === txId)
  if (!tx) return res.status(404).json({ message: 'Transaction not found' })

  tx.status = 'verified'
  tx.verifiedAt = new Date().toISOString()
  // Simulate submit to SWIFT by marking submitted
  tx.submittedToSWIFTAt = new Date().toISOString()
  tx.status = 'submitted'
  await db.write()
  res.json({ message: 'Transaction verified and submitted to SWIFT', transactionId: tx.id })
})

export default router

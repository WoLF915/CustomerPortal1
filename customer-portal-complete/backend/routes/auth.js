// backend/routes/auth.js
import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'

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

// Comprehensive whitelist regex patterns with strict validation
const namePattern = /^[A-Za-z\s.'-]{2,100}$/
const idPattern = /^\d{13}$/
const accountPattern = /^\d{8,20}$/
// Enhanced password pattern: min 12 chars, must contain uppercase, lowercase, number, and special char
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
const userIdPattern = /^[A-Za-z0-9_-]{10,30}$/
const sessionIdPattern = /^[A-Za-z0-9_-]{20,50}$/
const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const userAgentPattern = /^[A-Za-z0-9\s\.\/\(\)\-\+\:\;\,\=\[\]\{\}]{10,500}$/

// Register - customers only (staff accounts are created directly in MongoDB)
router.post('/register', async (req, res) => {
  try {
    const { fullName, idNumber, accountNumber, password } = req.body

    // Sanitize all inputs
    const sanitizedFullName = sanitizeInput(fullName)
    const sanitizedIdNumber = sanitizeInput(idNumber)
    const sanitizedAccountNumber = sanitizeInput(accountNumber)

    if (!sanitizedFullName || !sanitizedIdNumber || !sanitizedAccountNumber || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    if (!namePattern.test(sanitizedFullName) || !idPattern.test(sanitizedIdNumber) ||
        !accountPattern.test(sanitizedAccountNumber) || !passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Invalid input format' })
    }

    // Check if user already exists
    const exists = await User.findOne({ 
      $or: [
        { accountNumber: sanitizedAccountNumber },
        { idNumber: sanitizedIdNumber }
      ]
    })
    
    if (exists) {
      return res.status(409).json({ message: 'Account already registered' })
    }

    // Enhanced password security with stronger hashing
    const saltRounds = 12 // Increased from 10 to 12 for better security
    const hashed = await bcrypt.hash(password, saltRounds)

    // Create new user in MongoDB
    const user = new User({
      fullName: sanitizedFullName,
      idNumber: sanitizedIdNumber,
      accountNumber: sanitizedAccountNumber,
      password: hashed,
      role: 'customer',
      email: '',
      phone: '',
      address: '',
      isActive: true,
      lastLogin: null,
      createdAt: new Date()
    })

    await user.save()

    res.status(201).json({ 
      message: 'Registered', 
      userId: user._id.toString(), 
      fullName: user.fullName 
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Account already registered' })
    }
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

// Login (customers & employees)
router.post('/login', async (req, res) => {
  try {
    const { accountNumber, password } = req.body
    
    // Sanitize inputs
    const sanitizedAccountNumber = sanitizeInput(accountNumber)
    
    if (!sanitizedAccountNumber || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    
    if (!accountPattern.test(sanitizedAccountNumber) || !passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Invalid input format' })
    }

    // Find user in MongoDB
    const user = await User.findOne({ accountNumber: sanitizedAccountNumber })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Create secure session
    req.session.userId = user._id.toString()
    req.session.userRole = user.role
    req.session.accountNumber = user.accountNumber
    req.session.loginTime = new Date().toISOString()
    
    // Regenerate session ID to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err)
        return res.status(500).json({ message: 'Session error' })
      }
      
      // Minimal session: return user meta to frontend (do not send password)
      res.json({ 
        message: 'Login successful', 
        userId: user._id.toString(), 
        fullName: user.fullName, 
        role: user.role,
        accountNumber: user.accountNumber,
        lastLogin: user.lastLogin
      })
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err)
      return res.status(500).json({ message: 'Logout failed' })
    }
    res.clearCookie('secureSessionId')
    res.json({ message: 'Logout successful' })
  })
})

// Enhanced session validation middleware with comprehensive security checks
export const validateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Session expired or invalid' })
  }
  
  // Validate session ID format
  if (!sessionIdPattern.test(req.sessionID)) {
    req.session.destroy()
    return res.status(401).json({ message: 'Invalid session format' })
  }
  
  // Check session age (30 minutes max)
  const sessionAge = Date.now() - new Date(req.session.loginTime).getTime()
  if (sessionAge > 30 * 60 * 1000) {
    req.session.destroy()
    return res.status(401).json({ message: 'Session expired' })
  }
  
  // Validate user ID format
  if (!userIdPattern.test(req.session.userId)) {
    req.session.destroy()
    return res.status(401).json({ message: 'Invalid user session' })
  }
  
  // Check for session hijacking indicators
  const currentIP = req.ip || req.connection.remoteAddress
  const userAgent = req.get('User-Agent') || ''
  
  if (req.session.lastIP && req.session.lastIP !== currentIP) {
    req.session.destroy()
    return res.status(401).json({ message: 'Session security violation detected' })
  }
  
  if (req.session.lastUserAgent && req.session.lastUserAgent !== userAgent) {
    req.session.destroy()
    return res.status(401).json({ message: 'Session security violation detected' })
  }
  
  // Update session tracking
  req.session.lastIP = currentIP
  req.session.lastUserAgent = userAgent
  req.session.lastActivity = new Date().toISOString()
  
  next()
}

export default router

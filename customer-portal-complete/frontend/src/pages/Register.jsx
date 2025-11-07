import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function Register(){
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setIsLoading(true)
    setMsg('')

    // Enhanced client-side validation with comprehensive RegEx patterns
    const namePattern = /^[A-Za-z\s.'-]{2,100}$/
    const idPattern = /^\d{13}$/
    const accountPattern = /^\d{8,20}$/
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/
    
    if (!namePattern.test(fullName)) {
      setMsg('Please enter a valid full name (2-100 characters, letters, spaces, periods, apostrophes, and hyphens only)')
      setIsLoading(false)
      return
    }

    if (!idPattern.test(idNumber)) {
      setMsg('Please enter a valid 13-digit ID number')
      setIsLoading(false)
      return
    }

    if (!accountPattern.test(accountNumber)) {
      setMsg('Please enter a valid account number (8-20 digits)')
      setIsLoading(false)
      return
    }

    if (!passwordPattern.test(password)) {
      setMsg('Password must be at least 12 characters with uppercase, lowercase, number, and special character')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMsg('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const r = await api.post('/auth/register', { fullName, idNumber, accountNumber, password })
      if (r && r.userId) {
        setMsg('Registration successful! You can now login.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMsg(r.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setMsg(error.message || 'Registration failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card">
        <h2>Create New Account</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '30px' }}>
          Join our secure customer portal
        </p>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input 
              id="fullName"
              type="text"
              placeholder="Enter your full name" 
              value={fullName} 
              onChange={e=>setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="idNumber">ID Number</label>
            <input 
              id="idNumber"
              type="text"
              placeholder="Enter your 13-digit ID number" 
              value={idNumber} 
              onChange={e=>setIdNumber(e.target.value)}
              maxLength="13"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input 
              id="accountNumber"
              type="text"
              placeholder="Enter your account number" 
              value={accountNumber} 
              onChange={e=>setAccountNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              placeholder="Create a secure password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        {msg && (
          <div className={`message ${msg.includes('successful') ? 'success' : 'error'}`}>
            {msg}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#718096' }}>Already have an account?</p>
          <Link to="/login" className="btn btn-outline">
            Login Here
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" className="nav-btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

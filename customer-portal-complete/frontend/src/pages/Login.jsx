import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function Login(){
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setIsLoading(true)
    setMsg('')

    // Enhanced client-side validation with RegEx patterns
    const accountNumberPattern = /^\d{8,20}$/
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/
    
    if (!accountNumberPattern.test(accountNumber)) {
      setMsg('Please enter a valid account number (8-20 digits)')
      setIsLoading(false)
      return
    }

    if (!passwordPattern.test(password)) {
      setMsg('Password must be at least 12 characters with uppercase, lowercase, number, and special character')
      setIsLoading(false)
      return
    }

    try {
      const r = await api.post('/auth/login', { accountNumber, password })
      if (r && r.userId) {
        setUser(r)
        setMsg('Login successful!')
        // Store user data in localStorage for session management
        localStorage.setItem('user', JSON.stringify(r))
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setMsg(r.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setMsg(error.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card">
        <h2>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '30px' }}>
          Sign in to your account to continue
        </p>
        
        <form onSubmit={submit}>
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
              placeholder="Enter your password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {msg && (
          <div className={`message ${msg.includes('successful') ? 'success' : 'error'}`}>
            {msg}
          </div>
        )}
        
        {user && (
          <div className="message success">
            <strong>Welcome back, {user.fullName}!</strong><br/>
            Role: {user.role}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#718096' }}>Don't have an account?</p>
          <Link to="/register" className="btn btn-outline">
            Create Account
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

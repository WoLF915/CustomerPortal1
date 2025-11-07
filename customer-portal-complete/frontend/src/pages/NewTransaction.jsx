import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function NewTransaction() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    payeeAccount: '',
    swift: '',
    payeeName: '',
    description: ''
  })
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMsg('')

    // Enhanced client-side validation with comprehensive RegEx patterns
    const amountPattern = /^\d{1,12}(?:\.\d{1,2})?$/
    const currencyPattern = /^[A-Z]{3}$/
    const providerPattern = /^[A-Za-z0-9\s.-]{2,50}$/
    const swiftPattern = /^[A-Z0-9]{8,11}$/
    const payeeAccountPattern = /^\d{6,22}$/
    const payeeNamePattern = /^[A-Za-z\s.'-]{2,100}$/
    const descriptionPattern = /^[A-Za-z0-9\s.,!?@#$%&*()-]{0,200}$/
    
    if (!amountPattern.test(formData.amount) || parseFloat(formData.amount) <= 0) {
      setMsg('Please enter a valid amount (1-12 digits with up to 2 decimal places)')
      setIsLoading(false)
      return
    }

    if (!currencyPattern.test(formData.currency)) {
      setMsg('Please select a valid currency')
      setIsLoading(false)
      return
    }

    if (!providerPattern.test(formData.provider)) {
      setMsg('Please select a valid payment provider')
      setIsLoading(false)
      return
    }

    if (!swiftPattern.test(formData.swift)) {
      setMsg('Please enter a valid SWIFT/BIC code (8-11 alphanumeric characters)')
      setIsLoading(false)
      return
    }

    if (!payeeAccountPattern.test(formData.payeeAccount)) {
      setMsg('Please enter a valid payee account number (6-22 digits)')
      setIsLoading(false)
      return
    }

    if (formData.payeeName && !payeeNamePattern.test(formData.payeeName)) {
      setMsg('Please enter a valid payee name (2-100 characters, letters, spaces, periods, apostrophes, and hyphens only)')
      setIsLoading(false)
      return
    }

    if (formData.description && !descriptionPattern.test(formData.description)) {
      setMsg('Please enter a valid description (up to 200 characters, alphanumeric and common punctuation only)')
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post('/payments/create', {
        userId: user.userId,
        ...formData
      })
      
      if (response && response.transactionId) {
        setMsg('Transaction created successfully!')
        // Reset form
        setFormData({
          amount: '',
          currency: 'USD',
          provider: 'SWIFT',
          payeeAccount: '',
          swift: '',
          payeeName: '',
          description: ''
        })
        // Redirect to payment management after 2 seconds
        setTimeout(() => {
          navigate('/payments')
        }, 2000)
      } else {
        setMsg(response.message || 'Failed to create transaction')
      }
    } catch (error) {
      setMsg(error.message || 'Failed to create transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Create New Transaction</h1>
          <button onClick={handleLogout} className="btn btn-outline btn-small">
            Logout
          </button>
        </div>

        <div className="navigation">
          <Link to="/dashboard" className="nav-btn">
            Dashboard
          </Link>
          <Link to="/payments" className="nav-btn">
            Payment Management
          </Link>
          <Link to="/payment-history" className="nav-btn">
            Payment History
          </Link>
        </div>

        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '30px' }}>
          Create a new payment transaction
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input 
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount" 
              value={formData.amount} 
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select 
              id="currency"
              name="currency"
              value={formData.currency} 
              onChange={handleInputChange}
              required
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="provider">Payment Provider</label>
            <select 
              id="provider"
              name="provider"
              value={formData.provider} 
              onChange={handleInputChange}
              required
            >
              <option value="SWIFT">SWIFT</option>
              <option value="SEPA">SEPA</option>
              <option value="ACH">ACH</option>
              <option value="FEDWIRE">FEDWIRE</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="payeeAccount">Payee Account Number</label>
            <input 
              id="payeeAccount"
              name="payeeAccount"
              type="text"
              placeholder="Enter payee account number" 
              value={formData.payeeAccount} 
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="swift">SWIFT/BIC Code</label>
            <input 
              id="swift"
              name="swift"
              type="text"
              placeholder="Enter SWIFT/BIC code" 
              value={formData.swift} 
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payeeName">Payee Name (Optional)</label>
            <input 
              id="payeeName"
              name="payeeName"
              type="text"
              placeholder="Enter payee name or company" 
              value={formData.payeeName} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <input 
              id="description"
              name="description"
              type="text"
              placeholder="Enter transaction description" 
              value={formData.description} 
              onChange={handleInputChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Transaction...' : 'Create Transaction'}
          </button>
        </form>
        
        {msg && (
          <div className={`message ${msg.includes('successfully') ? 'success' : 'error'}`}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px' }}>
          <h4 style={{ color: '#667eea', marginBottom: '15px' }}>Transaction Information</h4>
          <div style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>Processing Time:</strong> 1-3 business days</p>
            <p><strong>Fees:</strong> May apply depending on currency and amount</p>
            <p><strong>Status Updates:</strong> You'll receive notifications as your transaction progresses</p>
            <p><strong>Support:</strong> Contact customer service for any questions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function PaymentManagement() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
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
    
    // Load user's transactions
    loadTransactions(parsedUser.userId)
  }, [navigate])

  const loadTransactions = async (userId) => {
    try {
      const response = await api.get(`/payments/my/${userId}`)
      setTransactions(response || [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending')
  const completedTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'submitted' || t.status === 'verified')

  const renderTransaction = (transaction) => (
    <div key={transaction.id} className={`transaction-item ${transaction.status}`}>
      <div className="transaction-header">
        <div className="transaction-amount">
          {transaction.currency} {transaction.amount}
        </div>
        <div className={`transaction-status status-${transaction.status}`}>
          {transaction.status}
        </div>
      </div>
      <div className="transaction-details">
        {transaction.payeeName && <div><strong>Payee:</strong> {transaction.payeeName}</div>}
        <div><strong>Provider:</strong> {transaction.provider}</div>
        <div><strong>Payee Account:</strong> {transaction.payeeAccount}</div>
        <div><strong>SWIFT Code:</strong> {transaction.swift}</div>
        {transaction.description && <div><strong>Description:</strong> {transaction.description}</div>}
        <div><strong>Created:</strong> {new Date(transaction.createdAt).toLocaleString()}</div>
        {transaction.verifiedAt && (
          <div><strong>Verified:</strong> {new Date(transaction.verifiedAt).toLocaleString()}</div>
        )}
        {transaction.submittedToSWIFTAt && (
          <div><strong>Submitted to SWIFT:</strong> {new Date(transaction.submittedToSWIFTAt).toLocaleString()}</div>
        )}
        {transaction.failureReason && (
          <div><strong>Failure Reason:</strong> {transaction.failureReason}</div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="loading">Loading payment management...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="card card-large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Payment Management</h1>
          <button onClick={handleLogout} className="btn btn-outline btn-small">
            Logout
          </button>
        </div>

        <div className="navigation">
          <Link to="/dashboard" className="nav-btn">
            Dashboard
          </Link>
          <Link to="/payment-history" className="nav-btn">
            Payment History
          </Link>
          <Link to="/new-transaction" className="nav-btn">
            Create New Transaction
          </Link>
        </div>

        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Transactions ({pendingTransactions.length})
          </div>
          <div 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Transactions ({completedTransactions.length})
          </div>
        </div>

        {activeTab === 'pending' && (
          <div>
            <h3>Pending Transactions</h3>
            {pendingTransactions.length > 0 ? (
              <div className="transaction-list">
                {pendingTransactions.map(renderTransaction)}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No pending transactions</h3>
                <p>All your transactions have been processed</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h3>Completed Transactions</h3>
            {completedTransactions.length > 0 ? (
              <div className="transaction-list">
                {completedTransactions.map(renderTransaction)}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No completed transactions</h3>
                <p>Your completed transactions will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

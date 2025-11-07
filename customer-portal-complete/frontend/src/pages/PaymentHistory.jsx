import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function PaymentHistory() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
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

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    if (filter === 'completed') {
      return transaction.status === 'completed' || transaction.status === 'submitted' || transaction.status === 'verified'
    }
    return transaction.status === filter
  })

  const sortedTransactions = filteredTransactions.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f6ad55'
      case 'completed': return '#68d391'
      case 'submitted': return '#68d391'
      case 'verified': return '#68d391'
      case 'failed': return '#fc8181'
      default: return '#a0aec0'
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="loading">Loading payment history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="card card-large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Payment History</h1>
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
          <Link to="/new-transaction" className="nav-btn">
            Create New Transaction
          </Link>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Filter Transactions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            <button 
              className={`btn btn-small ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All ({transactions.length})
            </button>
            <button 
              className={`btn btn-small ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({transactions.filter(t => t.status === 'pending').length})
            </button>
            <button 
              className={`btn btn-small ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({transactions.filter(t => t.status === 'completed' || t.status === 'submitted' || t.status === 'verified').length})
            </button>
            <button 
              className={`btn btn-small ${filter === 'failed' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('failed')}
            >
              Failed ({transactions.filter(t => t.status === 'failed').length})
            </button>
          </div>
        </div>

        {sortedTransactions.length > 0 ? (
          <div>
            <h3>Transaction History</h3>
            <div className="transaction-list">
              {sortedTransactions.map(transaction => (
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
                    <div><strong>Transaction ID:</strong> {transaction.id}</div>
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
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't made any transactions yet" 
                : `No ${filter} transactions found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

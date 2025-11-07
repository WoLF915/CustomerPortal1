import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/global.css'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
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

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="loading">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="card card-large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-outline btn-small">
            Logout
          </button>
        </div>
        
        <div className="message success">
          <strong>Welcome back, {user?.fullName}!</strong><br/>
          Account: {user?.role === 'customer' ? 'Customer' : 'Staff'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '30px 0' }}>
          <div style={{ padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>Total Transactions</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a5568' }}>{transactions.length}</p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(246, 173, 85, 0.1)', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ color: '#f6ad55', marginBottom: '10px' }}>Pending</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a5568' }}>{pendingTransactions.length}</p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(72, 187, 120, 0.1)', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ color: '#48bb78', marginBottom: '10px' }}>Completed</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a5568' }}>{completedTransactions.length}</p>
          </div>
        </div>

        <div className="navigation">
          <Link to="/payments" className="nav-btn">
            Payment Management
          </Link>
          <Link to="/payment-history" className="nav-btn">
            Payment History
          </Link>
          <Link to="/new-transaction" className="nav-btn">
            Create New Transaction
          </Link>
        </div>

        {transactions.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Recent Transactions</h3>
            <div className="transaction-list">
              {transactions.slice(0, 3).map(transaction => (
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
                    {transaction.payeeName && <div>Payee: {transaction.payeeName}</div>}
                    <div>Provider: {transaction.provider}</div>
                    <div>Payee Account: {transaction.payeeAccount}</div>
                    {transaction.description && <div>Description: {transaction.description}</div>}
                    <div>Date: {new Date(transaction.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {transactions.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/payment-history" className="btn btn-outline">
                  View All Transactions
                </Link>
              </div>
            )}
          </div>
        )}

        {transactions.length === 0 && (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Start by creating your first transaction</p>
            <Link to="/new-transaction" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Create Transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/global.css'

export default function Home() {
  return (
    <div className="page-container">
      <div className="card">
        <h1>Welcome to Customer Portal</h1>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '40px', fontSize: '1.1rem' }}>
          Your secure gateway to manage your financial transactions
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link to="/register" className="btn btn-primary">
            Create New Account
          </Link>
          
          <Link to="/login" className="btn btn-secondary">
            Login to Existing Account
          </Link>
        </div>
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>Secure Registration</h4>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Create your account with bank-level security</p>
            </div>
            <div style={{ padding: '20px', background: 'rgba(245, 87, 108, 0.1)', borderRadius: '15px' }}>
              <h4 style={{ color: '#f5576c', marginBottom: '10px' }}>Transaction Management</h4>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Track and manage your payments</p>
            </div>
            <div style={{ padding: '20px', background: 'rgba(72, 187, 120, 0.1)', borderRadius: '15px' }}>
              <h4 style={{ color: '#48bb78', marginBottom: '10px' }}>Real-time Updates</h4>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Get instant notifications on your transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

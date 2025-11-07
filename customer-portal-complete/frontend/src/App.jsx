import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PaymentManagement from './pages/PaymentManagement'
import PaymentHistory from './pages/PaymentHistory'
import NewTransaction from './pages/NewTransaction'
import './styles/global.css'

export default function App(){
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/new-transaction" element={<NewTransaction />} />
        </Routes>
      </div>
    </Router>
  )
}

import React, { useState } from 'react'
import api from '../api'

export default function Payments(){
  const [userId, setUserId] = useState('cust_1')
  const [amount, setAmount] = useState('100.00')
  const [currency, setCurrency] = useState('USD')
  const [provider, setProvider] = useState('SWIFT')
  const [payeeAccount, setPayeeAccount] = useState('400500600700')
  const [swift, setSwift] = useState('ABCDEF12')
  const [msg, setMsg] = useState('')

  async function create(e){
    e.preventDefault()
    const r = await api.post('/payments/create', { userId, amount, currency, provider, payeeAccount, swift })
    setMsg(JSON.stringify(r))
  }

  async function getMy(e){
    e.preventDefault()
    const r = await api.get(`/payments/my/${userId}`)
    setMsg(JSON.stringify(r,null,2))
  }

  return (
    <div>
      <h3>Payments (Demo)</h3>
      <form onSubmit={create}>
        <div><input value={userId} onChange={e=>setUserId(e.target.value)}/></div>
        <div><input value={amount} onChange={e=>setAmount(e.target.value)}/></div>
        <div><input value={currency} onChange={e=>setCurrency(e.target.value)}/></div>
        <div><input value={provider} onChange={e=>setProvider(e.target.value)}/></div>
        <div><input value={payeeAccount} onChange={e=>setPayeeAccount(e.target.value)}/></div>
        <div><input value={swift} onChange={e=>setSwift(e.target.value)}/></div>
        <button type="submit">Create Payment</button>
      </form>
      <button onClick={getMy} style={{marginTop:8}}>Get My Transactions</button>
      <pre style={{whiteSpace:'pre-wrap'}}>{msg}</pre>
    </div>
  )
}

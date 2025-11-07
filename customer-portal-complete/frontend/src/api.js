// simple wrapper for fetch to backend API
const BASE = 'http://localhost:5000/api'

async function post(path, body){
  try {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('API POST Error:', error)
    throw error
  }
}

async function get(path){
  try {
    const res = await fetch(BASE + path, { 
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('API GET Error:', error)
    throw error
  }
}

export default { post, get }

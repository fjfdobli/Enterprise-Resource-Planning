import { useEffect, useState } from 'react'
import { clientAPI } from './api'

export default function TestConnection() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await clientAPI.getAll()
        setMessage('Connected to backend successfully!')
        console.log('API Response:', response.data) 
      } catch (err) {
        setError('Failed to connect to backend') 
        console.error('Error:', err) 
      }
    }

    testConnection()
  }, [])

  return (
    <div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
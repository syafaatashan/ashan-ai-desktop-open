import { useState, useEffect } from 'react'
import './App.css'

interface Business {
  connectionId: string
  label: string
  connected: boolean
  provider: string
}

export default function App() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    setLoading(true)
    try {
      // @ts-ignore - window.ashanHub injected by preload
      const result = await window.ashanHub?.getBusinesses()
      setBusinesses(result || [])
    } catch (err) {
      console.error('Failed to load businesses:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Ashan.ai Desktop</h1>
        <p>Open Source Reconstruction</p>
      </header>
      
      <main>
        <section className="businesses">
          <h2>WhatsApp Businesses</h2>
          {loading ? (
            <p>Loading...</p>
          ) : businesses.length === 0 ? (
            <p>No businesses connected</p>
          ) : (
            <ul>
              {businesses.map((b) => (
                <li key={b.connectionId}>
                  <strong>{b.label}</strong>
                  <span className={b.connected ? 'connected' : 'disconnected'}>
                    {b.connected ? '✓ Connected' : '✗ Disconnected'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="info">
          <h3>Architecture</h3>
          <p>
            This is a reverse-engineered reconstruction of the Ashan.ai desktop application.
            See README.md for architecture details and implementation status.
          </p>
        </section>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) setError('帳號或密碼錯誤')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 20, padding: 40,
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-purple-dim))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'var(--accent-cyan)',
          }}>AI</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>SME Ops</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>請登入您的帳號</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              className="form-input"
              type="email"
              style={{ width: '100%' }}
              placeholder="your@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>密碼</label>
            <input
              className="form-input"
              type="password"
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)',
              borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--accent-red)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: 14, marginTop: 4 }}
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}

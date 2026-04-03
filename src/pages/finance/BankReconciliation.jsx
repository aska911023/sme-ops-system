import { useState, useEffect } from 'react'
import { Search, Landmark } from 'lucide-react'
import { getBankTransactions } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function BankReconciliation() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getBankTransactions().then(({ data }) => { setTransactions(data || []); setLoading(false) })
  }, [])

  if (loading) return <LoadingSpinner />

  const filtered = transactions.filter(t =>
    search === '' || t.description?.includes(search)
  )

  const totalCount = filtered.length
  const matchedCount = filtered.filter(t => t.matched).length
  const unmatchedCount = totalCount - matchedCount
  const diffAmount = filtered.filter(t => !t.matched).reduce((sum, t) => sum + ((t.debit || 0) - (t.credit || 0)), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🏦</span> 銀行對帳</h2>
            <p>銀行交易記錄與帳務比對</p>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">總筆數</div>
          <div className="stat-card-value">{totalCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已對帳</div>
          <div className="stat-card-value">{matchedCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">未對帳</div>
          <div className="stat-card-value">{unmatchedCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">差異金額</div>
          <div className="stat-card-value">NT$ {Math.abs(diffAmount).toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon"><Landmark size={16} /></span> 交易記錄</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋交易..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>交易日期</th><th>說明</th><th>借方</th><th>貸方</th><th>餘額</th><th>對帳狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無交易記錄</td></tr>}
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.transaction_date}</td>
                  <td style={{ fontWeight: 600 }}>{t.description}</td>
                  <td style={{ color: t.debit ? 'var(--accent-red)' : undefined }}>{t.debit ? `NT$ ${t.debit.toLocaleString()}` : '-'}</td>
                  <td style={{ color: t.credit ? 'var(--accent-green)' : undefined }}>{t.credit ? `NT$ ${t.credit.toLocaleString()}` : '-'}</td>
                  <td>NT$ {(t.balance || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${t.matched ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{t.matched ? '已對帳' : '未對帳'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

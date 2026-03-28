import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function CRMOverview() {
  const [customers, setCustomers] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [tickets, setTickets] = useState([])
  const [contacts, setContacts] = useState([])
  const [locations, setLocations] = useState([])
  const [locFilter, setLocFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('opportunities').select('*'),
      supabase.from('service_tickets').select('*'),
      supabase.from('customer_contacts').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('locations').select('*'),
    ]).then(([c, o, t, ct, l]) => {
      setCustomers(c.data || [])
      setOpportunities(o.data || [])
      setTickets(t.data || [])
      setContacts(ct.data || [])
      setLocations(l.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const fCustomers = customers.filter(c => locFilter === '' || String(c.location_id) === locFilter)
  const fOpps = opportunities.filter(o => locFilter === '' || String(o.location_id) === locFilter)
  const fTickets = tickets.filter(t => locFilter === '' || String(t.location_id) === locFilter)

  const totalOppValue = fOpps.filter(o => !['贏單', '輸單'].includes(o.stage)).reduce((s, o) => s + (o.amount || 0), 0)
  const forecastValue = fOpps.filter(o => !['贏單', '輸單'].includes(o.stage)).reduce((s, o) => s + (o.amount || 0) * ((o.probability || 0) / 100), 0)
  const openTickets = fTickets.filter(t => t.status !== '已解決').length

  const STAGES = ['初步接觸', '需求分析', '報價', '議價', '贏單', '輸單']
  const stageColors = { '初步接觸': 'var(--accent-blue)', '需求分析': 'var(--accent-cyan)', '報價': 'var(--accent-purple)', '議價': 'var(--accent-orange)', '贏單': 'var(--accent-green)', '輸單': 'var(--accent-red)' }
  const contactTypeIcon = { call: '📞', email: '📧', line: '💬', meeting: '🤝' }

  const filterBtnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">🤝</span> CRM 客戶關係管理</h2>
        <p>客戶 360 度視圖、銷售漏斗與行銷自動化</p>
      </div>

      {/* 分店篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(locFilter === '')} onClick={() => setLocFilter('')}>全部分店</button>
        {locations.map(l => (
          <button key={l.id} style={filterBtnStyle(locFilter === String(l.id))} onClick={() => setLocFilter(String(l.id))}>{l.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">客戶總數</div>
          <div className="stat-card-value">{fCustomers.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">進行中商機金額</div>
          <div className="stat-card-value">$ {totalOppValue.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">預計成交金額</div>
          <div className="stat-card-value">$ {Math.round(forecastValue).toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待處理客服工單</div>
          <div className="stat-card-value">{openTickets}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📊</span> 銷售漏斗</div>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            {STAGES.map(stage => {
              const count = fOpps.filter(o => o.stage === stage).length
              const value = fOpps.filter(o => o.stage === stage).reduce((s, o) => s + (o.amount || 0), 0)
              const maxCount = Math.max(...STAGES.map(s => fOpps.filter(o => o.stage === s).length), 1)
              return (
                <div key={stage} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{stage}</span>
                    <span style={{ color: stageColors[stage], fontWeight: 700 }}>{count} 筆 · ${value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--glass-light)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: stageColors[stage], borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📝</span> 最新互動紀錄</div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            {contacts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>尚無互動紀錄</div>
            ) : contacts.slice(0, 6).map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 18 }}>{contactTypeIcon[c.type] || '📋'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.content?.slice(0, 40)}{c.content?.length > 40 ? '...' : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.operator} · {new Date(c.created_at).toLocaleString('zh-TW')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🎫</span> 客服工單概況</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>工單編號</th><th>客戶</th><th>主旨</th><th>類型</th><th>優先度</th><th>負責人</th><th>狀態</th></tr></thead>
            <tbody>
              {fTickets.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無工單</td></tr>}
              {fTickets.slice(0, 8).map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{String(t.id).padStart(4, '0')}</td>
                  <td>{t.customer_name}</td>
                  <td>{t.subject}</td>
                  <td style={{ fontSize: 12 }}>{t.type}</td>
                  <td><span className={`badge ${t.priority === '緊急' ? 'badge-danger' : t.priority === '高' ? 'badge-warning' : 'badge-neutral'}`}><span className="badge-dot"></span>{t.priority}</span></td>
                  <td>{t.assignee}</td>
                  <td><span className={`badge ${t.status === '已解決' ? 'badge-success' : t.status === '處理中' ? 'badge-info' : 'badge-warning'}`}><span className="badge-dot"></span>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

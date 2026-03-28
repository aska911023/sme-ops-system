import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function WMSOverview() {
  const [stats, setStats] = useState({ warehouses: 0, skus: 0, inbound: 0, outbound: 0, lowStock: 0 })
  const [recentInbound, setRecentInbound] = useState([])
  const [recentOutbound, setRecentOutbound] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('warehouses').select('id', { count: 'exact' }),
      supabase.from('skus').select('id', { count: 'exact' }),
      supabase.from('inbound_orders').select('id', { count: 'exact' }).eq('status', '待到貨'),
      supabase.from('outbound_orders').select('id', { count: 'exact' }).eq('status', '待揀貨'),
      supabase.from('inbound_orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('outbound_orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([w, s, ib, ob, riб, rob]) => {
      setStats({ warehouses: w.count || 0, skus: s.count || 0, inbound: ib.count || 0, outbound: ob.count || 0 })
      setRecentInbound(riб.data || [])
      setRecentOutbound(rob.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">🏭</span> WMS 倉庫管理</h2>
        <p>倉庫進出貨與庫存總覽</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">倉庫數</div>
          <div className="stat-card-value">{stats.warehouses}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">商品品項</div>
          <div className="stat-card-value">{stats.skus}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待到貨進貨單</div>
          <div className="stat-card-value">{stats.inbound}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">待揀貨出貨單</div>
          <div className="stat-card-value">{stats.outbound}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📦</span> 最新進貨單</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>採購單號</th><th>供應商</th><th>預計到貨</th><th>狀態</th></tr></thead>
              <tbody>
                {recentInbound.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無資料</td></tr>}
                {recentInbound.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.po_number}</td>
                    <td>{o.supplier}</td>
                    <td style={{ fontSize: 12 }}>{o.expected_date}</td>
                    <td><span className={`badge ${o.status === '已完成' ? 'badge-success' : o.status === '收貨中' ? 'badge-info' : 'badge-warning'}`}><span className="badge-dot"></span>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🚚</span> 最新出貨單</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>訂單號</th><th>客戶</th><th>物流商</th><th>狀態</th></tr></thead>
              <tbody>
                {recentOutbound.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無資料</td></tr>}
                {recentOutbound.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                    <td>{o.customer}</td>
                    <td>{o.carrier}</td>
                    <td><span className={`badge ${o.status === '已出貨' ? 'badge-success' : o.status === '揀貨中' ? 'badge-info' : 'badge-warning'}`}><span className="badge-dot"></span>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

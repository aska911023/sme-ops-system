import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const TICKET_TYPES = ['商品瑕疵', '出貨錯誤', '退換貨', '付款問題', '諮詢', '其他']
const PRIORITIES = ['緊急', '高', '一般', '低']
const STATUSES = ['待處理', '處理中', '待客戶回覆', '已解決', '已關閉']

const KB_ITEMS = [
  { q: '如何申請退換貨？', a: '購買後 7 天內，商品未開封可申請退換貨，請聯繫業務或填寫退貨單。' },
  { q: '出貨後多久可以收到？', a: '一般地區 2-3 個工作天，偏遠地區 5-7 個工作天。' },
  { q: '發票如何開立？', a: '預設開立電子發票，如需統編請下單時備註或聯繫業務。' },
  { q: '如何查詢訂單進度？', a: '請提供訂單編號，業務可在系統即時查詢 WMS 出貨狀態。' },
  { q: '商品保固期多久？', a: '各商品保固期不同，詳見商品說明頁，一般為 1 年。' },
]

export default function Service() {
  const [tickets, setTickets] = useState([])
  const [customers, setCustomers] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tickets')
  const [locFilter, setLocFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer_name: '', subject: '', type: '商品瑕疵', priority: '一般', assignee: '', description: '', status: '待處理', location_id: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('service_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name'),
      supabase.from('locations').select('*'),
    ]).then(([t, c, l]) => {
      setTickets(t.data || [])
      setCustomers(c.data || [])
      setLocations(l.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.customer_name || !form.subject) return
    const { data } = await supabase.from('service_tickets').insert({ ...form, location_id: form.location_id || null }).select().single()
    if (data) { setTickets(prev => [data, ...prev]); setShowModal(false); setForm({ customer_name: '', subject: '', type: '商品瑕疵', priority: '一般', assignee: '', description: '', status: '待處理', location_id: '' }) }
  }

  const updateStatus = async (id, status) => {
    const updates = { status }
    if (status === '已解決') updates.resolved_at = new Date().toISOString()
    const { data } = await supabase.from('service_tickets').update(updates).eq('id', id).select().single()
    if (data) setTickets(prev => prev.map(t => t.id === id ? data : t))
  }

  if (loading) return <LoadingSpinner />

  const filtered = tickets.filter(t =>
    (locFilter === '' || String(t.location_id) === locFilter) &&
    (statusFilter === '' || t.status === statusFilter)
  )
  const openCount = tickets.filter(t => !['已解決', '已關閉'].includes(t.status)).length
  const urgentCount = tickets.filter(t => t.priority === '緊急' && !['已解決', '已關閉'].includes(t.status)).length
  const avgResolveDays = (() => {
    const resolved = tickets.filter(t => t.resolved_at && t.created_at)
    if (!resolved.length) return '-'
    const avg = resolved.reduce((s, t) => s + (new Date(t.resolved_at) - new Date(t.created_at)) / (1000 * 60 * 60 * 24), 0) / resolved.length
    return avg.toFixed(1)
  })()

  const filterBtnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><h2><span className="header-icon">🎫</span> 客服工單</h2><p>客訴追蹤、處理進度與知識庫</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增工單</button>
        </div>
      </div>

      {/* 分店篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(locFilter === '')} onClick={() => setLocFilter('')}>全部分店</button>
        {locations.map(l => (
          <button key={l.id} style={filterBtnStyle(locFilter === String(l.id))} onClick={() => setLocFilter(String(l.id))}>{l.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待處理工單</div><div className="stat-card-value">{openCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">緊急工單</div><div className="stat-card-value">{urgentCount}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已解決</div><div className="stat-card-value">{tickets.filter(t => t.status === '已解決').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">平均解決天數</div><div className="stat-card-value">{avgResolveDays}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-card)', borderRadius: 10, padding: 4, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        {[['tickets', '🎫 工單列表'], ['kb', '📚 常見問答']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === k ? 'var(--accent-cyan)' : 'transparent', color: tab === k ? '#fff' : 'var(--text-muted)' }}>{l}</button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🎫</span> 工單列表</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['', ...STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border-medium)', background: statusFilter === s ? 'var(--accent-cyan)' : 'var(--bg-card)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
                  {s || '全部'}
                </button>
              ))}
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>#</th><th>客戶</th><th>分店</th><th>主旨</th><th>類型</th><th>優先度</th><th>負責人</th><th>狀態</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無工單</td></tr>}
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>#{String(t.id).padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{t.customer_name}</td>
                    <td style={{ fontSize: 12 }}>{locations.find(l => l.id === t.location_id)?.name || '-'}</td>
                    <td>{t.subject}</td>
                    <td style={{ fontSize: 12 }}>{t.type}</td>
                    <td><span className={`badge ${t.priority === '緊急' ? 'badge-danger' : t.priority === '高' ? 'badge-warning' : 'badge-neutral'}`}><span className="badge-dot"></span>{t.priority}</span></td>
                    <td>{t.assignee || '-'}</td>
                    <td>
                      <select className="form-input" style={{ fontSize: 12, padding: '2px 6px' }} value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'kb' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📚</span> 常見問答集</div>
            <span className="badge badge-info"><span className="badge-dot"></span>標準回覆文件</span>
          </div>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {KB_ITEMS.map((item, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--glass-light)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Q：{item.q}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>A：{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="新增客服工單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="客戶名稱 *">
              <input className="form-input" type="text" style={{ width: '100%' }} list="cust-list" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
              <datalist id="cust-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
            </Field>
            <Field label="所屬分店">
              <select className="form-input" style={{ width: '100%' }} value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                <option value="">請選擇分店</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="主旨 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="問題簡述..." value={form.subject} onChange={e => set('subject', e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="類型">
              <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
                {TICKET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="優先度">
              <select className="form-input" style={{ width: '100%' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="負責客服"><input className="form-input" type="text" style={{ width: '100%' }} value={form.assignee} onChange={e => set('assignee', e.target.value)} /></Field>
          <Field label="問題描述"><textarea className="form-input" style={{ width: '100%', minHeight: 80 }} value={form.description} onChange={e => set('description', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  )
}

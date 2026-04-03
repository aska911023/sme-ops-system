import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getGoodsReceipts, createGoodsReceipt } from '../../lib/db'
import { supabase } from '../../lib/supabase'
import { createAPFromReceipt } from '../../lib/automation'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function GoodsReceipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ po_id: '', receiver: '', received_date: '', notes: '' })

  useEffect(() => {
    getGoodsReceipts().then(({ data }) => { setReceipts(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.po_id || !form.receiver) return
    const poId = parseInt(form.po_id) || 0
    const { data } = await createGoodsReceipt({ ...form, po_id: poId, status: '已驗收' })
    if (data) {
      setReceipts(prev => [...prev, data])
      setShowModal(false)
      setForm({ po_id: '', receiver: '', received_date: '', notes: '' })
      // 自動產生應付帳款
      const { data: po } = await supabase.from('purchase_orders').select('*').eq('id', poId).maybeSingle()
      if (po) createAPFromReceipt(data, po)
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = receipts.filter(r =>
    search === '' || String(r.po_id)?.includes(search) || r.receiver?.includes(search)
  )

  const pendingInspection = filtered.filter(r => r.status === '待驗收').length
  const inspected = filtered.filter(r => r.status === '已驗收').length

  const now = new Date()
  const monthCount = filtered.filter(r => {
    const d = new Date(r.received_date || r.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const statusBadge = (status) => {
    const cls = status === '已驗收' ? 'badge-success' : status === '異常' ? 'badge-danger' : 'badge-warning'
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{status}</span>
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📥</span> 進貨驗收</h2>
            <p>進貨驗收記錄與管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增驗收單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待驗收</div>
          <div className="stat-card-value">{pendingInspection}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已驗收</div>
          <div className="stat-card-value">{inspected}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">本月驗收數</div>
          <div className="stat-card-value">{monthCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 驗收單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋PO編號/驗收人..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>驗收單號</th><th>對應 PO</th><th>驗收人</th><th>驗收日期</th><th>備註</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無驗收記錄</td></tr>}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>GR-{String(r.id).padStart(3, '0')}</td>
                  <td><span className="badge badge-info"><span className="badge-dot"></span>PO-{String(r.po_id).padStart(3, '0')}</span></td>
                  <td>{r.receiver}</td>
                  <td>{r.received_date}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.notes || '-'}</td>
                  <td>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增驗收單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="對應 PO ID *">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="PO ID" value={form.po_id} onChange={e => set('po_id', e.target.value)} />
            </Field>
            <Field label="驗收人 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="驗收人姓名" value={form.receiver} onChange={e => set('receiver', e.target.value)} />
            </Field>
          </div>
          <Field label="驗收日期">
            <input className="form-input" type="date" style={{ width: '100%' }} value={form.received_date} onChange={e => set('received_date', e.target.value)} />
          </Field>
          <Field label="備註">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="驗收備註說明" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

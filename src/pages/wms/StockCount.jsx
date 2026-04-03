import { useState, useEffect } from 'react'
import { Plus, Search, ClipboardList } from 'lucide-react'
import { getStockCounts, createStockCount } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function StockCount() {
  const [counts, setCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ count_date: '', warehouse: '', counter: '', total_items: '', discrepancies: '0', status: '盤點中', notes: '' })

  useEffect(() => {
    getStockCounts().then(({ data }) => { setCounts(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.warehouse || !form.counter) return
    const { data } = await createStockCount({
      ...form,
      total_items: parseInt(form.total_items) || 0,
      discrepancies: parseInt(form.discrepancies) || 0,
    })
    if (data) {
      setCounts(prev => [...prev, data])
      setShowModal(false)
      setForm({ count_date: '', warehouse: '', counter: '', total_items: '', discrepancies: '0', status: '盤點中', notes: '' })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = counts.filter(c =>
    search === '' || c.warehouse?.includes(search) || c.counter?.includes(search)
  )

  const inProgress = filtered.filter(c => c.status === '盤點中').length
  const completed = filtered.filter(c => c.status === '已完成').length
  const totalDiscrepancies = filtered.reduce((sum, c) => sum + (c.discrepancies || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📋</span> 盤點作業</h2>
            <p>庫存盤點與差異管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增盤點</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">盤點中</div>
          <div className="stat-card-value">{inProgress}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已完成</div>
          <div className="stat-card-value">{completed}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">總差異數</div>
          <div className="stat-card-value">{totalDiscrepancies}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon"><ClipboardList size={16} /></span> 盤點記錄</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋盤點..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>盤點日期</th><th>倉庫</th><th>盤點人</th><th>總品項</th><th>差異數</th><th>狀態</th><th>備註</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無盤點記錄</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.count_date}</td>
                  <td style={{ fontWeight: 600 }}>{c.warehouse}</td>
                  <td>{c.counter}</td>
                  <td>{(c.total_items || 0).toLocaleString()}</td>
                  <td style={{ color: c.discrepancies > 0 ? 'var(--accent-red)' : undefined, fontWeight: c.discrepancies > 0 ? 600 : undefined }}>
                    {c.discrepancies || 0}
                  </td>
                  <td>
                    <span className={`badge ${c.status === '已完成' ? 'badge-success' : c.status === '盤點中' ? 'badge-warning' : 'badge-info'}`}>
                      <span className="badge-dot"></span>{c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增盤點" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="盤點日期">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.count_date} onChange={e => set('count_date', e.target.value)} />
            </Field>
            <Field label="倉庫 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="主倉庫" value={form.warehouse} onChange={e => set('warehouse', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="盤點人 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="王大明" value={form.counter} onChange={e => set('counter', e.target.value)} />
            </Field>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option>盤點中</option>
                <option>已完成</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="總品項">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total_items} onChange={e => set('total_items', e.target.value)} />
            </Field>
            <Field label="差異數">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.discrepancies} onChange={e => set('discrepancies', e.target.value)} />
            </Field>
          </div>
          <Field label="備註">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="備註說明" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

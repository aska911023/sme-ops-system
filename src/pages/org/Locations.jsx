import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getStores, createStore } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function Locations() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', address: '', phone: '', manager: '', status: '營運中' })

  useEffect(() => {
    getStores().then(({ data }) => { setStores(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name) return
    const { data } = await createStore({ ...form, employee_count: 0 })
    if (data) {
      setStores(prev => [...prev, data])
      setShowModal(false)
      setForm({ name: '', company: '', address: '', phone: '', manager: '', status: '營運中' })
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📍</span> 門市</h2>
            <p>門市地點管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增門市</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">營運中</div>
          <div className="stat-card-value">{stores.filter(s => s.status === '營運中').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">籌備中</div>
          <div className="stat-card-value">{stores.filter(s => s.status === '籌備中').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">總員工數</div>
          <div className="stat-card-value">{stores.reduce((s, store) => s + (store.employee_count || 0), 0)}</div>
        </div>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>門市名稱</th><th>所屬公司</th><th>地址</th><th>電話</th><th>負責人</th><th>員工數</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.company}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.address}</td>
                  <td>{s.phone}</td>
                  <td>{s.manager}</td>
                  <td>{s.employee_count ?? 0}</td>
                  <td>
                    <span className={`badge ${s.status === '營運中' ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增門市" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="門市名稱 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="台北忠孝店" value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="所屬公司">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="公司名稱" value={form.company} onChange={e => set('company', e.target.value)} />
            </Field>
          </div>
          <Field label="地址">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="台北市大安區忠孝東路四段 1 號" value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="電話">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="02-1234-5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="負責人">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="店長姓名" value={form.manager} onChange={e => set('manager', e.target.value)} />
            </Field>
          </div>
          <Field label="狀態">
            <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option>營運中</option>
              <option>籌備中</option>
              <option>已停業</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}

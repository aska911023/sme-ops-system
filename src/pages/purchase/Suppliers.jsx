import { useState, useEffect } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { getSuppliers, createSupplier } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const PAYMENT_TERMS = ['COD', 'NET15', 'NET30', 'NET45', 'NET60']

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', payment_terms: 'NET30', status: '合作中' })

  useEffect(() => {
    getSuppliers().then(({ data }) => { setSuppliers(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name) return
    const { data } = await createSupplier({ ...form, rating: 3 })
    if (data) {
      setSuppliers(prev => [...prev, data])
      setShowModal(false)
      setForm({ name: '', contact_person: '', phone: '', email: '', address: '', payment_terms: 'NET30', status: '合作中' })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = suppliers.filter(s =>
    search === '' || s.name?.includes(search) || s.contact_person?.includes(search)
  )

  const active = filtered.filter(s => s.status === '合作中').length
  const paused = filtered.filter(s => s.status === '暫停').length
  const avgRating = filtered.length > 0 ? (filtered.reduce((sum, s) => sum + (s.rating || 0), 0) / filtered.length).toFixed(1) : '0.0'

  const renderStars = (rating) => {
    const r = Math.round(rating || 0)
    return (
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} fill={i <= r ? 'var(--accent-orange)' : 'none'} stroke={i <= r ? 'var(--accent-orange)' : 'var(--text-muted)'} />
        ))}
      </span>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📦</span> 供應商管理</h2>
            <p>供應商資料與評等管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增供應商</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">合作中</div>
          <div className="stat-card-value">{active}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">暫停</div>
          <div className="stat-card-value">{paused}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">平均評等</div>
          <div className="stat-card-value">{avgRating}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 供應商列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋供應商..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>供應商名稱</th><th>聯絡人</th><th>電話</th><th>Email</th><th>付款條件</th><th>評等</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無供應商</td></tr>}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.contact_person}</td>
                  <td>{s.phone}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td><span className="badge badge-info"><span className="badge-dot"></span>{s.payment_terms}</span></td>
                  <td>{renderStars(s.rating)}</td>
                  <td>
                    <span className={`badge ${s.status === '合作中' ? 'badge-success' : s.status === '暫停' ? 'badge-warning' : 'badge-danger'}`}>
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
        <Modal title="新增供應商" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="供應商名稱 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="供應商名稱" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="聯絡人">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="聯絡人姓名" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
            </Field>
            <Field label="電話">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="02-1234-5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
          </div>
          <Field label="Email">
            <input className="form-input" type="email" style={{ width: '100%' }} placeholder="supplier@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="地址">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="供應商地址" value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="付款條件">
              <select className="form-input" style={{ width: '100%' }} value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)}>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option>合作中</option>
                <option>暫停</option>
                <option>終止</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

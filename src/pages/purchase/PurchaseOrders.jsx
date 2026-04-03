import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getPurchaseOrders, createPurchaseOrder } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const PAYMENT_TERMS = ['COD', 'NET15', 'NET30', 'NET45', 'NET60']

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ po_number: '', supplier: '', total_amount: '', tax: '', shipping: '', payment_terms: 'NET30', expected_date: '' })

  useEffect(() => {
    getPurchaseOrders().then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.po_number || !form.supplier) return
    const { data } = await createPurchaseOrder({
      ...form,
      total_amount: parseFloat(form.total_amount) || 0,
      tax: parseFloat(form.tax) || 0,
      shipping: parseFloat(form.shipping) || 0,
      status: '待確認',
    })
    if (data) {
      setOrders(prev => [...prev, data])
      setShowModal(false)
      setForm({ po_number: '', supplier: '', total_amount: '', tax: '', shipping: '', payment_terms: 'NET30', expected_date: '' })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = orders.filter(o =>
    search === '' || o.po_number?.includes(search) || o.supplier?.includes(search)
  )

  const pending = filtered.filter(o => o.status === '待確認').length
  const shipping = filtered.filter(o => o.status === '待出貨').length
  const arrived = filtered.filter(o => o.status === '已到貨').length

  const now = new Date()
  const monthTotal = filtered
    .filter(o => {
      const d = new Date(o.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const statusBadge = (status) => {
    const cls = status === '已到貨' ? 'badge-success' : status === '已取消' ? 'badge-danger' : status === '待出貨' ? 'badge-info' : 'badge-warning'
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{status}</span>
  }

  const formatNT = (n) => `NT$ ${(n || 0).toLocaleString()}`

  const calcTotal = (o) => (o.total_amount || 0) + (o.tax || 0) + (o.shipping || 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📄</span> 採購單 (PO)</h2>
            <p>採購訂單管理與追蹤</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增採購單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待確認</div>
          <div className="stat-card-value">{pending}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">待出貨</div>
          <div className="stat-card-value">{shipping}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已到貨</div>
          <div className="stat-card-value">{arrived}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">本月採購額</div>
          <div className="stat-card-value">{formatNT(monthTotal)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 採購單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋PO編號/供應商..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>PO 編號</th><th>供應商</th><th>金額合計</th><th>付款條件</th><th>預計到貨</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無採購單</td></tr>}
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.po_number}</td>
                  <td>{o.supplier}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatNT(calcTotal(o))}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      小計 {formatNT(o.total_amount)} + 稅 {formatNT(o.tax)} + 運費 {formatNT(o.shipping)}
                    </div>
                  </td>
                  <td><span className="badge badge-info"><span className="badge-dot"></span>{o.payment_terms}</span></td>
                  <td>{o.expected_date}</td>
                  <td>{statusBadge(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增採購單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="PO 編號 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="PO-20260401-001" value={form.po_number} onChange={e => set('po_number', e.target.value)} />
            </Field>
            <Field label="供應商 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="供應商名稱" value={form.supplier} onChange={e => set('supplier', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="小計金額">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} />
            </Field>
            <Field label="稅額">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.tax} onChange={e => set('tax', e.target.value)} />
            </Field>
            <Field label="運費">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.shipping} onChange={e => set('shipping', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="付款條件">
              <select className="form-input" style={{ width: '100%' }} value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)}>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="預計到貨日">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.expected_date} onChange={e => set('expected_date', e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

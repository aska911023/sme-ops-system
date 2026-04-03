import { useState, useEffect } from 'react'
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { getMRPResults, createMRPResult } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function MRP() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({
    product_name: '', order_qty: 1, status: '待處理',
    components: [{ name: '', need: 0, stock: 0 }]
  })

  useEffect(() => {
    getMRPResults().then(({ data }) => { setResults(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setComponent = (idx, k, v) => {
    setForm(f => {
      const comps = [...f.components]
      comps[idx] = { ...comps[idx], [k]: v }
      return { ...f, components: comps }
    })
  }

  const addComponent = () => setForm(f => ({
    ...f, components: [...f.components, { name: '', need: 0, stock: 0 }]
  }))

  const removeComponent = (idx) => setForm(f => ({
    ...f, components: f.components.filter((_, i) => i !== idx)
  }))

  const handleSubmit = async () => {
    if (!form.product_name) return
    const hasShortage = form.components.some(c => c.need > c.stock)
    const status = form.status === '待處理' ? '待處理' : hasShortage ? '有缺料' : '無缺料'
    const { data } = await createMRPResult({ ...form, status })
    if (data) {
      setResults(prev => [...prev, data])
      setShowModal(false)
      setForm({ product_name: '', order_qty: 1, status: '待處理', components: [{ name: '', need: 0, stock: 0 }] })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = results.filter(r =>
    search === '' || r.product_name?.includes(search)
  )

  const shortage = filtered.filter(r => r.status === '有缺料').length
  const noShortage = filtered.filter(r => r.status === '無缺料').length
  const pending = filtered.filter(r => r.status === '待處理').length

  const statusBadge = (status) => {
    const cls = status === '有缺料' ? 'badge-danger' : status === '無缺料' ? 'badge-success' : 'badge-warning'
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{status}</span>
  }

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📊</span> MRP 物料需求計畫</h2>
            <p>物料需求分析與缺料管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增 MRP</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">有缺料</div>
          <div className="stat-card-value">{shortage}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">無缺料</div>
          <div className="stat-card-value">{noShortage}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待處理</div>
          <div className="stat-card-value">{pending}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> MRP 結果列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋產品名稱..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 32 }}></th><th>產品名稱</th><th>訂單數量</th><th>零件數</th><th>缺料項目</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無 MRP 資料</td></tr>}
              {filtered.map(r => {
                const comps = r.components || []
                const shortages = comps.filter(c => (c.need || 0) > (c.stock || 0))
                const isExpanded = expandedId === r.id
                return (
                  <>
                    <tr key={r.id} onClick={() => toggleExpand(r.id)} style={{ cursor: 'pointer' }}>
                      <td>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td style={{ fontWeight: 600 }}>{r.product_name}</td>
                      <td>{r.order_qty}</td>
                      <td>{comps.length}</td>
                      <td>{shortages.length > 0 ? <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{shortages.length} 項</span> : <span style={{ color: 'var(--accent-green)' }}>無</span>}</td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                    {isExpanded && comps.length > 0 && (
                      <tr key={`${r.id}-detail`}>
                        <td colSpan={6} style={{ padding: 0, background: 'var(--bg-secondary)' }}>
                          <table className="data-table" style={{ margin: 0, borderRadius: 0 }}>
                            <thead>
                              <tr><th>零件名稱</th><th>需求量</th><th>庫存量</th><th>缺料量</th></tr>
                            </thead>
                            <tbody>
                              {comps.map((c, i) => {
                                const shortageQty = Math.max(0, (c.need || 0) - (c.stock || 0))
                                return (
                                  <tr key={i}>
                                    <td>{c.name}</td>
                                    <td>{c.need}</td>
                                    <td>{c.stock}</td>
                                    <td style={{ color: shortageQty > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
                                      {shortageQty > 0 ? shortageQty : '充足'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {shortages.length > 0 && (
                            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                              <strong style={{ fontSize: 13, color: 'var(--accent-red)' }}>建議採購</strong>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                {shortages.map((c, i) => (
                                  <span key={i} className="badge badge-danger" style={{ fontSize: 12 }}>
                                    <span className="badge-dot"></span>
                                    {c.name}: 採購 {(c.need || 0) - (c.stock || 0)} 件
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增 MRP 計畫" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="產品名稱 *">
              <input className="form-input" style={{ width: '100%' }} placeholder="產品名稱" value={form.product_name} onChange={e => set('product_name', e.target.value)} />
            </Field>
            <Field label="訂單數量">
              <input className="form-input" type="number" style={{ width: '100%' }} value={form.order_qty} onChange={e => set('order_qty', Number(e.target.value))} />
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>零件需求</strong>
              <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={addComponent}><Plus size={12} /> 新增零件</button>
            </div>
            {form.components.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                <Field label={i === 0 ? '名稱' : undefined}>
                  <input className="form-input" style={{ width: '100%' }} placeholder="零件名稱" value={c.name} onChange={e => setComponent(i, 'name', e.target.value)} />
                </Field>
                <Field label={i === 0 ? '需求量' : undefined}>
                  <input className="form-input" type="number" style={{ width: '100%' }} value={c.need} onChange={e => setComponent(i, 'need', Number(e.target.value))} />
                </Field>
                <Field label={i === 0 ? '庫存量' : undefined}>
                  <input className="form-input" type="number" style={{ width: '100%' }} value={c.stock} onChange={e => setComponent(i, 'stock', Number(e.target.value))} />
                </Field>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 18, padding: 4 }} onClick={() => removeComponent(i)}>&times;</button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

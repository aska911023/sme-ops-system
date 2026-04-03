import { useState, useEffect } from 'react'
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { getBOMs, createBOM } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function BOM() {
  const [boms, setBoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({
    product_name: '', product_code: '', version: '1.0', status: '使用中',
    components: [{ name: '', code: '', qty: 1, unit: 'pcs', cost_per_unit: 0 }]
  })

  useEffect(() => {
    getBOMs().then(({ data }) => { setBoms(data || []); setLoading(false) })
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
    ...f, components: [...f.components, { name: '', code: '', qty: 1, unit: 'pcs', cost_per_unit: 0 }]
  }))

  const removeComponent = (idx) => setForm(f => ({
    ...f, components: f.components.filter((_, i) => i !== idx)
  }))

  const handleSubmit = async () => {
    if (!form.product_name || !form.product_code) return
    const total_cost = form.components.reduce((s, c) => s + (c.qty * c.cost_per_unit), 0)
    const { data } = await createBOM({ ...form, total_cost })
    if (data) {
      setBoms(prev => [...prev, data])
      setShowModal(false)
      setForm({ product_name: '', product_code: '', version: '1.0', status: '使用中', components: [{ name: '', code: '', qty: 1, unit: 'pcs', cost_per_unit: 0 }] })
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = boms.filter(b =>
    search === '' || b.product_name?.includes(search) || b.product_code?.includes(search)
  )

  const active = filtered.filter(b => b.status === '使用中').length
  const inactive = filtered.filter(b => b.status === '停用').length
  const avgCost = filtered.length > 0
    ? Math.round(filtered.reduce((s, b) => s + (b.total_cost || 0), 0) / filtered.length)
    : 0

  const fmt = (n) => `NT$ ${(n || 0).toLocaleString()}`

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🔧</span> BOM 物料清單</h2>
            <p>產品物料清單與成本管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增 BOM</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">使用中</div>
          <div className="stat-card-value">{active}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">停用</div>
          <div className="stat-card-value">{inactive}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">平均成本</div>
          <div className="stat-card-value">{fmt(avgCost)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> BOM 列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋產品名稱或代碼..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 32 }}></th><th>產品名稱</th><th>產品代碼</th><th>版本</th><th>總成本</th><th>零件數</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無 BOM 資料</td></tr>}
              {filtered.map(b => {
                const comps = b.components || []
                const isExpanded = expandedId === b.id
                return (
                  <>
                    <tr key={b.id} onClick={() => toggleExpand(b.id)} style={{ cursor: 'pointer' }}>
                      <td>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td style={{ fontWeight: 600 }}>{b.product_name}</td>
                      <td><code>{b.product_code}</code></td>
                      <td>{b.version}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(b.total_cost)}</td>
                      <td>{comps.length}</td>
                      <td>
                        <span className={`badge ${b.status === '使用中' ? 'badge-success' : 'badge-danger'}`}>
                          <span className="badge-dot"></span>{b.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && comps.length > 0 && (
                      <tr key={`${b.id}-detail`}>
                        <td colSpan={7} style={{ padding: 0, background: 'var(--bg-secondary)' }}>
                          <table className="data-table" style={{ margin: 0, borderRadius: 0 }}>
                            <thead>
                              <tr><th>零件名稱</th><th>零件代碼</th><th>數量</th><th>單位</th><th>單價</th><th>小計</th></tr>
                            </thead>
                            <tbody>
                              {comps.map((c, i) => (
                                <tr key={i}>
                                  <td>{c.name}</td>
                                  <td><code>{c.code}</code></td>
                                  <td>{c.qty}</td>
                                  <td>{c.unit}</td>
                                  <td>{fmt(c.cost_per_unit)}</td>
                                  <td style={{ fontWeight: 600 }}>{fmt(c.qty * c.cost_per_unit)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
        <Modal title="新增 BOM" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="產品名稱 *">
              <input className="form-input" style={{ width: '100%' }} placeholder="產品名稱" value={form.product_name} onChange={e => set('product_name', e.target.value)} />
            </Field>
            <Field label="產品代碼 *">
              <input className="form-input" style={{ width: '100%' }} placeholder="P-001" value={form.product_code} onChange={e => set('product_code', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="版本">
              <input className="form-input" style={{ width: '100%' }} placeholder="1.0" value={form.version} onChange={e => set('version', e.target.value)} />
            </Field>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option>使用中</option>
                <option>停用</option>
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>零件清單</strong>
              <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={addComponent}><Plus size={12} /> 新增零件</button>
            </div>
            {form.components.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                <Field label={i === 0 ? '名稱' : undefined}>
                  <input className="form-input" style={{ width: '100%' }} placeholder="零件名稱" value={c.name} onChange={e => setComponent(i, 'name', e.target.value)} />
                </Field>
                <Field label={i === 0 ? '代碼' : undefined}>
                  <input className="form-input" style={{ width: '100%' }} placeholder="代碼" value={c.code} onChange={e => setComponent(i, 'code', e.target.value)} />
                </Field>
                <Field label={i === 0 ? '數量' : undefined}>
                  <input className="form-input" type="number" style={{ width: '100%' }} value={c.qty} onChange={e => setComponent(i, 'qty', Number(e.target.value))} />
                </Field>
                <Field label={i === 0 ? '單位' : undefined}>
                  <input className="form-input" style={{ width: '100%' }} value={c.unit} onChange={e => setComponent(i, 'unit', e.target.value)} />
                </Field>
                <Field label={i === 0 ? '單價' : undefined}>
                  <input className="form-input" type="number" style={{ width: '100%' }} value={c.cost_per_unit} onChange={e => setComponent(i, 'cost_per_unit', Number(e.target.value))} />
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

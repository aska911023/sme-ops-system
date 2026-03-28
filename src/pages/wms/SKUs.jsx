import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const CATEGORIES = ['食品', '飲料', '電子', '服飾', '家居', '美妝', '文具', '其他']

export default function SKUs() {
  const [skus, setSkus] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', barcode: '', unit: '件', weight: '', length: '', width: '', height: '', category: CATEGORIES[0] })

  useEffect(() => {
    supabase.from('skus').select('*').order('id').then(({ data }) => { setSkus(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.code || !form.name) return
    const { data } = await supabase.from('skus').insert({ ...form, status: '啟用' }).select().single()
    if (data) { setSkus(prev => [...prev, data]); setShowModal(false); setForm({ code: '', name: '', barcode: '', unit: '件', weight: '', length: '', width: '', height: '', category: CATEGORIES[0] }) }
  }

  const filtered = skus.filter(s => s.name?.includes(search) || s.code?.includes(search) || s.barcode?.includes(search))

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><h2><span className="header-icon">📋</span> 商品主檔</h2><p>SKU 品項資料管理</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增商品</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">總品項數</div><div className="stat-card-value">{skus.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">啟用中</div><div className="stat-card-value">{skus.filter(s => s.status === '啟用').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">停用</div><div className="stat-card-value">{skus.filter(s => s.status !== '啟用').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📦</span> 商品列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋品號/品名/條碼..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>品號</th><th>品名</th><th>條碼</th><th>分類</th><th>單位</th><th>重量(kg)</th><th>材積(cm)</th><th>狀態</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.code}</td>
                  <td>{s.name}</td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.barcode}</td>
                  <td><span className="badge badge-cyan">{s.category}</span></td>
                  <td>{s.unit}</td>
                  <td>{s.weight}</td>
                  <td style={{ fontSize: 12 }}>{s.length && `${s.length}×${s.width}×${s.height}`}</td>
                  <td><span className={`badge ${s.status === '啟用' ? 'badge-success' : 'badge-neutral'}`}><span className="badge-dot"></span>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增商品" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="品號 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="SKU-001" value={form.code} onChange={e => set('code', e.target.value)} /></Field>
            <Field label="品名 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="商品名稱" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="條碼"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="EAN/UPC" value={form.barcode} onChange={e => set('barcode', e.target.value)} /></Field>
            <Field label="分類"><select className="form-input" style={{ width: '100%' }} value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <Field label="單位"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="件" value={form.unit} onChange={e => set('unit', e.target.value)} /></Field>
            <Field label="重量(kg)"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0.5" value={form.weight} onChange={e => set('weight', e.target.value)} /></Field>
            <Field label="長(cm)"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="10" value={form.length} onChange={e => set('length', e.target.value)} /></Field>
            <Field label="寬(cm)"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="10" value={form.width} onChange={e => set('width', e.target.value)} /></Field>
          </div>
          <Field label="高(cm)"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="10" value={form.height} onChange={e => set('height', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  )
}

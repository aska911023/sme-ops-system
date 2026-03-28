import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const STATUSES = ['待到貨', '收貨中', '已完成', '異常']

export default function Inbound() {
  const [orders, setOrders] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ po_number: '', supplier: '', warehouse_id: '', expected_date: '', status: '待到貨' })

  useEffect(() => {
    Promise.all([
      supabase.from('inbound_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('warehouses').select('*'),
    ]).then(([o, w]) => {
      setOrders(o.data || [])
      setWarehouses(w.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!items[id]) {
      const { data } = await supabase.from('inbound_items').select('*').eq('inbound_order_id', id)
      setItems(prev => ({ ...prev, [id]: data || [] }))
    }
  }

  const handleSubmit = async () => {
    if (!form.po_number || !form.supplier) return
    const { data } = await supabase.from('inbound_orders').insert({ ...form, warehouse_id: form.warehouse_id || null }).select().single()
    if (data) { setOrders(prev => [data, ...prev]); setShowModal(false); setForm({ po_number: '', supplier: '', warehouse_id: '', expected_date: '', status: '待到貨' }) }
  }

  const updateStatus = async (id, status) => {
    const { data } = await supabase.from('inbound_orders').update({ status }).eq('id', id).select().single()
    if (data) setOrders(prev => prev.map(o => o.id === id ? data : o))
  }

  const updateItemQty = async (orderId, itemId, qty) => {
    const { data } = await supabase.from('inbound_items').update({ received_qty: qty, status: '已收貨' }).eq('id', itemId).select().single()
    if (data) setItems(prev => ({ ...prev, [orderId]: prev[orderId].map(i => i.id === itemId ? data : i) }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><h2><span className="header-icon">📦</span> 進貨管理</h2><p>採購單收貨與上架管理</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增進貨單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[['待到貨', 'badge-warning', 'var(--accent-orange)', 'var(--accent-orange-dim)'],
          ['收貨中', 'badge-info', 'var(--accent-blue)', 'var(--accent-blue-dim)'],
          ['已完成', 'badge-success', 'var(--accent-green)', 'var(--accent-green-dim)'],
          ['異常', 'badge-danger', 'var(--accent-red)', 'var(--accent-red-dim)']
        ].map(([s, , accent, dim]) => (
          <div key={s} className="stat-card" style={{ '--card-accent': accent, '--card-accent-dim': dim }}>
            <div className="stat-card-label">{s}</div>
            <div className="stat-card-value">{orders.filter(o => o.status === s).length}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {orders.map(o => (
          <div key={o.id} className="card">
            <div className="card-body" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(o.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {expanded === o.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div>
                    <div style={{ fontWeight: 700 }}>{o.po_number}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.supplier} · 預計到貨：{o.expected_date || '-'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    className="form-input"
                    style={{ padding: '2px 8px', fontSize: 12 }}
                    value={o.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {expanded === o.id && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
                {(items[o.id] || []).length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>尚無明細</div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>品號</th><th>品名</th><th>預計數量</th><th>實收數量</th><th>指定儲位</th><th>狀態</th></tr></thead>
                    <tbody>
                      {items[o.id].map(item => (
                        <tr key={item.id}>
                          <td style={{ fontFamily: 'monospace' }}>{item.sku_code}</td>
                          <td>{item.sku_name}</td>
                          <td>{item.expected_qty}</td>
                          <td>
                            <input
                              className="form-input"
                              type="number"
                              style={{ width: 80, padding: '2px 6px', fontSize: 12 }}
                              defaultValue={item.received_qty}
                              onBlur={e => updateItemQty(o.id, item.id, Number(e.target.value))}
                            />
                          </td>
                          <td style={{ fontSize: 12 }}>{item.bin_code || '-'}</td>
                          <td><span className={`badge ${item.status === '已收貨' ? 'badge-success' : 'badge-warning'}`}><span className="badge-dot"></span>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="新增進貨單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="採購單號 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="PO-2026-001" value={form.po_number} onChange={e => set('po_number', e.target.value)} /></Field>
            <Field label="供應商 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="供應商名稱" value={form.supplier} onChange={e => set('supplier', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="倉庫">
              <select className="form-input" style={{ width: '100%' }} value={form.warehouse_id} onChange={e => set('warehouse_id', e.target.value)}>
                <option value="">請選擇倉庫</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Field>
            <Field label="預計到貨日"><input className="form-input" type="date" style={{ width: '100%' }} value={form.expected_date} onChange={e => set('expected_date', e.target.value)} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

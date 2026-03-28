import { useState, useEffect } from 'react'
import { Plus, Search, ChevronDown, ChevronRight, Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const TAGS = ['VIP', '潛力客戶', '愛砍價', '潛在經銷商', '老客戶', '冷客戶']
const STATUSES = ['活躍', '潛在', '冷凍', '流失']
const CONTACT_TYPES = ['call', 'email', 'line', 'meeting']
const CONTACT_TYPE_LABELS = { call: '📞 電話', email: '📧 Email', line: '💬 LINE', meeting: '🤝 面談' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [contacts, setContacts] = useState({})
  const [outboundOrders, setOutboundOrders] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeCustomerId, setActiveCustomerId] = useState(null)
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', tags: [], assigned_to: '', source: '', status: '活躍', notes: '', credit_limit: '', location_id: '' })
  const [contactForm, setContactForm] = useState({ type: 'call', content: '', operator: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*'),
      supabase.from('outbound_orders').select('*').order('created_at', { ascending: false }),
    ]).then(([c, l, o]) => {
      setCustomers(c.data || [])
      setLocations(l.data || [])
      setOutboundOrders(o.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setC = (k, v) => setContactForm(f => ({ ...f, [k]: v }))

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!contacts[id]) {
      const { data } = await supabase.from('customer_contacts').select('*').eq('customer_id', id).order('created_at', { ascending: false })
      setContacts(prev => ({ ...prev, [id]: data || [] }))
    }
  }

  const handleSubmit = async () => {
    if (!form.name) return
    const { data } = await supabase.from('customers').insert({ ...form, credit_limit: Number(form.credit_limit) || 0, location_id: form.location_id || null }).select().single()
    if (data) { setCustomers(prev => [data, ...prev]); setShowModal(false); setForm({ name: '', company: '', phone: '', email: '', tags: [], assigned_to: '', source: '', status: '活躍', notes: '', credit_limit: '', location_id: '' }) }
  }

  const handleAddContact = async () => {
    if (!contactForm.content) return
    const { data } = await supabase.from('customer_contacts').insert({ ...contactForm, customer_id: activeCustomerId }).select().single()
    if (data) {
      setContacts(prev => ({ ...prev, [activeCustomerId]: [data, ...(prev[activeCustomerId] || [])] }))
      setShowContactModal(false)
      setContactForm({ type: 'call', content: '', operator: '' })
    }
  }

  const toggleTag = (tag) => setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))

  const filtered = customers.filter(c =>
    (locFilter === '' || String(c.location_id) === locFilter) &&
    (tagFilter === '' || (c.tags || []).includes(tagFilter)) &&
    (c.name?.includes(search) || c.company?.includes(search) || c.phone?.includes(search))
  )

  if (loading) return <LoadingSpinner />

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
          <div><h2><span className="header-icon">👥</span> 客戶管理</h2><p>客戶 360 度視圖與互動紀錄</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增客戶</button>
        </div>
      </div>

      {/* 分店篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(locFilter === '')} onClick={() => setLocFilter('')}>全部分店</button>
        {locations.map(l => (
          <button key={l.id} style={filterBtnStyle(locFilter === String(l.id))} onClick={() => setLocFilter(String(l.id))}>{l.name}</button>
        ))}
      </div>

      {/* 標籤篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(tagFilter === '')} onClick={() => setTagFilter('')}>全部標籤</button>
        {TAGS.map(tag => (
          <button key={tag} style={filterBtnStyle(tagFilter === tag)} onClick={() => setTagFilter(tag)}>{tag}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">👥</span> 客戶清單 ({filtered.length})</div>
          <div className="search-bar"><Search className="search-icon" /><input type="text" placeholder="姓名/公司/電話..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>尚無客戶資料</div>}
          {filtered.map(c => (
            <div key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggleExpand(c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {expanded === c.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {c.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name} {c.company && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>· {c.company}</span>}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      {c.phone && <span><Phone size={11} style={{ marginRight: 3 }} />{c.phone}</span>}
                      {c.email && <span><Mail size={11} style={{ marginRight: 3 }} />{c.email}</span>}
                      {c.location_id && <span>📍 {locations.find(l => l.id === c.location_id)?.name}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {(c.tags || []).map(tag => (
                    <span key={tag} style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', fontSize: 11, fontWeight: 600 }}>{tag}</span>
                  ))}
                  <span className={`badge ${c.status === '活躍' ? 'badge-success' : c.status === '潛在' ? 'badge-info' : 'badge-neutral'}`}><span className="badge-dot"></span>{c.status}</span>
                  {c.credit_limit > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>額度 ${c.credit_limit.toLocaleString()}</span>}
                </div>
              </div>

              {expanded === c.id && (
                <div style={{ background: 'var(--glass-light)', padding: '12px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                  {/* WMS 出貨狀態 */}
                  {(() => {
                    const orders = outboundOrders.filter(o => o.customer === c.name).slice(0, 3)
                    if (orders.length === 0) return null
                    return (
                      <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>🚚 最新出貨狀態（WMS）</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {orders.map(o => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                              <div>
                                <span style={{ fontWeight: 600 }}>{o.order_number}</span>
                                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{o.carrier}</span>
                                {o.tracking_number && <span style={{ color: 'var(--accent-cyan)', marginLeft: 8 }}>單號：{o.tracking_number}</span>}
                              </div>
                              <span className={`badge ${o.status === '已出貨' ? 'badge-success' : o.status === '揀貨中' || o.status === '已複核' ? 'badge-info' : 'badge-warning'}`}>
                                <span className="badge-dot"></span>{o.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>📋 基本資料</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2 }}>
                        {c.source && <div>來源：{c.source}</div>}
                        {c.assigned_to && <div>負責業務：{c.assigned_to}</div>}
                        {c.notes && <div>備註：{c.notes}</div>}
                        {c.outstanding_amount > 0 && <div style={{ color: 'var(--accent-orange)' }}>⚠ 未收帳款：${c.outstanding_amount?.toLocaleString()}</div>}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>💬 互動紀錄</div>
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={e => { e.stopPropagation(); setActiveCustomerId(c.id); setShowContactModal(true) }}>
                          <Plus size={11} /> 新增
                        </button>
                      </div>
                      {(contacts[c.id] || []).length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>尚無互動紀錄</div>
                      ) : (contacts[c.id] || []).slice(0, 4).map(ct => (
                        <div key={ct.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                          <span>{CONTACT_TYPE_LABELS[ct.type] || '📋'}</span>
                          <div>
                            <div>{ct.content}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ct.operator} · {new Date(ct.created_at).toLocaleString('zh-TW')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <Modal title="新增客戶" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="姓名 *"><input className="form-input" type="text" style={{ width: '100%' }} value={form.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="公司"><input className="form-input" type="text" style={{ width: '100%' }} value={form.company} onChange={e => set('company', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="電話"><input className="form-input" type="text" style={{ width: '100%' }} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
            <Field label="Email"><input className="form-input" type="email" style={{ width: '100%' }} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="負責業務"><input className="form-input" type="text" style={{ width: '100%' }} value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} /></Field>
            <Field label="所屬分店">
              <select className="form-input" style={{ width: '100%' }} value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                <option value="">請選擇分店</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="信用額度"><input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.credit_limit} onChange={e => set('credit_limit', e.target.value)} /></Field>
          </div>
          <Field label="客戶來源"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="展覽/介紹/官網..." value={form.source} onChange={e => set('source', e.target.value)} /></Field>
          <Field label="客戶標籤">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {TAGS.map(tag => (
                <span key={tag} onClick={() => toggleTag(tag)} style={{ padding: '4px 12px', borderRadius: 8, border: `1px solid ${form.tags.includes(tag) ? 'var(--accent-cyan)' : 'var(--border-medium)'}`, background: form.tags.includes(tag) ? 'var(--accent-cyan-dim)' : 'transparent', color: form.tags.includes(tag) ? 'var(--accent-cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>{tag}</span>
              ))}
            </div>
          </Field>
          <Field label="備註"><textarea className="form-input" style={{ width: '100%', minHeight: 60 }} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
        </Modal>
      )}

      {showContactModal && (
        <Modal title="新增互動紀錄" onClose={() => setShowContactModal(false)} onSubmit={handleAddContact} submitLabel="新增">
          <Field label="類型">
            <select className="form-input" style={{ width: '100%' }} value={contactForm.type} onChange={e => setC('type', e.target.value)}>
              {CONTACT_TYPES.map(t => <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="內容 *"><textarea className="form-input" style={{ width: '100%', minHeight: 80 }} placeholder="紀錄溝通內容..." value={contactForm.content} onChange={e => setC('content', e.target.value)} /></Field>
          <Field label="操作人"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="業務姓名" value={contactForm.operator} onChange={e => setC('operator', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  )
}

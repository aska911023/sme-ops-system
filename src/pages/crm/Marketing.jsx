import { useState, useEffect } from 'react'
import { Plus, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const CAMPAIGN_TYPES = ['SMS 簡訊', 'Email', 'LINE 訊息']
const SEGMENTS = ['全部客戶', 'VIP 客戶', '半年未購買', '生日當月', '潛力客戶', '老客戶']
const STATUSES = ['草稿', '排程中', '已發送', '已取消']

export default function Marketing() {
  const [campaigns, setCampaigns] = useState([])
  const [locations, setLocations] = useState([])
  const [locFilter, setLocFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'SMS 簡訊', segment: '全部客戶', message: '', scheduled_at: '', status: '草稿', location_id: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*'),
    ]).then(([c, l]) => {
      setCampaigns(c.data || [])
      setLocations(l.data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.message) return
    const { data } = await supabase.from('marketing_campaigns').insert({ ...form, location_id: form.location_id || null }).select().single()
    if (data) { setCampaigns(prev => [data, ...prev]); setShowModal(false); setForm({ name: '', type: 'SMS 簡訊', segment: '全部客戶', message: '', scheduled_at: '', status: '草稿', location_id: '' }) }
  }

  const updateStatus = async (id, status) => {
    const { data } = await supabase.from('marketing_campaigns').update({ status }).eq('id', id).select().single()
    if (data) setCampaigns(prev => prev.map(c => c.id === id ? data : c))
  }

  if (loading) return <LoadingSpinner />

  const filtered = campaigns.filter(c => locFilter === '' || String(c.location_id) === locFilter)
  const filterBtnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  const AUTO_RULES = [
    { icon: '🎂', title: '生日關懷', desc: '客戶生日當天自動發送祝福與優惠券', trigger: '生日當天', channel: 'LINE/SMS', status: '啟用' },
    { icon: '😴', title: '喚醒沉睡客戶', desc: '半年未下單客戶自動發送促銷簡訊', trigger: '180天未購', channel: 'SMS', status: '啟用' },
    { icon: '🎉', title: '節日問候', desc: '農曆新年、中秋節自動發送祝福', trigger: '節日前3天', channel: 'LINE', status: '啟用' },
    { icon: '📧', title: 'EDM 未開信追蹤', desc: '3天內未開信的客戶標記為高意向，提醒業務致電', trigger: '3天未開', channel: 'Email', status: '啟用' },
    { icon: '🛒', title: '報價後追蹤', desc: '報價後7天無回應自動發提醒', trigger: '報價後7天', channel: 'LINE', status: '停用' },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><h2><span className="header-icon">📣</span> 行銷自動化</h2><p>分群發送、節日關懷與 EDM 追蹤</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增行銷活動</button>
        </div>
      </div>

      {/* 分店篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={filterBtnStyle(locFilter === '')} onClick={() => setLocFilter('')}>全部分店</button>
        {locations.map(l => (
          <button key={l.id} style={filterBtnStyle(locFilter === String(l.id))} onClick={() => setLocFilter(String(l.id))}>{l.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">行銷活動總數</div><div className="stat-card-value">{filtered.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已發送</div><div className="stat-card-value">{filtered.filter(c => c.status === '已發送').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">排程中</div><div className="stat-card-value">{filtered.filter(c => c.status === '排程中').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">自動化規則</div><div className="stat-card-value">{AUTO_RULES.filter(r => r.status === '啟用').length}</div>
        </div>
      </div>

      {/* 自動化規則 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">⚡</span> 自動化規則</div>
          <span className="badge badge-success"><span className="badge-dot"></span>系統自動執行</span>
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AUTO_RULES.map((rule, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--glass-light)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{rule.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{rule.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rule.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>觸發：{rule.trigger}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 6 }}>{rule.channel}</span>
                <span className={`badge ${rule.status === '啟用' ? 'badge-success' : 'badge-neutral'}`}><span className="badge-dot"></span>{rule.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 行銷活動列表 */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 行銷活動列表</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>活動名稱</th><th>分店</th><th>類型</th><th>目標受眾</th><th>預計發送時間</th><th>已發送數</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無行銷活動</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontSize: 12 }}>{locations.find(l => l.id === c.location_id)?.name || '-'}</td>
                  <td style={{ fontSize: 12 }}>{c.type}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', fontSize: 11 }}>{c.segment}</span></td>
                  <td style={{ fontSize: 12 }}>{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString('zh-TW') : '-'}</td>
                  <td style={{ fontWeight: 700 }}>{c.sent_count || 0}</td>
                  <td>
                    <select className="form-input" style={{ fontSize: 12, padding: '2px 6px' }} value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {c.status === '草稿' && (
                      <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => updateStatus(c.id, '排程中')}>
                        <Send size={11} /> 排程
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增行銷活動" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="活動名稱 *"><input className="form-input" type="text" style={{ width: '100%' }} placeholder="夏季促銷活動..." value={form.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="所屬分店">
              <select className="form-input" style={{ width: '100%' }} value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                <option value="">全部分店</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="發送類型">
              <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
                {CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="目標受眾">
              <select className="form-input" style={{ width: '100%' }} value={form.segment} onChange={e => set('segment', e.target.value)}>
                {SEGMENTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="訊息內容 *"><textarea className="form-input" style={{ width: '100%', minHeight: 100 }} placeholder="親愛的客戶，我們特別為您提供..." value={form.message} onChange={e => set('message', e.target.value)} /></Field>
          <Field label="排程時間"><input className="form-input" type="datetime-local" style={{ width: '100%' }} value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  )
}

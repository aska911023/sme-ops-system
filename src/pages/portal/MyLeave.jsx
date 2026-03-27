import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const LEAVE_TYPES = ['特休', '病假', '事假', '婚假', '喪假', '產假', '陪產假']

const STATUS_BADGE = {
  '待審核': 'badge-warning',
  '核准': 'badge-success',
  '拒絕': 'badge-danger',
}

export default function MyLeave() {
  const { profile } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: LEAVE_TYPES[0], start_date: '', end_date: '', reason: '' })

  useEffect(() => {
    if (!profile) return
    supabase.from('leave_requests')
      .select('*').eq('employee', profile.name).order('created_at', { ascending: false })
      .then(({ data }) => { setLeaves(data || []); setLoading(false) })
  }, [profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.start_date || !form.end_date) return
    setSaving(true)
    const { data } = await supabase.from('leave_requests').insert({
      employee: profile.name,
      dept: profile.dept,
      type: form.type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
      status: '待審核',
    }).select().single()
    if (data) {
      setLeaves(prev => [data, ...prev])
      setShowForm(false)
      setForm({ type: LEAVE_TYPES[0], start_date: '', end_date: '', reason: '' })
    }
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>我的假單</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>假單申請與查詢</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={14} /> 申請假單
        </button>
      </div>

      {/* 申請表單 */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📝</span> 新增假單</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>假別</label>
                <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>開始日期</label>
                  <input className="form-input" type="date" style={{ width: '100%' }} value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>結束日期</label>
                  <input className="form-input" type="date" style={{ width: '100%' }} value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>原因</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', height: 80, resize: 'vertical' }}
                  placeholder="請簡述請假原因"
                  value={form.reason}
                  onChange={e => set('reason', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '送出中...' : '送出申請'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 假單列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>載入中...</div>
        ) : leaves.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
              尚無假單紀錄
            </div>
          </div>
        ) : leaves.map(l => (
          <div key={l.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="badge badge-neutral">{l.type}</span>
                    <span className={`badge ${STATUS_BADGE[l.status] || 'badge-neutral'}`}>
                      <span className="badge-dot"></span>{l.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {l.start_date} ~ {l.end_date}
                  </div>
                  {l.reason && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.reason}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const STATUS_BADGE = { '待審核': 'badge-warning', '核准': 'badge-success', '拒絕': 'badge-danger' }

export default function MyTravel() {
  const { profile } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ destination: '', start_date: '', end_date: '', purpose: '', budget: '' })

  useEffect(() => {
    if (!profile) return
    supabase.from('business_trips').select('*').eq('employee', profile.name)
      .order('id', { ascending: false })
      .then(({ data }) => { setTrips(data || []); setLoading(false) })
  }, [profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.destination || !form.start_date || !form.end_date) return
    setSaving(true)
    const { data } = await supabase.from('business_trips').insert({
      employee: profile.name,
      dept: profile.dept,
      destination: form.destination,
      start_date: form.start_date,
      end_date: form.end_date,
      purpose: form.purpose,
      budget: form.budget ? Number(form.budget) : null,
      status: '待審核',
    }).select().single()
    if (data) {
      setTrips(prev => [data, ...prev])
      setShowForm(false)
      setForm({ destination: '', start_date: '', end_date: '', purpose: '', budget: '' })
    }
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>出差報帳</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>出差申請與費用報帳</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> 申請出差
        </button>
      </div>

      {/* 申請表單 */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">✈️</span> 新增出差申請</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>出差地點</label>
                <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：台中、日本東京" value={form.destination} onChange={e => set('destination', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>出發日期</label>
                  <input className="form-input" type="date" style={{ width: '100%' }} value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>返回日期</label>
                  <input className="form-input" type="date" style={{ width: '100%' }} value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>出差目的</label>
                <textarea className="form-input" style={{ width: '100%', height: 72, resize: 'vertical' }} placeholder="說明出差目的與任務" value={form.purpose} onChange={e => set('purpose', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>預估費用 (NT$)</label>
                <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '送出中...' : '送出申請'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>載入中...</div>
        ) : trips.length === 0 ? (
          <div className="card"><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>尚無出差紀錄</div></div>
        ) : trips.map(t => (
          <div key={t.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>✈️ {t.destination}</span>
                    <span className={`badge ${STATUS_BADGE[t.status] || 'badge-neutral'}`}><span className="badge-dot"></span>{t.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{t.start_date} ~ {t.end_date}</div>
                  {t.purpose && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.purpose}</div>}
                </div>
                {t.budget && (
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-purple)' }}>NT$ {(t.budget || 0).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

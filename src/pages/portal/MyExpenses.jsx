import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['餐費', '交通費', '住宿費', '辦公用品', '客戶招待', '其他']

const STATUS_BADGE = { '待審核': 'badge-warning', '核准': 'badge-success', '拒絕': 'badge-danger' }

export default function MyExpenses() {
  const { profile } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ category: CATEGORIES[0], amount: '', date: '', description: '', receipt: '' })

  useEffect(() => {
    if (!profile) return
    supabase.from('expenses').select('*').eq('employee', profile.name)
      .order('id', { ascending: false })
      .then(({ data }) => { setExpenses(data || []); setLoading(false) })
  }, [profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.date) return
    setSaving(true)
    const { data } = await supabase.from('expenses').insert({
      employee: profile.name,
      dept: profile.dept,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
      status: '待審核',
    }).select().single()
    if (data) {
      setExpenses(prev => [data, ...prev])
      setShowForm(false)
      setForm({ category: CATEGORIES[0], amount: '', date: '', description: '', receipt: '' })
    }
    setSaving(false)
  }

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const approved = expenses.filter(e => e.status === '核准').reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>費用核銷</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>費用申請與報銷查詢</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> 申請核銷
        </button>
      </div>

      {/* 統計 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>申請總額</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-cyan)' }}>NT$ {total.toLocaleString()}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>已核准</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>NT$ {approved.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 申請表單 */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">💰</span> 新增費用申請</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>費用類別</label>
                  <select className="form-input" style={{ width: '100%' }} value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>金額 (NT$)</label>
                  <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>費用日期</label>
                <input className="form-input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>說明</label>
                <textarea className="form-input" style={{ width: '100%', height: 72, resize: 'vertical' }} placeholder="費用說明" value={form.description} onChange={e => set('description', e.target.value)} />
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
        ) : expenses.length === 0 ? (
          <div className="card"><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>尚無費用紀錄</div></div>
        ) : expenses.map(e => (
          <div key={e.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                    <span className="badge badge-neutral">{e.category}</span>
                    <span className={`badge ${STATUS_BADGE[e.status] || 'badge-neutral'}`}><span className="badge-dot"></span>{e.status}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{e.date} · {e.description}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-cyan)' }}>NT$ {(e.amount || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

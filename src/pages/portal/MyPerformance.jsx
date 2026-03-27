import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function MyPerformance() {
  const { profile } = useAuth()
  const [goals, setGoals] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('performance_goals').select('*').eq('employee', profile.name).order('id'),
      supabase.from('performance_reviews').select('*').eq('employee', profile.name).order('id', { ascending: false }),
    ]).then(([g, r]) => {
      setGoals(g.data || [])
      setReviews(r.data || [])
      setLoading(false)
    })
  }, [profile])

  const startUpdate = (goal) => {
    setUpdating(goal.id)
    setInputVal(String(goal.current ?? 0))
  }

  const confirmUpdate = async (goal) => {
    const newVal = Math.max(0, Math.min(goal.target, Number(inputVal)))
    const { data } = await supabase.from('performance_goals')
      .update({ current: newVal })
      .eq('id', goal.id).select().single()
    if (data) setGoals(prev => prev.map(g => g.id === goal.id ? data : g))
    setUpdating(null)
  }

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>載入中...</div>

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>我的績效</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>目標追蹤與進度回報</p>
      </div>

      {/* 考核紀錄 */}
      {reviews.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📊</span> 考核紀錄</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviews.map(r => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.period}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    目標達成 {r.goals_completed}/{r.goals} · 評核人：{r.reviewer || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: r.overall_score >= 90 ? 'var(--accent-green)' : r.overall_score >= 80 ? 'var(--accent-cyan)' : 'var(--accent-orange)',
                  }}>{r.overall_score}</span>
                  <span className={`badge ${r.rating?.startsWith('A') || r.rating === 'S' ? 'badge-success' : 'badge-info'}`}>{r.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 目標追蹤 */}
      <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>🎯 我的目標</div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            目前沒有指派目標
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map(g => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
            const done = g.current >= g.target
            const isEditing = updating === g.id
            return (
              <div key={g.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="badge badge-cyan">{g.category}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{g.title}</span>
                        {done && <span className="badge badge-success">✓ 達成</span>}
                      </div>
                      {g.deadline && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>截止：{g.deadline}</div>
                      )}
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{
                        width: `${pct}%`,
                        background: done ? 'var(--accent-green)' : pct >= 70 ? 'var(--accent-cyan)' : pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--accent-green)' : 'var(--text-secondary)', minWidth: 36 }}>{pct}%</span>
                  </div>

                  {/* 進度回報 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>目前進度：</span>
                    {isEditing ? (
                      <>
                        <input
                          className="form-input"
                          type="number"
                          style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                          value={inputVal}
                          min={0}
                          max={g.target}
                          onChange={e => setInputVal(e.target.value)}
                          autoFocus
                        />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {g.target} {g.unit}</span>
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => confirmUpdate(g)}>確認</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setUpdating(null)}>取消</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 14, fontWeight: 700, color: done ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>
                          {g.current ?? 0} / {g.target} {g.unit}
                        </span>
                        {!done && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 4 }}
                            onClick={() => startUpdate(g)}
                          >
                            回報進度
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {g.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{g.note}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

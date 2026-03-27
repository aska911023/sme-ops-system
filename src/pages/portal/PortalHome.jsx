import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function PortalHome() {
  const { profile } = useAuth()
  const [todayRecord, setTodayRecord] = useState(null)
  const [pendingLeaves, setPendingLeaves] = useState([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!profile) return
    // 今日打卡紀錄
    supabase.from('attendance_records')
      .select('*').eq('employee', profile.name).eq('date', today).maybeSingle()
      .then(({ data }) => setTodayRecord(data))

    // 我的待審假單
    supabase.from('leave_requests')
      .select('*').eq('employee', profile.name).eq('status', '待審核')
      .then(({ data }) => setPendingLeaves(data || []))
  }, [profile])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安'

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{greeting}，{profile?.name} 👋</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          {now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 今日打卡狀態 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>今日出勤</div>
              {todayRecord ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    <span className={`badge ${todayRecord.status === '正常' ? 'badge-success' : todayRecord.status === '遲到' ? 'badge-warning' : 'badge-danger'}`}>
                      <span className="badge-dot"></span>{todayRecord.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', gap: 16 }}>
                    <span>上班 {todayRecord.clock_in || '-'}</span>
                    <span>下班 {todayRecord.clock_out || '尚未打卡'}</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>今日尚未打卡</div>
              )}
            </div>
            <div style={{ fontSize: 40 }}>{todayRecord?.clock_in ? '✅' : '⏰'}</div>
          </div>
        </div>
      </div>

      {/* 待審假單 */}
      {pendingLeaves.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📋</span> 待審假單</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingLeaves.map(l => (
              <div key={l.id} style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--glass-light)', border: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span className="badge badge-warning" style={{ marginRight: 8 }}>{l.type}</span>
                  <span style={{ fontSize: 13 }}>{l.start_date} ~ {l.end_date}</span>
                </div>
                <span className="badge badge-warning"><span className="badge-dot"></span>待審核</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速入口 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { emoji: '⏰', label: '去打卡', path: '/portal/clock', color: 'var(--accent-cyan)' },
          { emoji: '🏖️', label: '申請假單', path: '/portal/leave', color: 'var(--accent-purple)' },
        ].map(item => (
          <a key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: `1px solid var(--border-medium)`,
              borderRadius: 14, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.label}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

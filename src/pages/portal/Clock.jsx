import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Clock() {
  const { profile } = useAuth()
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [now, setNow] = useState(new Date())
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!profile) return
    supabase.from('attendance_records')
      .select('*').eq('employee', profile.name).eq('date', today).maybeSingle()
      .then(({ data }) => { setTodayRecord(data); setLoading(false) })
  }, [profile])

  const handleClockIn = async () => {
    if (!profile) return
    setSaving(true)
    const timeStr = now.toTimeString().slice(0, 5)
    const hour = now.getHours()
    const status = hour < 9 ? '正常' : hour < 10 ? '遲到' : '嚴重遲到'
    const { data } = await supabase.from('attendance_records').insert({
      employee: profile.name,
      dept: profile.dept,
      date: today,
      clock_in: timeStr,
      status,
    }).select().single()
    if (data) setTodayRecord(data)
    setSaving(false)
  }

  const handleClockOut = async () => {
    if (!todayRecord) return
    setSaving(true)
    const timeStr = now.toTimeString().slice(0, 5)
    const { data } = await supabase.from('attendance_records')
      .update({ clock_out: timeStr })
      .eq('id', todayRecord.id)
      .select().single()
    if (data) setTodayRecord(data)
    setSaving(false)
  }

  const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>打卡</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>上下班打卡紀錄</p>
      </div>

      {/* 時鐘 */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div className="card-body" style={{ padding: '32px 20px' }}>
          <div style={{ fontSize: 52, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: 2, color: 'var(--accent-cyan)', marginBottom: 8 }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dateStr}</div>
        </div>
      </div>

      {/* 今日狀態 */}
      {!loading && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>今日出勤紀錄</div>
            {todayRecord ? (
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>上班時間</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-cyan)' }}>{todayRecord.clock_in}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>下班時間</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: todayRecord.clock_out ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                    {todayRecord.clock_out || '--:--'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>狀態</div>
                  <span className={`badge ${todayRecord.status === '正常' ? 'badge-success' : todayRecord.status === '遲到' ? 'badge-warning' : 'badge-danger'}`}>
                    <span className="badge-dot"></span>{todayRecord.status}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>今日尚未打卡</div>
            )}
          </div>
        </div>
      )}

      {/* 打卡按鈕 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!todayRecord && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14 }}
            onClick={handleClockIn}
            disabled={saving || loading}
          >
            {saving ? '打卡中...' : '⏰ 上班打卡'}
          </button>
        )}
        {todayRecord && !todayRecord.clock_out && (
          <button
            onClick={handleClockOut}
            disabled={saving}
            style={{
              width: '100%', padding: '16px', fontSize: 16, borderRadius: 14,
              background: 'var(--accent-purple)', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            {saving ? '打卡中...' : '🏠 下班打卡'}
          </button>
        )}
        {todayRecord?.clock_out && (
          <div style={{
            textAlign: 'center', padding: '16px', borderRadius: 14,
            background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)', fontSize: 15, fontWeight: 600,
          }}>
            ✅ 今日打卡完成
          </div>
        )}
      </div>
    </div>
  )
}

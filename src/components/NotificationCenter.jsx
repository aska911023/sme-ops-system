import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, X, AlertTriangle, Clock, Package, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    const items = []
    const today = new Date().toISOString().slice(0, 10)

    try {
      // 1. Pending leave requests
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', '待審核')
        .order('id', { ascending: false })
        .limit(5)
      if (leaves) {
        leaves.forEach(l => items.push({
          id: `leave-${l.id}`,
          icon: Calendar,
          color: 'var(--accent-blue)',
          dim: 'var(--accent-blue-dim)',
          title: '待審假單',
          desc: `${l.employee} 申請${l.type || '假'}（${l.start_date}）`,
          time: l.start_date,
        }))
      }

      // 2. Low inventory
      const { data: stocks } = await supabase
        .from('stock_levels')
        .select('*')
        .limit(100)
      if (stocks) {
        stocks.filter(s => (s.quantity || 0) <= (s.min_qty || 10)).forEach(s => items.push({
          id: `stock-${s.id}`,
          icon: Package,
          color: 'var(--accent-orange)',
          dim: 'var(--accent-orange-dim)',
          title: '低庫存警示',
          desc: `${s.sku_name} 剩餘 ${s.quantity} ${s.unit || '個'}`,
          time: '即時',
        }))
      }

      // 3. Overdue tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', '已完成')
        .lt('due_date', today)
        .order('due_date')
        .limit(5)
      if (tasks) {
        tasks.forEach(t => items.push({
          id: `task-${t.id}`,
          icon: AlertTriangle,
          color: 'var(--accent-red)',
          dim: 'var(--accent-red-dim)',
          title: '任務逾期',
          desc: `「${t.title}」已超過截止日（${t.due_date}）`,
          time: t.due_date,
        }))
      }

      // 4. Today's late arrivals
      const { data: lateRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today)
        .eq('status', '遲到')
        .limit(5)
      if (lateRecords) {
        lateRecords.forEach(a => items.push({
          id: `late-${a.id}`,
          icon: Clock,
          color: 'var(--accent-purple)',
          dim: 'var(--accent-purple-dim)',
          title: '今日遲到',
          desc: `${a.employee} 於 ${a.clock_in} 打卡`,
          time: today,
        }))
      }
    } catch (e) {
      // silently fail
    }

    setNotifications(items)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [])

  const count = notifications.length

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: open ? 'var(--glass-strong)' : 'var(--glass-light)',
          border: `1px solid ${open ? 'var(--border-strong)' : 'var(--border-medium)'}`,
          color: open ? 'var(--accent-cyan)' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <Bell size={16} />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent-red)',
            color: '#fff', fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(248,113,113,0.4)',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Overlay + Panel (portal to body to escape sidebar overflow:hidden) */}
      {open && createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              background: 'rgba(0,0,0,0.3)',
            }}
          />
          <div style={{
            position: 'fixed',
            top: 8,
            left: 268,
            width: 380,
            maxHeight: 'calc(100vh - 16px)',
            zIndex: 999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>通知中心</span>
                {count > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 99,
                    background: 'var(--accent-red-dim)', color: 'var(--accent-red)',
                    fontSize: 11, fontWeight: 700,
                  }}>{count} 項</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 4,
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Notification List */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '8px 12px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--text-muted) transparent',
            }}>
              {loading && notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                  載入中...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>目前沒有通知</div>
                </div>
              ) : (
                notifications.map(n => {
                  const Icon = n.icon
                  return (
                    <div key={n.id} style={{
                      display: 'flex', gap: 12, padding: '12px 8px',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: n.dim, color: n.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {n.title}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {n.desc}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

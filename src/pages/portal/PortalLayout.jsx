import { NavLink, Outlet } from 'react-router-dom'
import { Clock, CalendarOff, Home, LogOut, Receipt, Plane, Star } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function PortalLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <header style={{
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-purple-dim))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan)',
          }}>AI</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>員工自助平台</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile?.dept} · {profile?.position}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: profile?.avatar || 'var(--accent-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#fff',
          }}>{profile?.name?.[0]}</div>
          <button
            onClick={signOut}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Bottom Nav (Mobile style) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', zIndex: 100,
      }}>
        {[
          { to: '/portal', icon: Home, label: '首頁', end: true },
          { to: '/portal/clock', icon: Clock, label: '打卡' },
          { to: '/portal/leave', icon: CalendarOff, label: '假單' },
          { to: '/portal/expenses', icon: Receipt, label: '核銷' },
          { to: '/portal/travel', icon: Plane, label: '出差' },
          { to: '/portal/performance', icon: Star, label: '績效' },
        ].map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '10px 0', textDecoration: 'none',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main style={{ flex: 1, padding: '20px 16px 80px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  )
}

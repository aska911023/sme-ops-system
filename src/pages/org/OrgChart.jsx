import { departments, employees } from '../../data/mockData'

export default function OrgChart() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">🌐</span> 組織架構</h2>
        <p>公司組織層級圖</p>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: '32px 24px' }}>
          {/* CEO Level */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-blue-dim))',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 12,
              padding: '12px 24px',
              textAlign: 'center',
              minWidth: 140,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>執行長</div>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>劉佳玲</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>財務主管</div>
            </div>
          </div>

          {/* Vertical line */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }}></div>
          </div>

          {/* Horizontal line */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <div style={{ width: '80%', height: 1, background: 'var(--border-strong)', marginTop: 0 }}></div>
          </div>

          {/* Department Level */}
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 12, flexWrap: 'wrap' }}>
            {departments.map((dept, i) => {
              const deptEmps = employees.filter(e => e.dept === dept.name && e.status === '在職')
              const colors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-pink)', 'var(--accent-yellow)', 'var(--accent-cyan)']
              const dims = ['var(--accent-blue-dim)', 'var(--accent-purple-dim)', 'var(--accent-green-dim)', 'var(--accent-pink-dim)', 'var(--accent-yellow-dim)', 'var(--accent-cyan-dim)']
              return (
                <div key={dept.id} style={{ flex: '1 1 140px', maxWidth: 180 }}>
                  {/* vertical connector */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }}></div>
                  </div>
                  <div style={{
                    background: dims[i % dims.length],
                    border: `1px solid ${colors[i % colors.length]}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    textAlign: 'center',
                    marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>部門主管</div>
                    <div style={{ fontWeight: 600, color: colors[i % colors.length], fontSize: 13 }}>{dept.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dept.head}</div>
                  </div>
                  {/* Members */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {deptEmps.filter(e => e.name !== dept.head).map(emp => (
                      <div key={emp.id} style={{
                        background: 'var(--glass-light)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        textAlign: 'center',
                        fontSize: 12,
                      }}>
                        <div style={{ fontWeight: 500 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

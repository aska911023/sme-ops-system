import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { monthlyChartData, kpiData } from '../data/mockData'

export default function Analytics() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📈</span> 營運看板</h2>
        <p>關鍵營運指標與趨勢分析</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {kpiData.slice(0, 3).map((kpi, i) => (
          <div className="stat-card" key={i} style={{
            '--card-accent': i === 0 ? 'var(--accent-cyan)' : i === 1 ? 'var(--accent-green)' : 'var(--accent-purple)',
            '--card-accent-dim': i === 0 ? 'var(--accent-cyan-dim)' : i === 1 ? 'var(--accent-green-dim)' : 'var(--accent-purple-dim)',
          }}>
            <div className="stat-card-label">{kpi.metric}</div>
            <div className="stat-card-value">{kpi.value}{kpi.unit === '%' ? '%' : ''}</div>
            <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              目標 {kpi.target}{kpi.unit}
              {kpi.trend === 'up' && <ArrowUpRight size={12} style={{ color: 'var(--accent-green)' }} />}
              {kpi.trend === 'down' && <ArrowDownRight size={12} style={{ color: 'var(--accent-red)' }} />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📊</span> 月度營收趨勢</div>
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              {monthlyChartData.map((d, i) => (
                <div key={i} className="chart-bar" style={{
                  height: `${d.value}%`,
                  background: `linear-gradient(to top, var(--accent-cyan), var(--accent-blue))`,
                  opacity: 0.6 + (i * 0.07),
                }}>
                  <span className="chart-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🎯</span> KPI 達成狀況</div>
          </div>
          <div className="card-body">
            {kpiData.map((kpi, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{kpi.metric}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.value} / {kpi.target} {kpi.unit}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                    background: kpi.value >= kpi.target
                      ? 'linear-gradient(90deg, var(--accent-green), #10b981)'
                      : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

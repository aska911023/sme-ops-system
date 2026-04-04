import { useState, useEffect } from 'react'
import { Users, CheckCircle, AlertTriangle, TrendingUp, Target } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { getEmployees, getTasks, getWorkflows, getAttendance, getLeaveRequests } from '../lib/db'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

// Chart theme helper
const chartColors = {
  cyan: '#22d3ee',
  blue: '#3b82f6',
  purple: '#a78bfa',
  green: '#34d399',
  orange: '#fb923c',
  red: '#f87171',
  pink: '#f472b6',
  yellow: '#fbbf24',
}

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 11, weight: 600 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 55, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 13, weight: 700 },
      bodyFont: { size: 12 },
    },
  },
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getEmployees(),
      getTasks(),
      getWorkflows(),
      getAttendance(),
      getLeaveRequests(),
    ]).then(([e, t, w, a, l]) => {
      setEmployees(e.data || [])
      setTasks(t.data || [])
      setWorkflows(w.data || [])
      setAttendance(a.data || [])
      setLeaves(l.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const activeEmployees = employees.filter(e => e.status === '在職').length
  const completedTasks = tasks.filter(t => t.status === '已完成').length
  const inProgressTasks = tasks.filter(t => t.status === '進行中').length
  const notStartedTasks = tasks.filter(t => t.status === '未開始').length
  const activeWorkflows = workflows.filter(w => w.active_instances > 0).length
  const workflowProgress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0
  const lateCount = attendance.filter(a => a.status === '遲到').length
  const resignedCount = employees.filter(e => e.status === '離職').length

  // ── Chart Data ──

  // Task status doughnut
  const taskDoughnutData = {
    labels: ['已完成', '進行中', '未開始'],
    datasets: [{
      data: [completedTasks, inProgressTasks, notStartedTasks],
      backgroundColor: [chartColors.green, chartColors.blue, chartColors.orange],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  // Department headcount bar chart
  const deptCounts = {}
  employees.filter(e => e.status === '在職').forEach(e => {
    deptCounts[e.dept || '未分類'] = (deptCounts[e.dept || '未分類'] || 0) + 1
  })
  const deptBarData = {
    labels: Object.keys(deptCounts),
    datasets: [{
      label: '人數',
      data: Object.values(deptCounts),
      backgroundColor: [chartColors.cyan, chartColors.blue, chartColors.purple, chartColors.green, chartColors.orange, chartColors.pink],
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 32,
    }],
  }

  // Weekly attendance trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const attendanceByDay = last7Days.map(date => {
    const dayRecords = attendance.filter(a => a.date === date)
    return {
      date,
      label: `${parseInt(date.slice(5, 7))}/${parseInt(date.slice(8))}`,
      normal: dayRecords.filter(a => a.status === '正常').length,
      late: dayRecords.filter(a => a.status === '遲到').length,
      total: dayRecords.length,
    }
  })
  const attendanceLineData = {
    labels: attendanceByDay.map(d => d.label),
    datasets: [
      {
        label: '正常出勤',
        data: attendanceByDay.map(d => d.normal),
        borderColor: chartColors.green,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.green,
      },
      {
        label: '遲到',
        data: attendanceByDay.map(d => d.late),
        borderColor: chartColors.orange,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.orange,
      },
    ],
  }

  // Leave type breakdown
  const leaveTypes = {}
  leaves.forEach(l => {
    leaveTypes[l.type || '其他'] = (leaveTypes[l.type || '其他'] || 0) + 1
  })
  const leaveColors = [chartColors.blue, chartColors.purple, chartColors.cyan, chartColors.pink, chartColors.yellow, chartColors.orange]
  const leaveDoughnutData = {
    labels: Object.keys(leaveTypes).length > 0 ? Object.keys(leaveTypes) : ['無資料'],
    datasets: [{
      data: Object.keys(leaveTypes).length > 0 ? Object.values(leaveTypes) : [1],
      backgroundColor: Object.keys(leaveTypes).length > 0 ? leaveColors.slice(0, Object.keys(leaveTypes).length) : ['rgba(148,163,184,0.2)'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? '早安' : now.getHours() < 18 ? '午安' : '晚安'
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="fade-in">
      {/* ── Hero Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(59,130,246,0.06) 50%, rgba(167,139,250,0.06) 100%)',
        border: '1px solid rgba(34,211,238,0.12)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {greeting}！👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {dateStr} — 以下是今日的營運概覽
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Mini summary pills */}
            {[
              { label: '在職', value: activeEmployees, color: 'var(--accent-cyan)' },
              { label: '任務', value: tasks.length, color: 'var(--accent-blue)' },
              { label: '完成率', value: `${workflowProgress}%`, color: 'var(--accent-green)' },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '8px 16px', borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                textAlign: 'center', minWidth: 80,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { icon: Users, label: '在職人數', value: activeEmployees, color: 'cyan', sub: `全公司 ${employees.length} 人` },
          { icon: CheckCircle, label: '今日出勤', value: activeEmployees, color: 'blue', sub: '全員到齊' },
          { icon: AlertTriangle, label: '遲到人數', value: lateCount, color: 'orange', sub: lateCount > 0 ? '需要關注' : '表現良好' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': `var(--accent-${s.color})`, '--card-accent-dim': `var(--accent-${s.color}-dim)`, padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value" style={{ fontSize: 32, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `var(--accent-${s.color}-dim)`, color: `var(--accent-${s.color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Second Row Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '進行中流程', value: activeWorkflows, color: 'cyan' },
          { label: '總任務', value: tasks.length, color: 'green' },
          { label: '進行中', value: inProgressTasks, color: 'blue' },
          { label: '已完成', value: completedTasks, color: 'green' },
          { label: '請假中', value: leaves.filter(l => l.status === '已核准').length, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': `var(--accent-${s.color})`, '--card-accent-dim': `var(--accent-${s.color}-dim)` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="progress-bar-container">
            <div className="progress-header">
              <span className="progress-label"><span>📋</span> 進行中流程</span>
              <span className="progress-value">{workflowProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${workflowProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><TrendingUp size={14} /></span> 近 7 天出勤趨勢</div>
          </div>
          <div style={{ height: 260, padding: '0 8px 8px' }}>
            <Line data={attendanceLineData} options={{ ...chartDefaults, scales: { x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 } } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><Target size={14} /></span> 任務完成狀態</div>
          </div>
          <div style={{ padding: '8px 8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 180, height: 180, position: 'relative' }}>
              <Doughnut data={taskDoughnutData} options={{ ...chartDefaults, cutout: '65%', plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{workflowProgress}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>完成率</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '14px 0 12px' }}>
              {[
                { label: '已完成', color: chartColors.green, value: completedTasks },
                { label: '進行中', color: chartColors.blue, value: inProgressTasks },
                { label: '未開始', color: chartColors.orange, value: notStartedTasks },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon"><Users size={14} /></span> 部門人數分布</div>
          </div>
          <div style={{ height: 240, padding: '0 8px 8px' }}>
            <Bar data={deptBarData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 } } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">📋</span> 請假類型分布</div>
          </div>
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px 8px' }}>
            <Doughnut data={leaveDoughnutData} options={{ ...chartDefaults, cutout: '60%', plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* ── Tasks Table ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 最近任務</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>任務</th><th>狀態</th><th>負責人</th></tr></thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{task.id}</td>
                  <td>{task.title}</td>
                  <td>
                    <span className={`badge ${task.status === '已完成' ? 'badge-success' : task.status === '進行中' ? 'badge-info' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{task.status}
                    </span>
                  </td>
                  <td>{task.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

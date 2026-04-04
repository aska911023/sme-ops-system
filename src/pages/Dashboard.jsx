import { useState, useEffect } from 'react'
import { Users, CheckCircle, AlertTriangle, Clock, FileX, RotateCcw, Activity, ListChecks, CalendarCheck, Timer } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import { Card, CardHeader, CardGrid } from '../components/ui/Card'
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📊</span> 營運儀表板</h2>
        <p>所有門市營運概覽</p>
      </div>

      {/* ── KPI Cards (Tailwind) ── */}
      <CardGrid cols={6} className="mb-4">
        <StatCard icon={Users} label="在職人數" value={activeEmployees} color="cyan" />
        <StatCard icon={CheckCircle} label="全勤" value={activeEmployees} color="blue" />
        <StatCard icon={AlertTriangle} label="遲到" value={lateCount} color="orange" />
        <StatCard icon={Clock} label="請假中" value={leaves.filter(l => l.status === '已核准').length} color="purple" />
        <StatCard icon={FileX} label="列離" value={0} color="red" />
        <StatCard icon={RotateCcw} label="離職" value={resignedCount} color="pink" />
      </CardGrid>

      {/* ── Second Row Stats (Tailwind) ── */}
      <CardGrid cols={4} className="mb-4">
        <StatCard icon={Activity} label="進行中流程" value={activeWorkflows} color="cyan" />
        <StatCard icon={ListChecks} label="總任務數" value={tasks.length} color="green" />
        <StatCard icon={Timer} label="進行中" value={inProgressTasks} color="blue" />
        <StatCard icon={CalendarCheck} label="已完成" value={completedTasks} color="green" trend="up" trendValue={`${workflowProgress}%`} />
      </CardGrid>

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
      {/* ── Charts Row 1 (Tailwind) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader icon="📈" title="近 7 天出勤趨勢" />
          <div className="h-[260px] px-2">
            <Line data={attendanceLineData} options={{ ...chartDefaults, scales: { x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 } } } }} />
          </div>
        </Card>

        <Card>
          <CardHeader icon="🎯" title="任務完成狀態" />
          <div className="flex flex-col items-center pt-2">
            <div className="relative w-[180px] h-[180px]">
              <Doughnut data={taskDoughnutData} options={{ ...chartDefaults, cutout: '65%', plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-[28px] font-extrabold text-[var(--text-primary)]">{workflowProgress}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">完成率</div>
              </div>
            </div>
            <div className="flex gap-4 py-3">
              {[
                { label: '已完成', color: chartColors.green, value: completedTasks },
                { label: '進行中', color: chartColors.blue, value: inProgressTasks },
                { label: '未開始', color: chartColors.orange, value: notStartedTasks },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[11px] text-[var(--text-secondary)]">{l.label}</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Charts Row 2 (Tailwind) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-4">
        <Card>
          <CardHeader icon="👥" title="部門人數分布" />
          <div className="h-[240px] px-2">
            <Bar data={deptBarData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 } } } }} />
          </div>
        </Card>

        <Card>
          <CardHeader icon="📋" title="請假類型分布" />
          <div className="h-[240px] flex items-center justify-center px-2">
            <Doughnut data={leaveDoughnutData} options={{ ...chartDefaults, cutout: '60%', plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }} />
          </div>
        </Card>
      </div>

      {/* ── Tasks Table (Tailwind) ── */}
      <Card padding={false}>
        <div className="px-5 pt-5 pb-3">
          <CardHeader icon="📋" title="最近任務" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>#</th><th>任務</th><th>狀態</th><th>負責人</th></tr></thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className="text-[var(--text-muted)]">{task.id}</td>
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
      </Card>
    </div>
  )
}

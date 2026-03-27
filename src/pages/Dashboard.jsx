import { useState, useEffect } from 'react'
import { Users, CheckCircle, AlertTriangle, Clock, FileX, RotateCcw } from 'lucide-react'
import { getEmployees, getTasks, getWorkflows } from '../lib/db'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEmployees(), getTasks(), getWorkflows()]).then(([e, t, w]) => {
      setEmployees(e.data || [])
      setTasks(t.data || [])
      setWorkflows(w.data || [])
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📊</span> 營運儀表板</h2>
        <p>所有門市營運概覽</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-icon"><Users size={16} /></div>
          <div className="stat-card-label">在職人數</div>
          <div className="stat-card-value">{activeEmployees}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-icon"><CheckCircle size={16} /></div>
          <div className="stat-card-label">全勤</div>
          <div className="stat-card-value">{activeEmployees}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-icon"><AlertTriangle size={16} /></div>
          <div className="stat-card-label">遲到</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-icon"><Clock size={16} /></div>
          <div className="stat-card-label">列假</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-icon"><FileX size={16} /></div>
          <div className="stat-card-label">列離</div>
          <div className="stat-card-value">0</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-pink)', '--card-accent-dim': 'var(--accent-pink-dim)' }}>
          <div className="stat-card-icon"><RotateCcw size={16} /></div>
          <div className="stat-card-label">離職</div>
          <div className="stat-card-value">{employees.filter(e => e.status === '離職').length}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {[
          { label: '進行中流程', value: activeWorkflows, color: 'cyan' },
          { label: '總任務數', value: tasks.length, color: 'green' },
          { label: '未開始', value: notStartedTasks, color: 'orange' },
          { label: '進行中', value: inProgressTasks, color: 'blue' },
          { label: '已完成', value: completedTasks, color: 'green' },
          { label: '已逾期', value: 0, color: 'red' },
          { label: '待審報告', value: 0, color: 'purple' },
          { label: '待審確認', value: 0, color: 'yellow' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ [`--card-accent`]: `var(--accent-${s.color})`, [`--card-accent-dim`]: `var(--accent-${s.color}-dim)` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

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

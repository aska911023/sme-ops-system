import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getTasks, createTask, updateTask } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', workflow: '', assignee: '', due_date: '', priority: '中' })

  useEffect(() => {
    getTasks().then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleStatusChange = async (id, status) => {
    const { data } = await updateTask(id, { status })
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const handleSubmit = async () => {
    if (!form.title) return
    const { data } = await createTask({ ...form, status: '未開始' })
    if (data) {
      setTasks(prev => [...prev, data])
      setShowModal(false)
      setForm({ title: '', workflow: '', assignee: '', due_date: '', priority: '中' })
    }
  }

  const filtered = tasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignee?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">✅</span> 任務</h2>
            <p>流程任務追蹤與管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增任務</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已完成</div>
          <div className="stat-card-value">{tasks.filter(t => t.status === '已完成').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">進行中</div>
          <div className="stat-card-value">{tasks.filter(t => t.status === '進行中').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">未開始</div>
          <div className="stat-card-value">{tasks.filter(t => t.status === '未開始').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">總計</div>
          <div className="stat-card-value">{tasks.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 任務列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋任務..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>任務名稱</th><th>所屬流程</th><th>負責人</th><th>截止日期</th><th>優先度</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{t.id}</td>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td><span className="badge badge-neutral">{t.workflow}</span></td>
                  <td>{t.assignee}</td>
                  <td>{t.due_date}</td>
                  <td>
                    <span className={`badge ${t.priority === '高' ? 'badge-danger' : t.priority === '中' ? 'badge-warning' : 'badge-neutral'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <select className="form-input" style={{ padding: '2px 8px', fontSize: 12 }} value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)}>
                      <option>未開始</option>
                      <option>進行中</option>
                      <option>已完成</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增任務" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="任務名稱 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="任務名稱" value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="所屬流程">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="流程名稱" value={form.workflow} onChange={e => set('workflow', e.target.value)} />
            </Field>
            <Field label="負責人">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="員工姓名" value={form.assignee} onChange={e => set('assignee', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="截止日期">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </Field>
            <Field label="優先度">
              <select className="form-input" style={{ width: '100%' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option>高</option>
                <option>中</option>
                <option>低</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

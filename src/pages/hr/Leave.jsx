import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const LEAVE_TYPES = ['特休', '病假', '事假', '婚假', '喪假', '公假', '產假', '陪產假']
const EMPLOYEES = ['王小明', '林美麗', '陳大偉', '張雅婷', '黃志強', '劉佳玲', '吳建宏', '蔡心怡']

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: EMPLOYEES[0], type: '特休', start_date: '', end_date: '', days: 1, reason: '' })

  useEffect(() => {
    getLeaveRequests().then(({ data }) => {
      setLeaves(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date) return
    const { data } = await createLeaveRequest({ ...form, status: '待審核', approver: '-' })
    if (data) {
      setLeaves(prev => [...prev, data])
      setShowModal(false)
      setForm({ employee: EMPLOYEES[0], type: '特休', start_date: '', end_date: '', days: 1, reason: '' })
    }
  }

  const handleApprove = async (id) => {
    const { data } = await updateLeaveStatus(id, '已核准', '劉佳玲')
    if (data) setLeaves(prev => prev.map(l => l.id === id ? data : l))
  }

  const handleReject = async (id) => {
    const { data } = await updateLeaveStatus(id, '已拒絕', '劉佳玲')
    if (data) setLeaves(prev => prev.map(l => l.id === id ? data : l))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🏖️</span> 請假管理</h2>
            <p>員工假單申請與審核</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增假單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待審核</div>
          <div className="stat-card-value">{leaves.filter(l => l.status === '待審核').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已核准</div>
          <div className="stat-card-value">{leaves.filter(l => l.status === '已核准').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">本月請假天數</div>
          <div className="stat-card-value">{leaves.reduce((s, l) => s + l.days, 0)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 假單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋..." className="form-input" style={{ paddingLeft: 38 }} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>員工</th><th>假別</th><th>開始日期</th><th>結束日期</th><th>天數</th><th>事由</th><th>狀態</th><th>審核人</th><th>操作</th></tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td>{l.employee}</td>
                  <td><span className="badge badge-cyan"><span className="badge-dot"></span>{l.type}</span></td>
                  <td>{l.start_date}</td>
                  <td>{l.end_date}</td>
                  <td>{l.days}</td>
                  <td>{l.reason}</td>
                  <td>
                    <span className={`badge ${l.status === '已核准' ? 'badge-success' : l.status === '已拒絕' ? 'badge-danger' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{l.status}
                    </span>
                  </td>
                  <td>{l.approver}</td>
                  <td>
                    {l.status === '待審核' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(l.id)}>核准</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReject(l.id)}>拒絕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增假單" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="員工">
            <select className="form-input" style={{ width: '100%' }} value={form.employee} onChange={e => set('employee', e.target.value)}>
              {EMPLOYEES.map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="假別">
            <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
              {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="開始日期">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </Field>
            <Field label="結束日期">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </Field>
          </div>
          <Field label="天數">
            <input className="form-input" type="number" min="1" style={{ width: '100%' }} value={form.days} onChange={e => set('days', Number(e.target.value))} />
          </Field>
          <Field label="事由">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="請輸入事由" value={form.reason} onChange={e => set('reason', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

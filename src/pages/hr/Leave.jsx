import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus } from '../../lib/db'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const LEAVE_TYPES = ['特休', '病假', '事假', '婚假', '喪假', '公假', '產假', '陪產假']

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [deptFilter, setDeptFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: '', type: '特休', start_date: '', end_date: '', days: 1, reason: '' })

  useEffect(() => {
    Promise.all([
      getLeaveRequests(),
      supabase.from('employees').select('id, name, department, position').eq('status', '在職').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]).then(([l, e, d]) => {
      const emps = e.data || []
      setLeaves(l.data || [])
      setEmployees(emps)
      setDepartments(d.data || [])
      setForm(f => ({ ...f, employee: emps[0]?.name || '' }))
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date || !form.employee) return
    const { data } = await createLeaveRequest({ ...form, status: '待審核', approver: '-' })
    if (data) {
      setLeaves(prev => [...prev, data])
      setShowModal(false)
      setForm({ employee: employees[0]?.name || '', type: '特休', start_date: '', end_date: '', days: 1, reason: '' })
    }
  }

  const handleApprove = async (id) => {
    const { data } = await updateLeaveStatus(id, '已核准', '主管')
    if (data) setLeaves(prev => prev.map(l => l.id === id ? data : l))
  }

  const handleReject = async (id) => {
    const { data } = await updateLeaveStatus(id, '已拒絕', '主管')
    if (data) setLeaves(prev => prev.map(l => l.id === id ? data : l))
  }

  if (loading) return <LoadingSpinner />

  const getEmpDept = (name) => employees.find(e => e.name === name)?.department || ''

  const filtered = leaves.filter(l =>
    (deptFilter === '' || getEmpDept(l.employee) === deptFilter) &&
    (search === '' || l.employee.includes(search))
  )

  const deptBtnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

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

      {/* 部門篩選 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={deptBtnStyle(deptFilter === '')} onClick={() => setDeptFilter('')}>全部部門</button>
        {departments.map(d => (
          <button key={d.id} style={deptBtnStyle(deptFilter === d.name)} onClick={() => setDeptFilter(d.name)}>{d.name}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">待審核</div>
          <div className="stat-card-value">{filtered.filter(l => l.status === '待審核').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已核准</div>
          <div className="stat-card-value">{filtered.filter(l => l.status === '已核准').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">本月請假天數</div>
          <div className="stat-card-value">{filtered.reduce((s, l) => s + (l.days || 0), 0)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 假單列表</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋員工..." className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>員工</th><th>部門</th><th>假別</th><th>開始日期</th><th>結束日期</th><th>天數</th><th>事由</th><th>狀態</th><th>審核人</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無假單</td></tr>}
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.employee}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getEmpDept(l.employee) || '-'}</td>
                  <td><span className="badge badge-info"><span className="badge-dot"></span>{l.type}</span></td>
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
          <Field label="員工 *">
            <select className="form-input" style={{ width: '100%' }} value={form.employee} onChange={e => set('employee', e.target.value)}>
              <option value="">請選擇員工</option>
              {departments.map(d => (
                <optgroup key={d.id} label={d.name}>
                  {employees.filter(e => e.department === d.name).map(e => (
                    <option key={e.id} value={e.name}>{e.name}｜{e.position}</option>
                  ))}
                </optgroup>
              ))}
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

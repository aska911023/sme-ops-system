import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getOvertimeRequests, createOvertimeRequest, updateOvertimeStatus } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const EMPLOYEES = ['王小明', '林美麗', '陳大偉', '張雅婷', '黃志強', '劉佳玲', '吳建宏', '蔡心怡']

export default function Overtime() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: EMPLOYEES[0], date: '', hours: 1, reason: '' })

  useEffect(() => {
    getOvertimeRequests().then(({ data }) => {
      setRecords(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.date) return
    const { data } = await createOvertimeRequest({ ...form, status: '待審核' })
    if (data) {
      setRecords(prev => [...prev, data])
      setShowModal(false)
      setForm({ employee: EMPLOYEES[0], date: '', hours: 1, reason: '' })
    }
  }

  const handleApprove = async (id) => {
    const { data } = await updateOvertimeStatus(id, '已核准')
    if (data) setRecords(prev => prev.map(r => r.id === id ? data : r))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🕐</span> 加班申請</h2>
            <p>加班時數申請與審核</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增加班</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 加班紀錄</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>員工</th><th>日期</th><th>時數</th><th>原因</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {records.map(o => (
                <tr key={o.id}>
                  <td>{o.employee}</td>
                  <td>{o.date}</td>
                  <td>{o.hours}h</td>
                  <td>{o.reason}</td>
                  <td>
                    <span className={`badge ${o.status === '已核准' ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === '待審核' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleApprove(o.id)}>核准</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增加班申請" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="員工">
            <select className="form-input" style={{ width: '100%' }} value={form.employee} onChange={e => set('employee', e.target.value)}>
              {EMPLOYEES.map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="加班日期">
            <input className="form-input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
          <Field label="加班時數">
            <input className="form-input" type="number" min="0.5" step="0.5" style={{ width: '100%' }} value={form.hours} onChange={e => set('hours', Number(e.target.value))} />
          </Field>
          <Field label="原因">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="請輸入加班原因" value={form.reason} onChange={e => set('reason', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

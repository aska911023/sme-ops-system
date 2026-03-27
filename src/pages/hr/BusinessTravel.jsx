import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getBusinessTrips, createBusinessTrip, updateBusinessTripStatus } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const EMPLOYEES = ['王小明', '林美麗', '陳大偉', '張雅婷', '黃志強', '劉佳玲', '吳建宏', '蔡心怡']

export default function BusinessTravel() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: EMPLOYEES[0], destination: '', start_date: '', end_date: '', purpose: '', budget: '' })

  useEffect(() => {
    getBusinessTrips().then(({ data }) => {
      setTrips(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.destination || !form.start_date) return
    const { data } = await createBusinessTrip({ ...form, budget: Number(form.budget) || 0, status: '待審核' })
    if (data) {
      setTrips(prev => [...prev, data])
      setShowModal(false)
      setForm({ employee: EMPLOYEES[0], destination: '', start_date: '', end_date: '', purpose: '', budget: '' })
    }
  }

  const handleApprove = async (id) => {
    const { data } = await updateBusinessTripStatus(id, '已核准')
    if (data) setTrips(prev => prev.map(t => t.id === id ? data : t))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">✈️</span> 公出差旅</h2>
            <p>出差申請與核准管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增差旅</button>
        </div>
      </div>
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>員工</th><th>目的地</th><th>出發日</th><th>回程日</th><th>事由</th><th>預算</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {trips.map(t => (
                <tr key={t.id}>
                  <td>{t.employee}</td>
                  <td>{t.destination}</td>
                  <td>{t.start_date}</td>
                  <td>{t.end_date}</td>
                  <td>{t.purpose}</td>
                  <td>NT$ {Number(t.budget).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${t.status === '已核准' ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{t.status}
                    </span>
                  </td>
                  <td>
                    {t.status === '待審核' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleApprove(t.id)}>核准</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增差旅申請" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="員工">
            <select className="form-input" style={{ width: '100%' }} value={form.employee} onChange={e => set('employee', e.target.value)}>
              {EMPLOYEES.map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="目的地">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：東京" value={form.destination} onChange={e => set('destination', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="出發日">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </Field>
            <Field label="回程日">
              <input className="form-input" type="date" style={{ width: '100%' }} value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </Field>
          </div>
          <Field label="事由">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：客戶拜訪" value={form.purpose} onChange={e => set('purpose', e.target.value)} />
          </Field>
          <Field label="預算 (NT$)">
            <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.budget} onChange={e => set('budget', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

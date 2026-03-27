import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getHolidays, createHoliday, deleteHoliday } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

export default function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', type: '國定假日' })

  useEffect(() => {
    getHolidays().then(({ data }) => {
      setHolidays(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.date) return
    const { data } = await createHoliday(form)
    if (data) {
      setHolidays(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setShowModal(false)
      setForm({ name: '', date: '', type: '國定假日' })
    }
  }

  const handleDelete = async (id) => {
    await deleteHoliday(id)
    setHolidays(prev => prev.filter(h => h.id !== id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🎌</span> 假日管理</h2>
            <p>國定假日與公司假日設定</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增假日</button>
        </div>
      </div>
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>名稱</th><th>日期</th><th>類型</th><th>操作</th></tr></thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td>{h.date}</td>
                  <td><span className={`badge ${h.type === '國定假日' ? 'badge-info' : 'badge-purple'}`}><span className="badge-dot"></span>{h.type}</span></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(h.id)}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增假日" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="假日名稱">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：清明節" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="日期">
            <input className="form-input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
          <Field label="類型">
            <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
              <option>國定假日</option>
              <option>公司假日</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}

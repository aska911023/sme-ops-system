import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getExpenses, createExpense, updateExpenseStatus } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const EMPLOYEES = ['王小明', '林美麗', '陳大偉', '張雅婷', '黃志強', '劉佳玲', '吳建宏', '蔡心怡']
const CATEGORIES = ['交通', '住宿', '餐飲', '設備', '其他']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee: EMPLOYEES[0], category: CATEGORIES[0], amount: '', date: '', description: '', receipt: true })

  useEffect(() => {
    getExpenses().then(({ data }) => {
      setExpenses(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.amount || !form.date) return
    const { data } = await createExpense({ ...form, amount: Number(form.amount), status: '待審核' })
    if (data) {
      setExpenses(prev => [...prev, data])
      setShowModal(false)
      setForm({ employee: EMPLOYEES[0], category: CATEGORIES[0], amount: '', date: '', description: '', receipt: true })
    }
  }

  const handleApprove = async (id) => {
    const { data } = await updateExpenseStatus(id, '已核銷')
    if (data) setExpenses(prev => prev.map(e => e.id === id ? data : e))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🧾</span> 費用核銷</h2>
            <p>報銷申請與審核</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增報銷</button>
        </div>
      </div>
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>員工</th><th>類別</th><th>金額</th><th>日期</th><th>說明</th><th>收據</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td>{e.employee}</td>
                  <td><span className="badge badge-info">{e.category}</span></td>
                  <td style={{ fontWeight: 600 }}>NT$ {Number(e.amount).toLocaleString()}</td>
                  <td>{e.date}</td>
                  <td>{e.description}</td>
                  <td>{e.receipt ? <span className="badge badge-success">✓ 有</span> : <span className="badge badge-danger">✗ 無</span>}</td>
                  <td>
                    <span className={`badge ${e.status === '已核銷' ? 'badge-success' : 'badge-warning'}`}>
                      <span className="badge-dot"></span>{e.status}
                    </span>
                  </td>
                  <td>
                    {e.status === '待審核' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleApprove(e.id)}>核銷</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增報銷申請" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="員工">
            <select className="form-input" style={{ width: '100%' }} value={form.employee} onChange={e => set('employee', e.target.value)}>
              {EMPLOYEES.map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="類別">
              <select className="form-input" style={{ width: '100%' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="金額 (NT$)">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </Field>
          </div>
          <Field label="日期">
            <input className="form-input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
          <Field label="說明">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="費用說明" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
          <Field label="收據">
            <select className="form-input" style={{ width: '100%' }} value={form.receipt} onChange={e => set('receipt', e.target.value === 'true')}>
              <option value="true">有收據</option>
              <option value="false">無收據</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}

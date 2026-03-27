import { useState, useEffect } from 'react'
import { Plus, Play, Pause } from 'lucide-react'
import { getWorkflows, createWorkflow, updateWorkflow } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const CATEGORIES = ['HR', '財務', '業務', '行政', '研發', '客服']

export default function Workflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], steps: '', description: '' })

  useEffect(() => {
    getWorkflows().then(({ data }) => { setWorkflows(data || []); setLoading(false) })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleStatus = async (w) => {
    const newStatus = w.status === '已啟用' ? '已停用' : '已啟用'
    const { data } = await updateWorkflow(w.id, { status: newStatus })
    if (data) setWorkflows(prev => prev.map(x => x.id === w.id ? data : x))
  }

  const handleSubmit = async () => {
    if (!form.name) return
    const { data } = await createWorkflow({
      name: form.name,
      category: form.category,
      steps: Number(form.steps) || 1,
      description: form.description,
      status: '草稿',
      active_instances: 0,
    })
    if (data) {
      setWorkflows(prev => [...prev, data])
      setShowModal(false)
      setForm({ name: '', category: CATEGORIES[0], steps: '', description: '' })
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🔄</span> 流程</h2>
            <p>標準作業流程設計與管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增流程</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已啟用</div>
          <div className="stat-card-value">{workflows.filter(w => w.status === '已啟用').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">執行中實例</div>
          <div className="stat-card-value">{workflows.reduce((s, w) => s + (w.active_instances || 0), 0)}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">草稿</div>
          <div className="stat-card-value">{workflows.filter(w => w.status === '草稿').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>流程名稱</th><th>分類</th><th>步驟數</th><th>執行中</th><th>說明</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {workflows.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600 }}>{w.name}</td>
                  <td><span className="badge badge-cyan">{w.category}</span></td>
                  <td>{w.steps}</td>
                  <td style={{ fontWeight: 600, color: w.active_instances > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{w.active_instances}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{w.description}</td>
                  <td><span className={`badge ${w.status === '已啟用' ? 'badge-success' : 'badge-warning'}`}><span className="badge-dot"></span>{w.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(w)}>
                      {w.status === '已啟用' ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增流程" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="流程名稱 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：請假審核流程" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="分類">
              <select className="form-input" style={{ width: '100%' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="步驟數">
              <input className="form-input" type="number" style={{ width: '100%' }} placeholder="1" min="1" value={form.steps} onChange={e => set('steps', e.target.value)} />
            </Field>
          </div>
          <Field label="說明">
            <textarea className="form-input" style={{ width: '100%', height: 80, resize: 'vertical' }} placeholder="流程說明" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

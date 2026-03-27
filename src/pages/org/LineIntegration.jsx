import { useState } from 'react'
import { MessageCircle, Settings } from 'lucide-react'
import Modal, { Field } from '../../components/Modal'

const TYPES = ['Notify', 'Messaging API']

const initialChannels = [
  { id: 1, name: '台北總部通知頻道', type: 'Notify', status: '已連接', lastMessage: '2026-03-27 09:10', members: 5 },
  { id: 2, name: '主管審批群組', type: 'Messaging API', status: '已連接', lastMessage: '2026-03-26 16:45', members: 3 },
  { id: 3, name: '人資公告頻道', type: 'Notify', status: '已連接', lastMessage: '2026-03-25 12:00', members: 9 },
  { id: 4, name: '高雄分店頻道', type: 'Notify', status: '未連接', lastMessage: '-', members: 1 },
]

export default function LineIntegration() {
  const [channels, setChannels] = useState(initialChannels)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: TYPES[0], token: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name) return
    setChannels(prev => [...prev, { id: Date.now(), name: form.name, type: form.type, status: '未連接', lastMessage: '-', members: 0 }])
    setShowModal(false)
    setForm({ name: '', type: TYPES[0], token: '' })
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">💬</span> LINE 整合</h2>
            <p>LINE Notify 與 Messaging API 設定</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><MessageCircle size={14} /> 新增頻道</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已連接</div>
          <div className="stat-card-value">{channels.filter(c => c.status === '已連接').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">未連接</div>
          <div className="stat-card-value">{channels.filter(c => c.status === '未連接').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">覆蓋人數</div>
          <div className="stat-card-value">{channels.filter(c => c.status === '已連接').reduce((s, c) => s + c.members, 0)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 頻道列表</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>頻道名稱</th><th>類型</th><th>成員數</th><th>最後訊息</th><th>狀態</th><th>設定</th></tr>
            </thead>
            <tbody>
              {channels.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className="badge badge-cyan">{c.type}</span></td>
                  <td>{c.members}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.lastMessage}</td>
                  <td>
                    <span className={`badge ${c.status === '已連接' ? 'badge-success' : 'badge-danger'}`}>
                      <span className="badge-dot"></span>{c.status}
                    </span>
                  </td>
                  <td><button className="btn btn-sm btn-secondary"><Settings size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增 LINE 頻道" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="頻道名稱 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：台中分店通知頻道" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="類型">
            <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Access Token">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="LINE Notify Token 或 Channel Access Token" value={form.token} onChange={e => set('token', e.target.value)} />
          </Field>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--glass-light)', padding: '8px 10px', borderRadius: 6 }}>
            Token 可至 LINE Developers Console 或 LINE Notify 網站取得
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Modal, { Field } from '../../components/Modal'

const LABOR_RULES = [
  {
    id: 1, icon: '⏱️', title: '正常工時',
    rule: '每日不得超過 8 小時，每週不得超過 40 小時',
    law: '勞基法第 30 條',
    color: 'var(--accent-cyan)',
  },
  {
    id: 2, icon: '💰', title: '加班費規定',
    rule: '延長工時前 2 小時：加給 1/3 以上；再延長 2 小時：加給 2/3 以上；休息日加班：前 2 小時加給 1/3，後每小時加給 2/3',
    law: '勞基法第 24 條',
    color: 'var(--accent-orange)',
  },
  {
    id: 3, icon: '🛑', title: '每日最低休息',
    rule: '每日工作完畢後，應有連續 11 小時以上之休息時間',
    law: '勞基法第 35-1 條',
    color: 'var(--accent-purple)',
  },
  {
    id: 4, icon: '📅', title: '例假與休假',
    rule: '每 7 日中應有 2 日休假（1 例假 + 1 休息日）；例假不得強制出勤',
    law: '勞基法第 36 條',
    color: 'var(--accent-green)',
  },
  {
    id: 5, icon: '📊', title: '每月加班上限',
    rule: '每月加班時數不得超過 46 小時，每 3 個月不得超過 138 小時',
    law: '勞基法第 32 條',
    color: 'var(--accent-red)',
  },
  {
    id: 6, icon: '🏖️', title: '特休假',
    rule: '6 個月～1 年：3 天｜1～2 年：7 天｜2～3 年：10 天｜3～5 年：14 天｜5～10 年：15 天｜10 年以上：每年 +1 天（最多 30 天）',
    law: '勞基法第 38 條',
    color: 'var(--accent-yellow)',
  },
  {
    id: 7, icon: '💵', title: '最低基本工資',
    rule: '月薪最低 NT$ 27,470 元（2024 年），時薪最低 NT$ 183 元',
    law: '基本工資審議辦法',
    color: 'var(--accent-cyan)',
  },
  {
    id: 8, icon: '🤱', title: '產假 / 陪產假',
    rule: '產假：8 週（任職 6 個月以上全薪，未滿 6 個月半薪）；陪產假：7 天（全薪）；流產假：1～5 週',
    law: '勞基法第 50 條、性平法第 15 條',
    color: 'var(--accent-purple)',
  },
]

const initialRules = [
  { id: 1, name: '標準班', hours: '09:00-18:00', breakTime: '12:00-13:00', lateThreshold: '09:05', type: '固定班' },
  { id: 2, name: '早班', hours: '08:00-17:00', breakTime: '12:00-13:00', lateThreshold: '08:05', type: '固定班' },
  { id: 3, name: '晚班', hours: '10:00-19:00', breakTime: '13:00-14:00', lateThreshold: '10:05', type: '固定班' },
  { id: 4, name: '彈性班', hours: '08:00-10:00 彈性', breakTime: '自由安排', lateThreshold: '10:00', type: '彈性班' },
]

export default function ScheduleRules() {
  const [rules, setRules] = useState(initialRules)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', hours: '', breakTime: '', lateThreshold: '', type: '固定班' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name || !form.hours) return
    const newRule = { id: Date.now(), ...form }
    setRules(prev => [...prev, newRule])
    setShowModal(false)
    setForm({ name: '', hours: '', breakTime: '', lateThreshold: '', type: '固定班' })
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">⚙️</span> 排班規則</h2>
            <p>班別設定與出勤規則管理</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增班別</button>
        </div>
      </div>

      {/* 班別設定 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🕐</span> 班別設定</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>班別名稱</th><th>工作時間</th><th>休息時間</th><th>遲到門檻</th><th>類型</th></tr></thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.hours}</td>
                  <td>{r.breakTime}</td>
                  <td>{r.lateThreshold}</td>
                  <td><span className={`badge ${r.type === '固定班' ? 'badge-info' : 'badge-purple'}`}>{r.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 勞基法規範 */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">⚖️</span> 勞基法合規規範</div>
          <span className="badge badge-success"><span className="badge-dot"></span>依法保障員工權益</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
          {LABOR_RULES.map(r => (
            <div key={r.id} style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'var(--bg-primary)', border: `1px solid var(--border-subtle)`,
              borderLeft: `3px solid ${r.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--glass-light)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                  {r.law}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.rule}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <Modal title="新增班別" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="班別名稱 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：夜班" value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="類型">
              <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
                <option>固定班</option>
                <option>彈性班</option>
                <option>輪班</option>
              </select>
            </Field>
          </div>
          <Field label="工作時間 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：22:00-06:00" value={form.hours} onChange={e => set('hours', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="休息時間">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：02:00-02:30" value={form.breakTime} onChange={e => set('breakTime', e.target.value)} />
            </Field>
            <Field label="遲到門檻">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：22:05" value={form.lateThreshold} onChange={e => set('lateThreshold', e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { getHolidays, createHoliday, deleteHoliday } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

// 台灣完整國定假日 (template)
const TW_HOLIDAYS = (year) => [
  { name: '元旦', date: `${year}-01-01`, type: '國定假日' },
  { name: '農曆除夕', date: `${year}-01-28`, type: '國定假日' },
  { name: '春節初一', date: `${year}-01-29`, type: '國定假日' },
  { name: '春節初二', date: `${year}-01-30`, type: '國定假日' },
  { name: '春節初三', date: `${year}-01-31`, type: '國定假日' },
  { name: '二二八和平紀念日', date: `${year}-02-28`, type: '國定假日' },
  { name: '兒童節', date: `${year}-04-04`, type: '國定假日' },
  { name: '清明節', date: `${year}-04-05`, type: '國定假日' },
  { name: '勞動節', date: `${year}-05-01`, type: '國定假日' },
  { name: '端午節', date: `${year}-05-31`, type: '國定假日' },
  { name: '中秋節', date: `${year}-10-06`, type: '國定假日' },
  { name: '國慶日', date: `${year}-10-10`, type: '國定假日' },
]

export default function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', type: '國定假日' })
  const [year, setYear] = useState(new Date().getFullYear())
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    getHolidays().then(({ data }) => {
      setHolidays((data || []).sort((a, b) => a.date.localeCompare(b.date)))
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

  // 一鍵匯入整年假日
  const handleSeedYear = async (targetYear) => {
    setSeeding(true)
    const template = TW_HOLIDAYS(targetYear)
    const existing = holidays.map(h => h.date)
    let added = 0
    for (const h of template) {
      if (!existing.includes(h.date)) {
        const { data } = await createHoliday(h)
        if (data) {
          setHolidays(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
          added++
        }
      }
    }
    setSeeding(false)
    alert(`已匯入 ${added} 個 ${targetYear} 年假日${added === 0 ? '（全部已存在）' : ''}`)
  }

  if (loading) return <LoadingSpinner />

  const filteredByYear = holidays.filter(h => h.date?.startsWith(String(year)))
  const years = [...new Set(holidays.map(h => h.date?.slice(0, 4)).filter(Boolean))].sort()
  if (!years.includes(String(year))) years.push(String(year))
  years.sort()

  const now = new Date().toISOString().slice(0, 10)
  const upcoming = filteredByYear.filter(h => h.date >= now)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">🎌</span> 假日管理</h2>
            <p>國定假日與公司假日設定</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => handleSeedYear(year)} disabled={seeding}
              style={{ width: 'auto', padding: '8px 14px' }}>
              <Zap size={14} /> {seeding ? '匯入中...' : `一鍵匯入 ${year} 年`}
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto' }}>
              <Plus size={14} /> 新增假日
            </button>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setYear(y => y - 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, minWidth: 60, textAlign: 'center' }}>{year}</div>
        <button onClick={() => setYear(y => y + 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <ChevronRight size={16} />
        </button>
        {years.map(y => (
          <button key={y} onClick={() => setYear(Number(y))} style={{
            padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
            background: year === Number(y) ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: year === Number(y) ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}>{y}</button>
        ))}
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">{year} 年假日</div>
          <div className="stat-card-value">{filteredByYear.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">國定假日</div>
          <div className="stat-card-value">{filteredByYear.filter(h => h.type === '國定假日').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">公司假日</div>
          <div className="stat-card-value">{filteredByYear.filter(h => h.type === '公司假日').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">即將到來</div>
          <div className="stat-card-value">{upcoming.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> {year} 年假日列表</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredByYear.length} 個假日</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>名稱</th><th>日期</th><th>星期</th><th>類型</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {filteredByYear.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                  {year} 年尚無假日資料<br />
                  <span style={{ fontSize: 12 }}>點擊「一鍵匯入」快速建立</span>
                </td></tr>
              )}
              {filteredByYear.map(h => {
                const d = new Date(h.date)
                const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
                const isPast = h.date < now
                return (
                  <tr key={h.id} style={{ opacity: isPast ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td>{h.date}</td>
                    <td>週{weekday}</td>
                    <td>
                      <span className={`badge ${h.type === '國定假日' ? 'badge-info' : 'badge-purple'}`}>
                        <span className="badge-dot"></span>{h.type}
                      </span>
                    </td>
                    <td>
                      {isPast ? (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>已過</span>
                      ) : (
                        <span className="badge badge-success"><span className="badge-dot"></span>即將到來</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => handleDelete(h.id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增假日" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <Field label="假日名稱 *">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：春酒" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="日期 *">
            <input className="form-input" type="date" style={{ width: '100%' }} value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
          <Field label="類型">
            <select className="form-input" style={{ width: '100%' }} value={form.type} onChange={e => set('type', e.target.value)}>
              <option>國定假日</option>
              <option>公司假日</option>
              <option>補班日</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  )
}

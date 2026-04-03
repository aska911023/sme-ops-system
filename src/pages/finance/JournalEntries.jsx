import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react'
import { getJournalEntries, getJournalLines, createJournalEntry, createJournalLine } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const emptyForm = {
  entry_number: '', entry_date: new Date().toISOString().slice(0, 10),
  description: '', source: '', status: '草稿', created_by: ''
}

export default function JournalEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [lines, setLines] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    getJournalEntries().then(({ data }) => {
      setEntries(data || [])
      setLoading(false)
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!lines[id]) {
      const { data } = await getJournalLines(id)
      setLines(prev => ({ ...prev, [id]: data || [] }))
    }
  }

  const handleSubmit = async () => {
    if (!form.entry_number) return
    const { data } = await createJournalEntry(form)
    if (data) { setEntries(prev => [data, ...prev]); setShowModal(false); setForm(emptyForm) }
  }

  if (loading) return <LoadingSpinner />

  const totalEntries = entries.length
  const posted = entries.filter(e => e.status === '已過帳').length
  const drafts = entries.filter(e => e.status === '草稿').length

  const statusBadge = (status) => {
    if (status === '已過帳') return <span className="badge badge-success"><span className="badge-dot"></span>{status}</span>
    if (status === '草稿') return <span className="badge badge-warning"><span className="badge-dot"></span>{status}</span>
    return <span className="badge badge-info"><span className="badge-dot"></span>{status}</span>
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📒</span> 傳票管理</h2>
            <p>會計傳票與分錄管理</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增傳票</button>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">總傳票數</div>
          <div className="stat-card-value">{totalEntries}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">已過帳</div>
          <div className="stat-card-value">{posted}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">草稿</div>
          <div className="stat-card-value">{drafts}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 傳票列表</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>點擊列展開分錄明細</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>傳票編號</th>
                <th>日期</th>
                <th>說明</th>
                <th>來源</th>
                <th>狀態</th>
                <th>建立者</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無傳票資料</td></tr>}
              {entries.map(e => {
                const isExpanded = expanded === e.id
                const entryLines = lines[e.id] || []
                return (
                  <>
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(e.id)}>
                      <td style={{ width: 32 }}>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                      <td style={{ fontWeight: 600 }}>{e.entry_number}</td>
                      <td>{e.entry_date}</td>
                      <td>{e.description || '-'}</td>
                      <td>{e.source || '-'}</td>
                      <td>{statusBadge(e.status)}</td>
                      <td>{e.created_by || '-'}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${e.id}-lines`}>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div style={{ background: 'var(--glass-light)', padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📐 分錄明細</div>
                            {entryLines.length === 0 ? (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>尚無分錄</div>
                            ) : (
                              <table className="data-table" style={{ fontSize: 13 }}>
                                <thead>
                                  <tr>
                                    <th>科目代碼</th>
                                    <th>科目名稱</th>
                                    <th>摘要</th>
                                    <th style={{ textAlign: 'right', color: 'var(--accent-green)' }}>借方</th>
                                    <th style={{ textAlign: 'right', color: 'var(--accent-red)' }}>貸方</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entryLines.map(l => (
                                    <tr key={l.id}>
                                      <td>{l.account_code || '-'}</td>
                                      <td>{l.account_name || '-'}</td>
                                      <td>{l.description || '-'}</td>
                                      <td style={{ textAlign: 'right', color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {(Number(l.debit) || 0) > 0 ? `NT$ ${Number(l.debit).toLocaleString()}` : ''}
                                      </td>
                                      <td style={{ textAlign: 'right', color: 'var(--accent-red)', fontWeight: 600 }}>
                                        {(Number(l.credit) || 0) > 0 ? `NT$ ${Number(l.credit).toLocaleString()}` : ''}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border-medium)' }}>
                                    <td colSpan={3} style={{ textAlign: 'right' }}>合計</td>
                                    <td style={{ textAlign: 'right', color: 'var(--accent-green)' }}>
                                      NT$ {entryLines.reduce((s, l) => s + (Number(l.debit) || 0), 0).toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: 'right', color: 'var(--accent-red)' }}>
                                      NT$ {entryLines.reduce((s, l) => s + (Number(l.credit) || 0), 0).toLocaleString()}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="新增傳票" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="傳票編號 *"><input className="form-input" style={{ width: '100%' }} value={form.entry_number} onChange={e => set('entry_number', e.target.value)} placeholder="JE-2026-001" /></Field>
            <Field label="日期"><input className="form-input" type="date" style={{ width: '100%' }} value={form.entry_date} onChange={e => set('entry_date', e.target.value)} /></Field>
          </div>
          <Field label="說明"><input className="form-input" style={{ width: '100%' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="傳票說明" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="來源"><input className="form-input" style={{ width: '100%' }} value={form.source} onChange={e => set('source', e.target.value)} placeholder="例：銷售、採購" /></Field>
            <Field label="狀態">
              <select className="form-input" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="草稿">草稿</option>
                <option value="已過帳">已過帳</option>
              </select>
            </Field>
            <Field label="建立者"><input className="form-input" style={{ width: '100%' }} value={form.created_by} onChange={e => set('created_by', e.target.value)} placeholder="姓名" /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { getSalaryRecords } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Salary() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSalaryRecords().then(({ data }) => {
      setRecords(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const total = records.reduce((s, r) => s + r.net_salary, 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">💰</span> 薪資管理</h2>
            <p>員工薪資計算與發放管理</p>
          </div>
          <button className="btn btn-secondary"><Download size={14} /> 匯出薪資單</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">本月薪資總額</div>
          <div className="stat-card-value">NT$ {total.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">人數</div>
          <div className="stat-card-value">{records.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-blue)', '--card-accent-dim': 'var(--accent-blue-dim)' }}>
          <div className="stat-card-label">平均薪資</div>
          <div className="stat-card-value">NT$ {records.length ? Math.round(total / records.length).toLocaleString() : 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 薪資明細</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>員工</th><th>底薪</th><th>津貼</th><th>加班費</th><th>扣款</th><th>勞健保</th><th>實發薪資</th></tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.employee}</td>
                  <td>NT$ {r.base_salary.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-green)' }}>+{r.allowance.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-cyan)' }}>+{r.overtime.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-red)' }}>-{r.deductions.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-orange)' }}>-{r.insurance.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>NT$ {r.net_salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

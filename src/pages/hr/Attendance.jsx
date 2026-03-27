import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { getAttendance } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttendance().then(({ data }) => {
      setRecords(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const avgHours = records.filter(r => r.hours > 0).reduce((s, r) => s + Number(r.hours), 0) /
    (records.filter(r => r.hours > 0).length || 1)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">⏰</span> 打卡追蹤</h2>
            <p>員工每日出缺勤即時追蹤</p>
          </div>
          <button className="btn btn-secondary"><Download size={14} /> 匯出</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">正常</div>
          <div className="stat-card-value">{records.filter(r => r.status === '正常').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-orange)', '--card-accent-dim': 'var(--accent-orange-dim)' }}>
          <div className="stat-card-label">遲到</div>
          <div className="stat-card-value">{records.filter(r => r.status === '遲到').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-red)', '--card-accent-dim': 'var(--accent-red-dim)' }}>
          <div className="stat-card-label">未打卡</div>
          <div className="stat-card-value">{records.filter(r => r.status === '未打卡').length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">平均工時</div>
          <div className="stat-card-value">{avgHours.toFixed(1)}h</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 出勤紀錄</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋員工..." className="form-input" style={{ paddingLeft: 38 }} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>員工</th><th>日期</th><th>上班打卡</th><th>下班打卡</th><th>工時</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.employee}</td>
                  <td>{r.date}</td>
                  <td>{r.clock_in || '-'}</td>
                  <td>{r.clock_out || '-'}</td>
                  <td>{r.hours > 0 ? `${r.hours}h` : '-'}</td>
                  <td>
                    <span className={`badge ${r.status === '正常' ? 'badge-success' : r.status === '遲到' ? 'badge-warning' : 'badge-danger'}`}>
                      <span className="badge-dot"></span>{r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

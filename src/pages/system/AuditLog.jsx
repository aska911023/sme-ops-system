import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { getAuditLogs } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs().then(({ data }) => {
      setLogs(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const formatTime = (ts) => ts ? new Date(ts).toLocaleString('zh-TW') : '-'

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📜</span> 操作紀錄</h2>
            <p>系統操作稽核日誌</p>
          </div>
          <button className="btn btn-secondary"><Download size={14} /> 匯出紀錄</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🔍</span> 稽核日誌</div>
          <div className="search-bar">
            <Search className="search-icon" />
            <input type="text" placeholder="搜尋操作..." className="form-input" style={{ paddingLeft: 38 }} />
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>操作者</th><th>動作</th><th>操作對象</th><th>時間</th><th>IP 位址</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{log.id}</td>
                  <td style={{ fontWeight: 600 }}>{log.user}</td>
                  <td><span className="badge badge-cyan">{log.action}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.target}</td>
                  <td style={{ fontSize: 12 }}>{formatTime(log.time)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

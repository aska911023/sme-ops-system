import { Calendar } from 'lucide-react'
import { scheduleData } from '../../data/mockData'

export default function Schedule() {
  const dayHeaders = ['一', '二', '三', '四', '五', '六', '日']
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📅</span> 排班</h2>
        <p>員工每週排班表</p>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📋</span> 本週排班表（2026/03/23 - 03/29）</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>員工</th>
                {dayHeaders.map(d => <th key={d}>週{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map(s => (
                <tr key={s.id}>
                  <td>{s.employee}</td>
                  <td><span className={`badge ${s.mon === '休' ? 'badge-neutral' : 'badge-cyan'}`}>{s.mon}</span></td>
                  <td><span className={`badge ${s.tue === '休' ? 'badge-neutral' : 'badge-cyan'}`}>{s.tue}</span></td>
                  <td><span className={`badge ${s.wed === '休' ? 'badge-neutral' : 'badge-cyan'}`}>{s.wed}</span></td>
                  <td><span className={`badge ${s.thu === '休' ? 'badge-neutral' : 'badge-cyan'}`}>{s.thu}</span></td>
                  <td><span className={`badge ${s.fri === '休' ? 'badge-neutral' : 'badge-cyan'}`}>{s.fri}</span></td>
                  <td><span className={`badge ${s.sat === '休' ? 'badge-neutral' : s.sat === '輪值' ? 'badge-purple' : 'badge-info'}`}>{s.sat}</span></td>
                  <td><span className={`badge ${s.sun === '休' ? 'badge-neutral' : 'badge-info'}`}>{s.sun}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

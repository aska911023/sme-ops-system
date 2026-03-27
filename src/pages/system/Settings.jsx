import { Settings, Save } from 'lucide-react'

export default function SystemSettings() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">⚙️</span> 系統設定</h2>
            <p>全域系統參數設定</p>
          </div>
          <button className="btn btn-primary"><Save size={14} /> 儲存設定</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🏢</span> 公司資訊</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '公司名稱', value: 'Master AI 科技有限公司' },
              { label: '統一編號', value: '12345678' },
              { label: '電話', value: '02-2345-6789' },
              { label: '地址', value: '台北市信義區信義路五段7號' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input className="form-input" defaultValue={f.value} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">⏰</span> 出勤設定</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '標準上班時間', value: '09:00' },
              { label: '標準下班時間', value: '18:00' },
              { label: '遲到門檻（分鐘）', value: '5' },
              { label: '休息時間', value: '12:00 - 13:00' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input className="form-input" defaultValue={f.value} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🔔</span> 通知設定</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '遲到自動通知', on: true },
              { label: '請假待審提醒', on: true },
              { label: '任務逾期通知', on: true },
              { label: '薪資核發通知', on: false },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>{f.label}</span>
                <div style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: f.on ? 'var(--accent-cyan)' : 'var(--border-strong)',
                  position: 'relative', cursor: 'pointer', transition: 'background var(--transition-fast)',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: f.on ? 21 : 3,
                    transition: 'left var(--transition-fast)',
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">🌐</span> 語系與時區</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '預設語系', value: '繁體中文 (zh-TW)' },
              { label: '時區', value: 'Asia/Taipei (GMT+8)' },
              { label: '日期格式', value: 'YYYY-MM-DD' },
              { label: '貨幣', value: 'TWD (NT$)' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input className="form-input" defaultValue={f.value} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

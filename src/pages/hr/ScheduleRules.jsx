import { useState } from 'react'
import { Plus, ExternalLink, Search, Filter } from 'lucide-react'
import { LABOR_STANDARDS, GENDER_EQUALITY, OCCUPATIONAL_SAFETY } from '../../lib/laborLaw'
import Modal, { Field } from '../../components/Modal'

// ══════════════════════════════════════
//  Complete labor law rule database
// ══════════════════════════════════════

const ALL_RULES = [
  // ── 勞基法：工時 ──
  { law: '勞基法', cat: '工時', icon: '⏱️', rule: '每日正常工時', content: '≤ 8 小時/天', article: 'Art. 30 §1' },
  { law: '勞基法', cat: '工時', icon: '⏱️', rule: '每週正常工時', content: '≤ 40 小時/週', article: 'Art. 30 §1' },
  { law: '勞基法', cat: '工時', icon: '⏱️', rule: '二週彈性工時', content: '可跨兩週分配，每週 ≤ 48小時，每日最多 +2小時', article: 'Art. 30 §2' },
  { law: '勞基法', cat: '工時', icon: '⏱️', rule: '每日上限（含加班）', content: '≤ 12 小時/天', article: 'Art. 32 §2' },
  { law: '勞基法', cat: '工時', icon: '⏱️', rule: '出勤紀錄保存', content: '須保存 5 年', article: 'Art. 30 §6' },

  // ── 勞基法：加班 ──
  { law: '勞基法', cat: '加班', icon: '📈', rule: '每月加班上限', content: '≤ 46 小時/月', article: 'Art. 32 §2' },
  { law: '勞基法', cat: '加班', icon: '📈', rule: '延長加班上限', content: '≤ 54時/月、≤ 138時/3月（需勞資會議同意）', article: 'Art. 32 §3' },
  { law: '勞基法', cat: '加班', icon: '📈', rule: '超過30人報備', content: '須向地方主管機關報備', article: 'Art. 32 §3' },

  // ── 勞基法：加班費 ──
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '平日加班前2小時', content: '時薪 × 1⅓（加給⅓以上）', article: 'Art. 24 §1' },
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '平日加班第3-4小時', content: '時薪 × 1⅔（加給⅔以上）', article: 'Art. 24 §1' },
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '休息日加班前2小時', content: '時薪 × 1⅓', article: 'Art. 24 §2' },
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '休息日加班3-8小時', content: '時薪 × 1⅔', article: 'Art. 24 §2' },
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '休息日加班9-12小時', content: '時薪 × 2⅔', article: 'Art. 24 §2' },
  { law: '勞基法', cat: '加班費', icon: '💰', rule: '例假日出勤', content: '加倍工資（非天災事變不得要求）', article: 'Art. 39' },

  // ── 勞基法：休息與休假 ──
  { law: '勞基法', cat: '休息與休假', icon: '🏖️', rule: '每4小時休息', content: '繼續工作4小時，至少休息30分鐘', article: 'Art. 35' },
  { law: '勞基法', cat: '休息與休假', icon: '🏖️', rule: '每週例假', content: '每7日至少1日例假（不可加班）', article: 'Art. 36 §1' },
  { law: '勞基法', cat: '休息與休假', icon: '🏖️', rule: '每週休息日', content: '每7日至少1日休息日（可加班但須付加班費）', article: 'Art. 36 §1' },
  { law: '勞基法', cat: '休息與休假', icon: '🏖️', rule: '連續工作上限', content: '不得連續工作超過6日', article: 'Art. 36' },

  // ── 勞基法：輪班 ──
  { law: '勞基法', cat: '輪班', icon: '🔄', rule: '輪班間隔', content: '更換班次至少間隔 11 小時', article: 'Art. 34 §1' },
  { law: '勞基法', cat: '輪班', icon: '🔄', rule: '輪班間隔（經同意）', content: '經工會同意可縮短為 8 小時', article: 'Art. 34 §2' },
  { law: '勞基法', cat: '輪班', icon: '🔄', rule: '夜間工作（女性）', content: '22:00-06:00 限制，需安全衛生措施+交通', article: 'Art. 49' },

  // ── 勞基法：特別休假 ──
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '6個月~1年', content: '3 天特休', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '1~2年', content: '7 天特休', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '2~3年', content: '10 天特休', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '3~5年', content: '14 天特休', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '5~10年', content: '15 天特休', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '10年以上', content: '每年 +1 天，最多 30 天', article: 'Art. 38 §1' },
  { law: '勞基法', cat: '特別休假', icon: '🌴', rule: '未休結清', content: '週年未休完應折算工資（次月薪資發放時結清）', article: 'Art. 38 §4' },

  // ── 勞基法：國定假日 ──
  { law: '勞基法', cat: '國定假日', icon: '🎌', rule: '國定假日出勤', content: '應加倍發給工資', article: 'Art. 37, 39' },
  { law: '勞基法', cat: '國定假日', icon: '🎌', rule: '2026年國定假日', content: '元旦、春節5天、和平紀念日、兒童節、清明、勞動節、端午、中秋、國慶共12天', article: 'Art. 37' },

  // ── 性平法 ──
  { law: '性平法', cat: '產假保護', icon: '🤱', rule: '產假（分娩）', content: '8 週，任職滿6個月全薪、未滿半薪', article: 'Art. 15 §1' },
  { law: '性平法', cat: '產假保護', icon: '🤱', rule: '流產假', content: '3個月以上：4週｜2-3個月：1週｜未滿2個月：5天', article: 'Art. 15 §1' },
  { law: '性平法', cat: '產假保護', icon: '🤱', rule: '產假期間不得排班', content: '產假期間雇主不得安排工作', article: 'Art. 15' },
  { law: '性平法', cat: '陪產與育兒', icon: '👨‍👩‍👦', rule: '陪產檢及陪產假', content: '7 天，照給工資', article: 'Art. 15 §5' },
  { law: '性平法', cat: '陪產與育兒', icon: '👨‍👩‍👦', rule: '產檢假', content: '7 天，照給工資', article: 'Art. 15 §4' },
  { law: '性平法', cat: '陪產與育兒', icon: '👨‍👩‍👦', rule: '育嬰留職停薪', content: '子女滿3歲前，最長2年。津貼：投保薪資80%（最長6個月）', article: 'Art. 16' },
  { law: '性平法', cat: '陪產與育兒', icon: '👨‍👩‍👦', rule: '育兒減少工時', content: '30人以上企業，撫育未滿3歲子女可每日減少1小時', article: 'Art. 19' },
  { law: '性平法', cat: '生理與哺乳', icon: '🩺', rule: '生理假', content: '每月1天，減半發給。超過病假30天部分減半', article: 'Art. 14' },
  { law: '性平法', cat: '生理與哺乳', icon: '🩺', rule: '哺乳時間', content: '子女未滿2歲，每日60分鐘（2次各30分），視為工作時間', article: 'Art. 18' },
  { law: '性平法', cat: '家庭照顧', icon: '🏠', rule: '家庭照顧假', content: '全年7天，不給薪（併入事假計算）', article: 'Art. 20' },
  { law: '性平法', cat: '家庭照顧', icon: '🏠', rule: '禁止不利對待', content: '請假不得影響全勤獎金、考績或做不利處分', article: 'Art. 21' },

  // ── 職安法 ──
  { law: '職安法', cat: '過勞預防', icon: '🛡️', rule: '異常工作負荷預防', content: '輪班、夜間、長時間工作須採預防措施', article: 'Art. 6-2' },
  { law: '職安法', cat: '過勞預防', icon: '🛡️', rule: '過勞預防措施', content: '辨識高風險→醫師面談→調整工時→健康指導', article: 'Art. 6-2' },
  { law: '職安法', cat: '健康檢查', icon: '🏥', rule: '夜間工作健檢', content: '從事夜間工作者應每年施行特殊健康檢查', article: 'Art. 20' },
  { law: '職安法', cat: '健康檢查', icon: '🏥', rule: '一般勞工健檢', content: '新進勞工體檢；在職勞工依年齡每1-5年定期健檢', article: 'Art. 20' },
  { law: '職安法', cat: '妊娠保護', icon: '🤰', rule: '妊娠期禁止作業', content: '危險性/有害性工作、重物搬運、有害物質接觸', article: 'Art. 30-1' },
  { law: '職安法', cat: '妊娠保護', icon: '🤰', rule: '哺乳期工作限制', content: '不得從事有害母乳之工作', article: 'Art. 30-1' },
]

const LAW_TABS = [
  { key: '勞基法', label: '勞動基準法', icon: '⚖️', color: 'var(--accent-cyan)' },
  { key: '性平法', label: '性別平等工作法', icon: '👩‍⚖️', color: 'var(--accent-pink)' },
  { key: '職安法', label: '職業安全衛生法', icon: '🛡️', color: 'var(--accent-green)' },
]

const initialShiftRules = [
  { id: 1, name: '標準班', hours: '09:00-18:00', breakTime: '12:00-13:00', lateThreshold: '09:05', type: '固定班' },
  { id: 2, name: '早班', hours: '08:00-17:00', breakTime: '12:00-13:00', lateThreshold: '08:05', type: '固定班' },
  { id: 3, name: '晚班', hours: '10:00-19:00', breakTime: '13:00-14:00', lateThreshold: '10:05', type: '固定班' },
  { id: 4, name: '夜班', hours: '22:00-06:00', breakTime: '02:00-02:30', lateThreshold: '22:05', type: '輪班' },
  { id: 5, name: '彈性班', hours: '08:00-10:00 彈性', breakTime: '自由安排', lateThreshold: '10:00', type: '彈性班' },
]

export default function ScheduleRules() {
  const [activeLaw, setActiveLaw] = useState('勞基法')
  const [activeCat, setActiveCat] = useState('全部')
  const [searchText, setSearchText] = useState('')
  const [shiftRules, setShiftRules] = useState(initialShiftRules)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', hours: '', breakTime: '', lateThreshold: '', type: '固定班' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name || !form.hours) return
    setShiftRules(prev => [...prev, { id: Date.now(), ...form }])
    setShowModal(false)
    setForm({ name: '', hours: '', breakTime: '', lateThreshold: '', type: '固定班' })
  }

  const lawRules = ALL_RULES.filter(r => r.law === activeLaw)
  const categories = ['全部', ...new Set(lawRules.map(r => r.cat))]
  const filteredRules = lawRules.filter(r =>
    (activeCat === '全部' || r.cat === activeCat) &&
    (searchText === '' || r.rule.includes(searchText) || r.content.includes(searchText) || r.article.includes(searchText))
  )

  const activeLawInfo = LAW_TABS.find(t => t.key === activeLaw)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">⚖️</span> 排班規則</h2>
            <p>台灣勞動法排班相關規定一覽</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> 新增班別</button>
        </div>
      </div>

      {/* ── Law Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border-subtle)' }}>
        {LAW_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveLaw(tab.key); setActiveCat('全部') }}
            style={{
              padding: '12px 24px', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: activeLaw === tab.key ? 700 : 500,
              color: activeLaw === tab.key ? tab.color : 'var(--text-muted)',
              background: 'none',
              borderBottom: activeLaw === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
              marginBottom: -2,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Law Info + Rule Count ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{activeLawInfo.label}</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filteredRules.length} 條規定</span>
      </div>

      {/* ── Category Filter ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {categories.map(cat => {
          const count = cat === '全部' ? lawRules.length : lawRules.filter(r => r.cat === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: activeCat === cat ? activeLawInfo.color : 'var(--bg-card)',
                color: activeCat === cat ? '#fff' : 'var(--text-secondary)',
                outline: activeCat === cat ? 'none' : '1px solid var(--border-medium)',
              }}
            >
              {cat} ({count})
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="搜尋規定..."
            value={searchText} onChange={e => setSearchText(e.target.value)}
            className="form-input" style={{ paddingLeft: 32, width: 200, fontSize: 12 }}
          />
        </div>
      </div>

      {/* ── Rules Table ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>類別</th>
                <th style={{ width: 180 }}>規則</th>
                <th>規定內容</th>
                <th style={{ width: 100 }}>條文</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>{r.icon}</span> {r.cat}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{r.rule}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.content}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'var(--glass-light)', color: 'var(--text-muted)', fontFamily: 'monospace',
                    }}>
                      {r.article}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shift Rules ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">🕐</span> 班別設定</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>班別</th><th>工作時間</th><th>休息時間</th><th>遲到門檻</th><th>類型</th></tr></thead>
            <tbody>
              {shiftRules.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.hours}</td>
                  <td>{r.breakTime}</td>
                  <td>{r.lateThreshold}</td>
                  <td>
                    <span className={`badge ${r.type === '固定班' ? 'badge-info' : r.type === '輪班' ? 'badge-warning' : 'badge-purple'}`}>
                      <span className="badge-dot"></span>{r.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

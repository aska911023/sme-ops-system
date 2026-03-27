import { BookOpen, Search, ChevronRight } from 'lucide-react'

const helpCategories = [
  {
    icon: '👥', title: '人資管理', articles: [
      { title: '如何新增員工', views: 120 },
      { title: '請假申請與審核流程', views: 98 },
      { title: '薪資計算說明', views: 76 },
    ]
  },
  {
    icon: '🔄', title: '流程管理', articles: [
      { title: '如何建立自訂流程', views: 85 },
      { title: '查核清單使用教學', views: 64 },
      { title: '任務指派說明', views: 52 },
    ]
  },
  {
    icon: '⚡', title: '自動化', articles: [
      { title: '觸發器設定教學', views: 71 },
      { title: 'LINE 通知整合', views: 93 },
      { title: '排程任務設定', views: 45 },
    ]
  },
  {
    icon: '🤖', title: 'AI 功能', articles: [
      { title: 'Agent 控制台使用指南', views: 110 },
      { title: 'AI 助理功能介紹', views: 87 },
      { title: '智能報表生成', views: 59 },
    ]
  },
]

export default function HelpCenter() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📚</span> 說明中心</h2>
        <p>系統使用教學與常見問題</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="search-bar" style={{ maxWidth: 480, margin: '0 auto' }}>
            <Search className="search-icon" style={{ width: 18, height: 18 }} />
            <input
              type="text"
              placeholder="搜尋說明文章..."
              className="form-input"
              style={{ paddingLeft: 42, paddingTop: 10, paddingBottom: 10, fontSize: 14 }}
            />
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {helpCategories.map((cat, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)', cursor: 'pointer' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
            <div className="stat-card-label">{cat.title}</div>
            <div className="stat-card-value">{cat.articles.length}</div>
            <div className="stat-card-sub">篇文章</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {helpCategories.map((cat, i) => (
          <div key={i} className="card">
            <div className="card-header">
              <div className="card-title">
                <span style={{ marginRight: 6 }}>{cat.icon}</span>{cat.title}
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cat.articles.map((article, j) => (
                <div key={j} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: 13 }}>{article.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{article.views} 次</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

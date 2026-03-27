import { useState } from 'react'
import { Bot, Send, Sparkles, RefreshCw } from 'lucide-react'

const suggestedPrompts = [
  '幫我分析本月出勤狀況',
  '列出待審核的假單',
  '本月薪資總支出是多少？',
  '哪個部門人數最多？',
  '有哪些流程正在執行中？',
  '最近的操作紀錄有哪些？',
]

const initialMessages = [
  {
    role: 'assistant',
    content: '你好！我是 SME Ops AI 助理。我可以幫你查詢員工資料、分析出勤、整理報表，或回答任何關於系統操作的問題。請問有什麼可以幫你的？',
    time: '10:00',
  }
]

export default function AgentConsole() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input, time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }
    const aiMsg = {
      role: 'assistant',
      content: `收到你的問題：「${input}」。正在處理中，此為展示介面，AI 回應功能開發中。`,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-purple-dim))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Agent 控制台</h2>
            <p style={{ margin: 0, fontSize: 12 }}>AI 智慧助理</p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '4px 12px' }}
            onClick={() => setInput(p)}
          >
            <Sparkles size={11} />
            {p}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 10, alignItems: 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-purple-dim))',
                  border: '1px solid var(--accent-cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={14} style={{ color: 'var(--accent-cyan)' }} />
                </div>
              )}
              <div style={{
                maxWidth: '72%',
                background: msg.role === 'user' ? 'var(--accent-cyan-dim)' : 'var(--glass-medium)',
                border: `1px solid ${msg.role === 'user' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.content}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="輸入問題，按 Enter 送出..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

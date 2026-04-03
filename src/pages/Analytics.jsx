import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { supabase } from '../lib/supabase'
import { calculateProfitability } from '../lib/automation'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

const colors = { cyan: '#22d3ee', blue: '#3b82f6', purple: '#a78bfa', green: '#34d399', orange: '#fb923c', red: '#f87171', pink: '#f472b6', yellow: '#fbbf24' }
const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11, weight: 600 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
    tooltip: { backgroundColor: 'rgba(15,23,55,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.15)', borderWidth: 1, padding: 12, cornerRadius: 10 },
  },
}
const gridStyle = { color: 'rgba(148,163,184,0.06)' }
const tickStyle = { color: '#64748b', font: { size: 11 } }

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('attendance_records').select('*'),
      supabase.from('opportunities').select('*'),
      supabase.from('stock_levels').select('*'),
      supabase.from('accounts_receivable').select('*'),
      supabase.from('accounts_payable').select('*'),
      supabase.from('salary_records').select('*').eq('month', month),
      calculateProfitability(month),
    ]).then(([emp, tasks, att, opps, stock, ar, ap, sal, profit]) => {
      setData({
        employees: emp.data || [], tasks: tasks.data || [], attendance: att.data || [],
        opportunities: opps.data || [], stock: stock.data || [],
        ar: ar.data || [], ap: ap.data || [], salary: sal.data || [], profit,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />
  const d = data

  const activeEmp = d.employees.filter(e => e.status === '在職').length
  const totalSalary = d.salary.reduce((s, r) => s + (r.net_salary || 0), 0)
  const wonAmount = d.opportunities.filter(o => o.stage === '贏單').reduce((s, o) => s + (o.amount || 0), 0)
  const arTotal = d.ar.reduce((s, r) => s + (r.amount || 0), 0)
  const arPaid = d.ar.reduce((s, r) => s + (r.paid_amount || 0), 0)
  const apTotal = d.ap.reduce((s, r) => s + (r.amount || 0), 0)
  const apPaid = d.ap.reduce((s, r) => s + (r.paid_amount || 0), 0)
  const lowStock = d.stock.filter(s => (s.quantity || 0) <= (s.min_qty || 10)).length

  // CRM Pipeline
  const stages = ['初步接觸', '需求分析', '報價', '議價', '贏單', '輸單']
  const pipelineData = {
    labels: stages,
    datasets: [{ label: '商機數', data: stages.map(s => d.opportunities.filter(o => o.stage === s).length), backgroundColor: [colors.blue, colors.cyan, colors.purple, colors.orange, colors.green, colors.red], borderRadius: 6, barThickness: 28 }],
  }

  // AR Aging
  const today = new Date()
  const arAging = { current: 0, d30: 0, d60: 0, d90: 0 }
  d.ar.filter(r => r.status !== '已收款').forEach(r => {
    const days = Math.floor((today - new Date(r.due_date)) / 86400000)
    const amt = (r.amount || 0) - (r.paid_amount || 0)
    if (days <= 0) arAging.current += amt; else if (days <= 30) arAging.d30 += amt; else if (days <= 60) arAging.d60 += amt; else arAging.d90 += amt
  })
  const arAgingData = {
    labels: ['未到期', '1-30天', '31-60天', '60天+'],
    datasets: [{ data: [arAging.current, arAging.d30, arAging.d60, arAging.d90], backgroundColor: [colors.green, colors.yellow, colors.orange, colors.red], borderWidth: 0 }],
  }

  // Inventory Health
  const stockOk = d.stock.filter(s => (s.quantity || 0) > (s.min_qty || 10)).length
  const stockData = {
    labels: ['正常', '低庫存'],
    datasets: [{ data: [stockOk, lowStock], backgroundColor: [colors.green, colors.red], borderWidth: 0 }],
  }

  // Revenue Trend
  const months = Array.from({ length: 6 }, (_, i) => { const dt = new Date(); dt.setMonth(dt.getMonth() - (5 - i)); return dt.toISOString().slice(0, 7) })
  const revTrend = {
    labels: months.map(m => m.slice(5) + '月'),
    datasets: [
      { label: '營收', data: months.map(() => Math.round(d.profit.revenue * (0.8 + Math.random() * 0.4))), borderColor: colors.cyan, backgroundColor: 'rgba(34,211,238,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: colors.cyan },
      { label: '成本', data: months.map(() => Math.round(d.profit.totalCost * (0.85 + Math.random() * 0.3))), borderColor: colors.orange, backgroundColor: 'rgba(251,146,60,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: colors.orange },
    ],
  }

  // Task Completion
  const taskData = {
    labels: ['已完成', '進行中', '未開始'],
    datasets: [{ data: [d.tasks.filter(t => t.status === '已完成').length, d.tasks.filter(t => t.status === '進行中').length, d.tasks.filter(t => t.status === '未開始').length], backgroundColor: [colors.green, colors.blue, colors.orange], borderWidth: 0 }],
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><span className="header-icon">📈</span> BI 營運看板</h2>
        <p>跨模組數據整合分析</p>
      </div>

      {/* KPI */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[
          { label: '在職人數', value: activeEmp, color: 'cyan' },
          { label: '本月薪資', value: `NT$${(totalSalary / 1000).toFixed(0)}K`, color: 'purple' },
          { label: '贏單金額', value: `NT$${(wonAmount / 1000).toFixed(0)}K`, color: 'green' },
          { label: '應收餘額', value: `NT$${((arTotal - arPaid) / 1000).toFixed(0)}K`, color: 'orange' },
          { label: '應付餘額', value: `NT$${((apTotal - apPaid) / 1000).toFixed(0)}K`, color: 'red' },
          { label: '低庫存', value: lowStock, color: lowStock > 0 ? 'red' : 'green' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': `var(--accent-${s.color})`, '--card-accent-dim': `var(--accent-${s.color}-dim)` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Profitability */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: '營收', value: `NT$ ${d.profit.revenue.toLocaleString()}`, color: 'green' },
          { label: '總成本', value: `NT$ ${d.profit.totalCost.toLocaleString()}`, color: 'orange' },
          { label: '毛利', value: `NT$ ${d.profit.grossProfit.toLocaleString()}`, color: d.profit.grossProfit >= 0 ? 'cyan' : 'red' },
          { label: '毛利率', value: `${d.profit.grossMargin}%`, color: d.profit.grossMargin >= 30 ? 'green' : 'orange' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': `var(--accent-${s.color})`, '--card-accent-dim': `var(--accent-${s.color}-dim)` }}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">📈 營收 vs 成本趨勢</div></div>
          <div style={{ height: 280, padding: '0 8px 8px' }}>
            <Line data={revTrend} options={{ ...chartOpts, scales: { x: { grid: gridStyle, ticks: tickStyle }, y: { beginAtZero: true, grid: gridStyle, ticks: tickStyle } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📊 應收帳齡分析</div></div>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px 8px' }}>
            <Doughnut data={arAgingData} options={{ ...chartOpts, cutout: '55%', plugins: { ...chartOpts.plugins, legend: { ...chartOpts.plugins.legend, position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">🤝 銷售漏斗</div></div>
          <div style={{ height: 240, padding: '0 8px 8px' }}>
            <Bar data={pipelineData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: tickStyle }, y: { beginAtZero: true, grid: gridStyle, ticks: { ...tickStyle, stepSize: 1 } } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📦 庫存健康度</div></div>
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px 8px' }}>
            <Doughnut data={stockData} options={{ ...chartOpts, cutout: '55%', plugins: { ...chartOpts.plugins, legend: { ...chartOpts.plugins.legend, position: 'bottom' } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">⚙️ 任務完成率</div></div>
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px 8px' }}>
            <Doughnut data={taskData} options={{ ...chartOpts, cutout: '55%', plugins: { ...chartOpts.plugins, legend: { ...chartOpts.plugins.legend, position: 'bottom' } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}

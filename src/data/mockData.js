// Mock data for the entire SME Operations Management System
export const employees = [
  { id: 1, name: '王小明', nameEn: 'Xiaoming Wang', dept: '研發部', position: '資深工程師', store: '台北總部', status: '在職', email: 'xiaoming@company.com', phone: '0912-345-678', joinDate: '2022-03-15', avatar: '#3b82f6' },
  { id: 2, name: '林美麗', nameEn: 'Meili Lin', dept: '行銷部', position: '行銷經理', store: '台北總部', status: '在職', email: 'meili@company.com', phone: '0923-456-789', joinDate: '2021-08-20', avatar: '#a78bfa' },
  { id: 3, name: '陳大偉', nameEn: 'Dawei Chen', dept: '業務部', position: '業務主管', store: '台中分店', status: '在職', email: 'dawei@company.com', phone: '0934-567-890', joinDate: '2020-11-10', avatar: '#f472b6' },
  { id: 4, name: '張雅婷', nameEn: 'Yating Zhang', dept: '人資部', position: 'HR 專員', store: '台北總部', status: '在職', email: 'yating@company.com', phone: '0945-678-901', joinDate: '2023-01-05', avatar: '#34d399' },
  { id: 5, name: '黃志強', nameEn: 'Zhiqiang Huang', dept: '研發部', position: '前端工程師', store: '台北總部', status: '在職', email: 'zhiqiang@company.com', phone: '0956-789-012', joinDate: '2023-06-12', avatar: '#fb923c' },
  { id: 6, name: '劉佳玲', nameEn: 'Jialing Liu', dept: '財務部', position: '財務主管', store: '台北總部', status: '在職', email: 'jialing@company.com', phone: '0967-890-123', joinDate: '2019-04-20', avatar: '#22d3ee' },
  { id: 7, name: '吳建宏', nameEn: 'Jianhong Wu', dept: '業務部', position: '業務代表', store: '高雄分店', status: '在職', email: 'jianhong@company.com', phone: '0978-901-234', joinDate: '2024-02-14', avatar: '#f87171' },
  { id: 8, name: '蔡心怡', nameEn: 'Xinyi Cai', dept: '客服部', position: '客服組長', store: '台中分店', status: '在職', email: 'xinyi@company.com', phone: '0989-012-345', joinDate: '2022-09-08', avatar: '#fbbf24' },
  { id: 9, name: '鄭宇翔', nameEn: 'Yuxiang Zheng', dept: '研發部', position: '後端工程師', store: '台北總部', status: '離職', email: 'yuxiang@company.com', phone: '0990-123-456', joinDate: '2021-12-01', avatar: '#64748b' },
]

export const attendanceRecords = [
  { id: 1, employee: '王小明', date: '2026-03-27', clockIn: '08:52', clockOut: '18:15', status: '正常', hours: 8.38 },
  { id: 2, employee: '林美麗', date: '2026-03-27', clockIn: '09:05', clockOut: '18:30', status: '遲到', hours: 8.42 },
  { id: 3, employee: '陳大偉', date: '2026-03-27', clockIn: '08:30', clockOut: '17:45', status: '正常', hours: 8.25 },
  { id: 4, employee: '張雅婷', date: '2026-03-27', clockIn: '08:58', clockOut: '18:20', status: '正常', hours: 8.37 },
  { id: 5, employee: '黃志強', date: '2026-03-27', clockIn: '09:15', clockOut: '19:00', status: '遲到', hours: 8.75 },
  { id: 6, employee: '劉佳玲', date: '2026-03-27', clockIn: '08:45', clockOut: '18:00', status: '正常', hours: 8.25 },
  { id: 7, employee: '吳建宏', date: '2026-03-27', clockIn: null, clockOut: null, status: '未打卡', hours: 0 },
  { id: 8, employee: '蔡心怡', date: '2026-03-27', clockIn: '08:55', clockOut: '18:10', status: '正常', hours: 8.25 },
]

export const leaveRequests = [
  { id: 1, employee: '王小明', type: '特休', startDate: '2026-04-01', endDate: '2026-04-03', days: 3, reason: '家庭旅遊', status: '已核准', approver: '劉佳玲' },
  { id: 2, employee: '林美麗', type: '病假', startDate: '2026-03-28', endDate: '2026-03-28', days: 1, reason: '身體不適', status: '待審核', approver: '-' },
  { id: 3, employee: '黃志強', type: '事假', startDate: '2026-04-05', endDate: '2026-04-05', days: 1, reason: '私人事務', status: '待審核', approver: '-' },
  { id: 4, employee: '陳大偉', type: '特休', startDate: '2026-03-20', endDate: '2026-03-21', days: 2, reason: '個人安排', status: '已核准', approver: '劉佳玲' },
  { id: 5, employee: '蔡心怡', type: '婚假', startDate: '2026-05-10', endDate: '2026-05-17', days: 8, reason: '結婚', status: '已核准', approver: '劉佳玲' },
  { id: 6, employee: '吳建宏', type: '公假', startDate: '2026-03-30', endDate: '2026-03-30', days: 1, reason: '教育訓練', status: '已核准', approver: '陳大偉' },
]

export const overtimeRequests = [
  { id: 1, employee: '王小明', date: '2026-03-25', hours: 2, reason: '專案趕工', status: '已核准' },
  { id: 2, employee: '黃志強', date: '2026-03-26', hours: 3, reason: '系統上線準備', status: '已核准' },
  { id: 3, employee: '鄭宇翔', date: '2026-03-24', hours: 1.5, reason: 'Bug 修復', status: '待審核' },
]

export const salaryRecords = [
  { id: 1, employee: '王小明', baseSalary: 65000, allowance: 5000, overtime: 3200, deductions: 2800, insurance: 3500, netSalary: 66900, month: '2026-03' },
  { id: 2, employee: '林美麗', baseSalary: 72000, allowance: 6000, overtime: 0, deductions: 3200, insurance: 4100, netSalary: 70700, month: '2026-03' },
  { id: 3, employee: '陳大偉', baseSalary: 80000, allowance: 8000, overtime: 5000, deductions: 4000, insurance: 4800, netSalary: 84200, month: '2026-03' },
  { id: 4, employee: '張雅婷', baseSalary: 52000, allowance: 3000, overtime: 0, deductions: 2200, insurance: 2800, netSalary: 50000, month: '2026-03' },
  { id: 5, employee: '黃志強', baseSalary: 58000, allowance: 4000, overtime: 4800, deductions: 2600, insurance: 3200, netSalary: 61000, month: '2026-03' },
  { id: 6, employee: '劉佳玲', baseSalary: 85000, allowance: 8000, overtime: 0, deductions: 4500, insurance: 5200, netSalary: 83300, month: '2026-03' },
  { id: 7, employee: '吳建宏', baseSalary: 45000, allowance: 3000, overtime: 1600, deductions: 1800, insurance: 2400, netSalary: 45400, month: '2026-03' },
  { id: 8, employee: '蔡心怡', baseSalary: 55000, allowance: 4000, overtime: 0, deductions: 2400, insurance: 3000, netSalary: 53600, month: '2026-03' },
]

export const scheduleData = [
  { id: 1, employee: '王小明', mon: '09-18', tue: '09-18', wed: '09-18', thu: '09-18', fri: '09-18', sat: '休', sun: '休' },
  { id: 2, employee: '林美麗', mon: '09-18', tue: '09-18', wed: '09-18', thu: '09-18', fri: '09-18', sat: '休', sun: '休' },
  { id: 3, employee: '陳大偉', mon: '08-17', tue: '08-17', wed: '08-17', thu: '08-17', fri: '08-17', sat: '輪值', sun: '休' },
  { id: 4, employee: '蔡心怡', mon: '10-19', tue: '10-19', wed: '休', thu: '10-19', fri: '10-19', sat: '10-19', sun: '10-19' },
  { id: 5, employee: '吳建宏', mon: '08-17', tue: '休', wed: '08-17', thu: '08-17', fri: '08-17', sat: '08-17', sun: '休' },
]

export const workflows = [
  { id: 1, name: '新人到職流程', steps: 8, activeInstances: 2, status: '已啟用', description: '涵蓋帳號開通、設備領取、部門報到等流程', category: '人資' },
  { id: 2, name: '開店流程', steps: 45, activeInstances: 1, status: '已啟用', description: '依據 Google Sheet 任務清單產生（共 45 步）', category: '營運' },
  { id: 3, name: '請假審批流程', steps: 4, activeInstances: 3, status: '已啟用', description: '員工提交 → 主管審核 → HR確認 → 通知', category: '人資' },
  { id: 4, name: '採購申請流程', steps: 6, activeInstances: 0, status: '已啟用', description: '需求提出 → 報價比較 → 主管核准 → 採購 → 驗收 → 付款', category: '財務' },
  { id: 5, name: '績效考核流程', steps: 5, activeInstances: 0, status: '草稿', description: '自評 → 主管評核 → 跨部門校準 → 面談 → 結果確認', category: '人資' },
]

export const tasks = [
  { id: 1, title: 'Step1', workflow: '開店流程', status: '已完成', assignee: 'Zoey', dueDate: '2026-03-25', priority: '高' },
  { id: 2, title: 'Step1', workflow: '開店流程', status: '已完成', assignee: 'Snow', dueDate: '2026-03-25', priority: '高' },
  { id: 3, title: 'Step2', workflow: '開店流程', status: '進行中', assignee: 'Snow', dueDate: '2026-03-28', priority: '中' },
  { id: 4, title: 'Step2', workflow: '開店流程', status: '未開始', assignee: 'Dave', dueDate: '2026-03-30', priority: '中' },
  { id: 5, title: 'Step3', workflow: '開店流程', status: '未開始', assignee: '學文', dueDate: '2026-04-01', priority: '低' },
  { id: 6, title: 'Step3', workflow: '開店流程', status: '已完成', assignee: 'Aska', dueDate: '2026-03-26', priority: '高' },
  { id: 7, title: 'Step4', workflow: '開店流程', status: '未開始', assignee: 'Snow', dueDate: '2026-04-05', priority: '低' },
  { id: 8, title: '補貨', workflow: '日常營運', status: '未開始', assignee: 'Snow', dueDate: '2026-03-28', priority: '中' },
  { id: 9, title: 'testtask1', workflow: '測試', status: '已完成', assignee: 'Snow', dueDate: '2026-03-20', priority: '低' },
]

export const checklists = [
  { id: 1, name: '每日開店檢查', items: 12, completed: 8, category: '門市營運', assignee: '蔡心怡' },
  { id: 2, name: '新進員工報到檢核表', items: 15, completed: 15, category: '人資', assignee: '張雅婷' },
  { id: 3, name: '月底盤點清單', items: 20, completed: 5, category: '庫存', assignee: '吳建宏' },
  { id: 4, name: '設備安全檢查', items: 8, completed: 0, category: '安全', assignee: '陳大偉' },
]

export const companies = [
  { id: 1, name: 'Master AI 科技有限公司', shortName: 'Master AI', taxId: '12345678', address: '台北市信義區信義路五段7號', phone: '02-2345-6789', stores: 3, employees: 9, status: '營運中' },
]

export const stores = [
  { id: 1, name: '台北總部', company: 'Master AI', address: '台北市信義區信義路五段7號', phone: '02-2345-6789', manager: '劉佳玲', employeeCount: 5, status: '營運中' },
  { id: 2, name: '台中分店', company: 'Master AI', address: '台中市西屯區台灣大道三段99號', phone: '04-2345-6789', manager: '陳大偉', employeeCount: 2, status: '營運中' },
  { id: 3, name: '高雄分店', company: 'Master AI', address: '高雄市前鎮區中華五路789號', phone: '07-2345-6789', manager: '吳建宏', employeeCount: 1, status: '籌備中' },
]

export const departments = [
  { id: 1, name: '研發部', head: '王小明', memberCount: 3, description: '負責產品研發與技術創新' },
  { id: 2, name: '行銷部', head: '林美麗', memberCount: 1, description: '品牌推廣與市場策略' },
  { id: 3, name: '業務部', head: '陳大偉', memberCount: 2, description: '客戶開發與業務推展' },
  { id: 4, name: '人資部', head: '張雅婷', memberCount: 1, description: '人力資源管理與發展' },
  { id: 5, name: '財務部', head: '劉佳玲', memberCount: 1, description: '財務管理與會計作業' },
  { id: 6, name: '客服部', head: '蔡心怡', memberCount: 1, description: '客戶服務與售後支援' },
]

export const performanceReviews = [
  { id: 1, employee: '王小明', period: '2026 Q1', overallScore: 92, goals: 4, goalsCompleted: 3, rating: 'A', reviewer: '劉佳玲', status: '已完成' },
  { id: 2, employee: '林美麗', period: '2026 Q1', overallScore: 88, goals: 5, goalsCompleted: 4, rating: 'A', reviewer: '劉佳玲', status: '已完成' },
  { id: 3, employee: '陳大偉', period: '2026 Q1', overallScore: 85, goals: 6, goalsCompleted: 5, rating: 'B+', reviewer: '劉佳玲', status: '評核中' },
  { id: 4, employee: '張雅婷', period: '2026 Q1', overallScore: 78, goals: 4, goalsCompleted: 3, rating: 'B', reviewer: '劉佳玲', status: '評核中' },
  { id: 5, employee: '黃志強', period: '2026 Q1', overallScore: 95, goals: 3, goalsCompleted: 3, rating: 'A+', reviewer: '王小明', status: '已完成' },
  { id: 6, employee: '蔡心怡', period: '2026 Q1', overallScore: 82, goals: 5, goalsCompleted: 3, rating: 'B+', reviewer: '陳大偉', status: '自評中' },
  { id: 7, employee: '吳建宏', period: '2026 Q1', overallScore: 70, goals: 4, goalsCompleted: 2, rating: 'B-', reviewer: '陳大偉', status: '自評中' },
]

export const kpiData = [
  { metric: '營收達成率', value: 94, target: 100, unit: '%', trend: 'up' },
  { metric: '客戶滿意度', value: 4.6, target: 5.0, unit: '分', trend: 'up' },
  { metric: '員工留任率', value: 89, target: 90, unit: '%', trend: 'stable' },
  { metric: '專案交付率', value: 85, target: 95, unit: '%', trend: 'down' },
  { metric: '品質合格率', value: 97, target: 98, unit: '%', trend: 'up' },
  { metric: '培訓完成率', value: 72, target: 80, unit: '%', trend: 'up' },
]

export const notifications = [
  { id: 1, type: 'leave', title: '林美麗 提交了病假申請', time: '10 分鐘前', read: false },
  { id: 2, type: 'task', title: '「開店流程 Step2」已逾期', time: '30 分鐘前', read: false },
  { id: 3, type: 'system', title: '系統已自動產生 3 月份考勤報表', time: '1 小時前', read: true },
  { id: 4, type: 'performance', title: '2026 Q1 績效考核已開始', time: '2 小時前', read: true },
  { id: 5, type: 'hr', title: '蔡心怡 婚假申請已核准', time: '昨天', read: true },
]

export const auditLogs = [
  { id: 1, user: '劉佳玲', action: '核准請假', target: '王小明的特休申請', time: '2026-03-27 10:30', ip: '192.168.1.105' },
  { id: 2, user: '張雅婷', action: '新增員工', target: '吳建宏', time: '2026-03-27 09:15', ip: '192.168.1.102' },
  { id: 3, user: 'Snow', action: '更新流程', target: '開店流程 Step2 狀態變更', time: '2026-03-26 16:45', ip: '192.168.1.110' },
  { id: 4, user: '系統', action: '自動觸發', target: '每日考勤統計', time: '2026-03-27 00:05', ip: '-' },
  { id: 5, user: '王小明', action: '上傳文件', target: '2026 Q1 技術報告.pdf', time: '2026-03-26 14:20', ip: '192.168.1.101' },
]

export const triggers = [
  { id: 1, name: '每日考勤統計', type: '排程', schedule: '每日 00:05', status: '啟用', lastRun: '2026-03-27 00:05', action: '統計前日出勤並發送報表' },
  { id: 2, name: '遲到通知', type: '事件', schedule: '09:10 觸發', status: '啟用', lastRun: '2026-03-27 09:10', action: '遲到員工發送 LINE 提醒' },
  { id: 3, name: '月薪計算', type: '排程', schedule: '每月 25 號', status: '啟用', lastRun: '2026-02-25 02:00', action: '計算當月薪資並通知財務' },
  { id: 4, name: '合約到期提醒', type: '排程', schedule: '每週一 09:00', status: '停用', lastRun: '2026-03-17 09:00', action: '提醒 HR 即將到期合約' },
]

export const holidays = [
  { id: 1, name: '兒童節', date: '2026-04-04', type: '國定假日' },
  { id: 2, name: '清明節', date: '2026-04-05', type: '國定假日' },
  { id: 3, name: '勞動節', date: '2026-05-01', type: '國定假日' },
  { id: 4, name: '端午節', date: '2026-05-31', type: '國定假日' },
  { id: 5, name: '公司週年慶', date: '2026-06-15', type: '公司假日' },
  { id: 6, name: '中秋節', date: '2026-10-06', type: '國定假日' },
]

export const recruitmentJobs = [
  { id: 1, title: '資深前端工程師', dept: '研發部', location: '台北總部', type: '全職', applicants: 12, status: '招募中', posted: '2026-03-10' },
  { id: 2, title: '行銷專員', dept: '行銷部', location: '台北總部', type: '全職', applicants: 8, status: '招募中', posted: '2026-03-15' },
  { id: 3, title: '門市店員', dept: '業務部', location: '台中分店', type: '兼職', applicants: 25, status: '已關閉', posted: '2026-02-20' },
  { id: 4, title: 'AI 工程師', dept: '研發部', location: '台北總部', type: '全職', applicants: 5, status: '招募中', posted: '2026-03-20' },
]

export const documents = [
  { id: 1, name: '員工手冊 v3.2', type: 'PDF', size: '2.4 MB', uploader: '張雅婷', uploadDate: '2026-03-01', category: '制度規章' },
  { id: 2, name: '2026 Q1 技術報告', type: 'PDF', size: '5.1 MB', uploader: '王小明', uploadDate: '2026-03-26', category: '報告' },
  { id: 3, name: '保密協議範本', type: 'DOCX', size: '340 KB', uploader: '張雅婷', uploadDate: '2026-01-15', category: '合約範本' },
  { id: 4, name: '出差報銷表', type: 'XLSX', size: '128 KB', uploader: '劉佳玲', uploadDate: '2026-02-10', category: '表單' },
  { id: 5, name: '資安政策 2026', type: 'PDF', size: '1.8 MB', uploader: '王小明', uploadDate: '2026-03-05', category: '制度規章' },
]

export const businessTrips = [
  { id: 1, employee: '陳大偉', destination: '台中', startDate: '2026-04-10', endDate: '2026-04-12', purpose: '客戶拜訪', budget: 15000, status: '已核准' },
  { id: 2, employee: '林美麗', destination: '東京', startDate: '2026-05-05', endDate: '2026-05-08', purpose: '展覽參訪', budget: 80000, status: '待審核' },
  { id: 3, employee: '王小明', destination: '新竹', startDate: '2026-03-28', endDate: '2026-03-28', purpose: '技術交流', budget: 3000, status: '已核准' },
]

export const expenses = [
  { id: 1, employee: '陳大偉', category: '交通', amount: 2800, date: '2026-03-20', description: '高鐵來回台中', status: '已核銷', receipt: true },
  { id: 2, employee: '林美麗', category: '住宿', amount: 12000, date: '2026-03-15', description: '出差住宿兩晚', status: '待審核', receipt: true },
  { id: 3, employee: '王小明', category: '餐飲', amount: 650, date: '2026-03-26', description: '客戶會議午餐', status: '已核銷', receipt: true },
  { id: 4, employee: '黃志強', category: '設備', amount: 18500, date: '2026-03-22', description: '外接螢幕採購', status: '已核銷', receipt: true },
]

export const monthlyChartData = [
  { label: '10月', value: 78 },
  { label: '11月', value: 82 },
  { label: '12月', value: 75 },
  { label: '1月', value: 88 },
  { label: '2月', value: 85 },
  { label: '3月', value: 94 },
]

import { supabase } from './supabase'

// ── Employees ──────────────────────────────────────────────
export const getEmployees = () =>
  supabase.from('employees').select('*').order('id')

export const createEmployee = (data) =>
  supabase.from('employees').insert(data).select().single()

export const updateEmployee = (id, data) =>
  supabase.from('employees').update(data).eq('id', id).select().single()

export const deleteEmployee = (id) =>
  supabase.from('employees').delete().eq('id', id)

// ── Attendance ─────────────────────────────────────────────
export const getAttendance = (date) => {
  const q = supabase.from('attendance_records').select('*').order('id')
  return date ? q.eq('date', date) : q
}

export const upsertAttendance = (data) =>
  supabase.from('attendance_records').upsert(data).select().single()

// ── Leave Requests ─────────────────────────────────────────
export const getLeaveRequests = () =>
  supabase.from('leave_requests').select('*').order('id')

export const createLeaveRequest = (data) =>
  supabase.from('leave_requests').insert(data).select().single()

export const updateLeaveStatus = (id, status, approver) =>
  supabase.from('leave_requests').update({ status, approver }).eq('id', id).select().single()

export const deleteLeaveRequest = (id) =>
  supabase.from('leave_requests').delete().eq('id', id)

// ── Overtime ───────────────────────────────────────────────
export const getOvertimeRequests = () =>
  supabase.from('overtime_requests').select('*').order('id')

export const createOvertimeRequest = (data) =>
  supabase.from('overtime_requests').insert(data).select().single()

export const updateOvertimeStatus = (id, status) =>
  supabase.from('overtime_requests').update({ status }).eq('id', id).select().single()

// ── Salary ─────────────────────────────────────────────────
export const getSalaryRecords = (month) => {
  const q = supabase.from('salary_records').select('*').order('id')
  return month ? q.eq('month', month) : q
}

export const upsertSalaryRecord = (data) =>
  supabase.from('salary_records').upsert(data).select().single()

// ── Schedule ───────────────────────────────────────────────
export const getScheduleData = () =>
  supabase.from('schedule_data').select('*').order('id')

export const updateSchedule = (id, data) =>
  supabase.from('schedule_data').update(data).eq('id', id).select().single()

// ── Holidays ───────────────────────────────────────────────
export const getHolidays = () =>
  supabase.from('holidays').select('*').order('date')

export const createHoliday = (data) =>
  supabase.from('holidays').insert(data).select().single()

export const deleteHoliday = (id) =>
  supabase.from('holidays').delete().eq('id', id)

// ── Performance Reviews ────────────────────────────────────
export const getPerformanceReviews = () =>
  supabase.from('performance_reviews').select('*').order('id')

export const updatePerformanceReview = (id, data) =>
  supabase.from('performance_reviews').update(data).eq('id', id).select().single()

// ── Recruitment ────────────────────────────────────────────
export const getRecruitmentJobs = () =>
  supabase.from('recruitment_jobs').select('*').order('id')

export const createRecruitmentJob = (data) =>
  supabase.from('recruitment_jobs').insert(data).select().single()

export const updateRecruitmentJob = (id, data) =>
  supabase.from('recruitment_jobs').update(data).eq('id', id).select().single()

export const deleteRecruitmentJob = (id) =>
  supabase.from('recruitment_jobs').delete().eq('id', id)

// ── Documents ──────────────────────────────────────────────
export const getDocuments = () =>
  supabase.from('documents').select('*').order('upload_date', { ascending: false })

export const createDocument = (data) =>
  supabase.from('documents').insert(data).select().single()

export const deleteDocument = (id) =>
  supabase.from('documents').delete().eq('id', id)

// ── Business Trips ─────────────────────────────────────────
export const getBusinessTrips = () =>
  supabase.from('business_trips').select('*').order('id')

export const createBusinessTrip = (data) =>
  supabase.from('business_trips').insert(data).select().single()

export const updateBusinessTripStatus = (id, status) =>
  supabase.from('business_trips').update({ status }).eq('id', id).select().single()

// ── Expenses ───────────────────────────────────────────────
export const getExpenses = () =>
  supabase.from('expenses').select('*').order('id')

export const createExpense = (data) =>
  supabase.from('expenses').insert(data).select().single()

export const updateExpenseStatus = (id, status) =>
  supabase.from('expenses').update({ status }).eq('id', id).select().single()

// ── Workflows ──────────────────────────────────────────────
export const getWorkflows = () =>
  supabase.from('workflows').select('*').order('id')

export const createWorkflow = (data) =>
  supabase.from('workflows').insert(data).select().single()

export const updateWorkflow = (id, data) =>
  supabase.from('workflows').update(data).eq('id', id).select().single()

// ── Tasks ──────────────────────────────────────────────────
export const getTasks = () =>
  supabase.from('tasks').select('*').order('id')

export const createTask = (data) =>
  supabase.from('tasks').insert(data).select().single()

export const updateTask = (id, data) =>
  supabase.from('tasks').update(data).eq('id', id).select().single()

export const deleteTask = (id) =>
  supabase.from('tasks').delete().eq('id', id)

// ── Checklists ─────────────────────────────────────────────
export const getChecklists = () =>
  supabase.from('checklists').select('*').order('id')

export const createChecklist = (data) =>
  supabase.from('checklists').insert(data).select().single()

export const updateChecklist = (id, data) =>
  supabase.from('checklists').update(data).eq('id', id).select().single()

// ── Organizations ──────────────────────────────────────────
export const getCompanies = () =>
  supabase.from('companies').select('*').order('id')

export const createCompany = (data) =>
  supabase.from('companies').insert(data).select().single()

export const getStores = () =>
  supabase.from('stores').select('*').order('id')

export const createStore = (data) =>
  supabase.from('stores').insert(data).select().single()

export const getDepartments = () =>
  supabase.from('departments').select('*').order('id')

export const createDepartment = (data) =>
  supabase.from('departments').insert(data).select().single()

// ── System ─────────────────────────────────────────────────
export const getTriggers = () =>
  supabase.from('triggers').select('*').order('id')

export const updateTrigger = (id, data) =>
  supabase.from('triggers').update(data).eq('id', id).select().single()

export const getNotifications = (userId) => {
  const q = supabase.from('notifications').select('*').order('created_at', { ascending: false })
  return userId ? q.eq('user_id', userId) : q
}

export const markNotificationRead = (id) =>
  supabase.from('notifications').update({ read: true }).eq('id', id)

export const markAllNotificationsRead = () =>
  supabase.from('notifications').update({ read: true }).eq('read', false)

export const getAuditLogs = () =>
  supabase.from('audit_logs').select('*').order('time', { ascending: false })

export const createAuditLog = (data) =>
  supabase.from('audit_logs').insert(data)

export const getKpiData = () =>
  supabase.from('kpi_data').select('*').order('id')

// ── Purchase Management ──
export const getSuppliers = () =>
  supabase.from('suppliers').select('*').order('id')
export const createSupplier = (data) =>
  supabase.from('suppliers').insert(data).select().single()
export const getPurchaseRequests = () =>
  supabase.from('purchase_requests').select('*').order('id', { ascending: false })
export const createPurchaseRequest = (data) =>
  supabase.from('purchase_requests').insert(data).select().single()
export const getPurchaseOrders = () =>
  supabase.from('purchase_orders').select('*').order('id', { ascending: false })
export const createPurchaseOrder = (data) =>
  supabase.from('purchase_orders').insert(data).select().single()
export const getGoodsReceipts = () =>
  supabase.from('goods_receipts').select('*').order('id', { ascending: false })
export const createGoodsReceipt = (data) =>
  supabase.from('goods_receipts').insert(data).select().single()

// ── Finance & Accounting ──
export const getAccounts = () =>
  supabase.from('accounts').select('*').order('code')
export const getJournalEntries = () =>
  supabase.from('journal_entries').select('*').order('id', { ascending: false })
export const getJournalLines = (entryId) =>
  supabase.from('journal_lines').select('*').eq('entry_id', entryId).order('id')
export const createJournalEntry = (data) =>
  supabase.from('journal_entries').insert(data).select().single()
export const createJournalLine = (data) =>
  supabase.from('journal_lines').insert(data).select().single()
export const getAccountsReceivable = () =>
  supabase.from('accounts_receivable').select('*').order('id', { ascending: false })
export const createAccountReceivable = (data) =>
  supabase.from('accounts_receivable').insert(data).select().single()
export const getAccountsPayable = () =>
  supabase.from('accounts_payable').select('*').order('id', { ascending: false })
export const createAccountPayable = (data) =>
  supabase.from('accounts_payable').insert(data).select().single()

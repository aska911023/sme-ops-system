import { supabase } from './supabase'

/**
 * 動態簽核引擎
 * 根據組織架構自動找到直屬主管進行審核
 */

// 找到員工的直屬主管
export async function getSupervisor(employeeName) {
  const { data: emp } = await supabase
    .from('employees')
    .select('supervisor')
    .eq('name', employeeName)
    .eq('status', '在職')
    .maybeSingle()

  if (!emp?.supervisor) return null

  const { data: supervisor } = await supabase
    .from('employees')
    .select('id, name, line_user_id, email, role_id')
    .eq('name', emp.supervisor)
    .eq('status', '在職')
    .maybeSingle()

  return supervisor
}

// 找到審核鏈（往上找到有特定權限的人）
export async function getApprovalChain(employeeName, permissionCode) {
  const chain = []
  let current = employeeName
  const visited = new Set()

  while (current && !visited.has(current)) {
    visited.add(current)
    const supervisor = await getSupervisor(current)
    if (!supervisor) break

    // Check if supervisor has the required permission
    if (supervisor.role_id) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permissions(code)')
        .eq('role_id', supervisor.role_id)

      const hasPerm = (perms || []).some(p => p.permissions?.code === permissionCode)
      chain.push({ ...supervisor, hasPermission: hasPerm })
      if (hasPerm) break // Found the right approver
    }

    current = supervisor.name
  }

  return chain
}

// 提交簽核請求（自動找到審核人）
export async function submitForApproval(type, record, requesterName) {
  let permissionCode
  switch (type) {
    case 'leave': permissionCode = 'leave.approve'; break
    case 'pr': permissionCode = 'pr.approve'; break
    default: permissionCode = 'leave.approve'
  }

  const chain = await getApprovalChain(requesterName, permissionCode)
  const approver = chain.find(c => c.hasPermission)

  return {
    approver: approver || chain[chain.length - 1] || null,
    chain,
    record,
  }
}

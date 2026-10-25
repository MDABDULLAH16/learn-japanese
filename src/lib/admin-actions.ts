'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SUPER_ADMIN_EMAILS = ['abdullahwebdev15@gmail.com', 'abdullahwebdev15@gamil.com']

/**
 * Fetch all statistics, visitor chart data, and user list for Admin Dashboard
 */
export async function getAdminDashboardData() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })

  if (!currentUser) {
    throw new Error('User not found')
  }

  const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim())
  const hasAdminAccess =
    currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || isSuperAdminEmail

  if (!hasAdminAccess) {
    throw new Error('Access denied: Admins only')
  }

  // 1. Fetch Users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      streak: true,
      totalScore: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          progress: true,
          recapItems: true,
        },
      },
    },
  })

  // 2. Fetch Visitor Data (Last 14 days)
  const now = new Date()
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(now.getDate() - 13)
  const startDateStr = fourteenDaysAgo.toISOString().split('T')[0]

  // Fetch all site visits in range
  const siteVisits = await (prisma as any).siteVisit.findMany({
    where: {
      date: {
        gte: startDateStr,
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group visits by date (YYYY-MM-DD)
  const visitsByDateMap: Record<string, { total: number; uniqueUsers: Set<string> }> = {}

  // Initialize all last 14 days so chart is continuous
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    const dateKey = d.toISOString().split('T')[0]
    visitsByDateMap[dateKey] = { total: 0, uniqueUsers: new Set<string>() }
  }

  siteVisits.forEach((visit: { date: string; userId?: string | null }) => {
    if (!visitsByDateMap[visit.date]) {
      visitsByDateMap[visit.date] = { total: 0, uniqueUsers: new Set<string>() }
    }
    visitsByDateMap[visit.date].total += 1
    if (visit.userId) {
      visitsByDateMap[visit.date].uniqueUsers.add(visit.userId)
    }
  })

  const visitorChartData = Object.keys(visitsByDateMap)
    .sort()
    .map((dateKey) => {
      const d = new Date(dateKey + 'T00:00:00')
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        date: dateKey,
        label,
        visits: visitsByDateMap[dateKey].total,
        uniqueUsers: visitsByDateMap[dateKey].uniqueUsers.size,
      }
    })

  // Total All-Time visits
  const totalAllTimeVisits = await (prisma as any).siteVisit.count()

  // Today's visits
  const todayKey = now.toISOString().split('T')[0]
  const todayVisits = visitsByDateMap[todayKey]?.total || 0

  // Total Counts
  const totalUsers = users.length
  const totalAdmins = users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length
  const totalProgressItems = await prisma.userProgress.count()

  return {
    isSuperAdmin: currentUser.role === 'SUPER_ADMIN' || isSuperAdminEmail,
    currentUserRole: currentUser.role,
    metrics: {
      totalUsers,
      totalAdmins,
      totalAllTimeVisits,
      todayVisits,
      totalProgressItems,
    },
    visitorChartData,
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt.toISOString(),
    })),
  }
}

/**
 * Promote or Demote User Role (Only Super Admin can perform this action)
 */
export async function updateUserRole(targetUserId: string, newRole: 'ADMIN' | 'USER') {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!currentUser) {
    return { error: 'Current user not found' }
  }

  const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim())
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || isSuperAdminEmail

  if (!isSuperAdmin) {
    return { error: 'Only the Super Admin can change user roles.' }
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  })

  if (!targetUser) {
    return { error: 'Target user not found' }
  }

  const isTargetSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase().trim())
  if (isTargetSuperAdminEmail) {
    return { error: 'Cannot modify Super Admin account role.' }
  }

  await (prisma.user as any).update({
    where: { id: targetUserId },
    data: { role: newRole },
  })

  revalidatePath('/admin')
  return { success: true, message: `User role updated to ${newRole}` }
}

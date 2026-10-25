'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  Calendar,
  BookOpen,
  Award,
  Search,
  Check,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { updateUserRole } from '@/lib/admin-actions'

type UserItem = {
  id: string
  name: string | null
  email: string
  role: string
  streak: number
  totalScore: number
  createdAt: string
  lastLoginAt: string
  _count: {
    progress: number
    recapItems: number
  }
}

type ChartData = {
  date: string
  label: string
  visits: number
  uniqueUsers: number
}

interface AdminDashboardClientProps {
  initialData: {
    isSuperAdmin: boolean
    currentUserRole: string
    metrics: {
      totalUsers: number
      totalAdmins: number
      totalAllTimeVisits: number
      todayVisits: number
      totalProgressItems: number
    }
    visitorChartData: ChartData[]
    users: UserItem[]
  }
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialData.users)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)
  const [hoveredBar, setHoveredBar] = useState<ChartData | null>(null)
  const [isPending, startTransition] = useTransition()

  const { isSuperAdmin, metrics, visitorChartData } = initialData

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Max visits for chart scale calculation
  const maxVisits = Math.max(...visitorChartData.map((d) => d.visits), 5)

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    setRoleUpdatingId(userId)
    setActionMessage(null)

    startTransition(async () => {
      try {
        const res = await updateUserRole(userId, newRole)
        if (res.error) {
          setActionMessage({ text: res.error, type: 'error' })
        } else {
          setActionMessage({ text: res.message || 'Role updated successfully!', type: 'success' })
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        }
      } catch {
        setActionMessage({ text: 'Failed to update user role.', type: 'error' })
      } finally {
        setRoleUpdatingId(null)
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Welcome & Quick Study Access */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'Super Administrator Access' : 'Administrator Portal'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Control Center & Study Hub
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              You have unrestricted full access. Manage users, track daily site traffic analytics,
              or jump directly into learning modules just like a student.
            </p>
          </div>

          {/* Quick Study Navigation for Super Admin */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/kanji"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-semibold transition border border-white/15 hover:scale-105"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Study Kanji</span>
            </Link>
            <Link
              href="/vocabulary"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-semibold transition border border-white/15 hover:scale-105"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Vocabulary</span>
            </Link>
            <Link
              href="/quiz"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-sm font-semibold transition border border-white/15 hover:scale-105"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Take Quiz</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition hover:opacity-90 shadow-lg"
            >
              <span>Main Home</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {metrics.totalUsers}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">{metrics.totalAdmins}</span>
            <span>Admins registered</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Today&apos;s Traffic
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {metrics.todayVisits}
          </div>
          <div className="text-xs text-muted-foreground">Visits recorded today</div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              All-Time Page Views
            </span>
            <Activity className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {metrics.totalAllTimeVisits}
          </div>
          <div className="text-xs text-muted-foreground">Total logged platform visits</div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Learning Progress</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {metrics.totalProgressItems}
          </div>
          <div className="text-xs text-muted-foreground">Completed items across all users</div>
        </div>
      </div>

      {/* Visitor Analytics Chart Section */}
      <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Daily Visitor Traffic (Last 14 Days)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visual overview of daily visits and active learner activity by date
            </p>
          </div>

          {hoveredBar && (
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{hoveredBar.date}:</span>
              <span className="font-bold text-primary">{hoveredBar.visits} visits</span>
              <span className="text-muted-foreground">({hoveredBar.uniqueUsers} active users)</span>
            </div>
          )}
        </div>

        {/* Bar Chart Visualization */}
        <div className="relative pt-6 pb-2">
          {/* Chart Grid Lines */}
          <div className="h-64 w-full flex items-end gap-2 sm:gap-3 px-2 border-b border-border/80">
            {visitorChartData.map((item) => {
              const heightPercent = Math.max((item.visits / maxVisits) * 100, 6)
              const isHovered = hoveredBar?.date === item.date

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip on hover */}
                  <div
                    className={`absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-popover text-popover-foreground text-xs shadow-lg border border-border transition-all pointer-events-none whitespace-nowrap ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <span className="font-bold">{item.visits} visits</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {item.uniqueUsers} users
                    </span>
                  </div>

                  {/* Count indicator on top of bar */}
                  <span
                    className={`text-[10px] font-semibold mb-1 transition ${
                      item.visits > 0 ? 'text-primary' : 'text-muted-foreground/40'
                    }`}
                  >
                    {item.visits}
                  </span>

                  {/* Visual Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      item.visits > 0
                        ? isHovered
                          ? 'bg-gradient-to-t from-primary to-indigo-400 shadow-md shadow-primary/30'
                          : 'bg-gradient-to-t from-primary/80 to-primary shadow-sm'
                        : 'bg-muted/40 hover:bg-muted/70'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          {/* Date Labels */}
          <div className="flex justify-between gap-2 sm:gap-3 px-2 mt-2">
            {visitorChartData.map((item) => (
              <div key={item.date} className="flex-1 text-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">User & Role Management</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin
                ? 'As Super Admin, you can promote any user to Admin or demote Admins back to regular users.'
                : 'View registered users and their study progress.'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Score & Streak</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Last Active</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 6 : 5}
                    className="py-8 text-center text-muted-foreground text-sm"
                  >
                    No users found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserSuperAdmin = user.role === 'SUPER_ADMIN'
                  const isAdmin = user.role === 'ADMIN'
                  const isUpdating = roleUpdatingId === user.id

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {user.name || 'Unnamed Student'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {isUserSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Sparkles className="w-3 h-3" />
                            <span>Super Admin</span>
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            User
                          </span>
                        )}
                      </td>

                      {/* Score & Progress */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.totalScore} pts</span>
                          <span className="text-xs text-muted-foreground">
                            🔥 {user.streak}d streak
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user._count.progress} completed lessons
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(user.lastLoginAt).toLocaleDateString()}
                      </td>

                      {/* Super Admin Action Controls */}
                      {isSuperAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isUserSuperAdmin ? (
                            <span className="text-xs text-muted-foreground font-medium italic">
                              Owner
                            </span>
                          ) : isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary inline-block" />
                          ) : isAdmin ? (
                            <button
                              onClick={() => handleRoleChange(user.id, 'USER')}
                              disabled={isPending}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-900 transition disabled:opacity-50 cursor-pointer"
                            >
                              Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              disabled={isPending}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary border border-primary/20 transition disabled:opacity-50 cursor-pointer"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

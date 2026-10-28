import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAdminDashboardData } from '@/lib/admin-actions'
import { AdminDashboardClient } from './AdminDashboardClient'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Learn Japanese',
  description: 'Role management and daily traffic analytics',
}

const SUPER_ADMIN_EMAILS = [
  (process.env.SUPER_ADMIN_EMAIL || 'abdullahwebdev15@gmail.com').toLowerCase().trim(),
]

async function AdminContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userEmail = session.user.email?.toLowerCase().trim() || ''
  const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail)
  const userRole = session.user.role || (isSuperAdminEmail ? 'SUPER_ADMIN' : 'USER')

  const hasAccess = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || isSuperAdminEmail

  if (!hasAccess) {
    redirect('/')
  }

  const data = await getAdminDashboardData()

  return <AdminDashboardClient initialData={data} />
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <AdminContent />
      </Suspense>
    </main>
  )
}

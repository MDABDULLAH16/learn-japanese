export const instant = false

import { getCurrentUser } from "@/lib/actions"
import { QuizClient } from "./QuizClient"

export default async function QuizPage() {
  const user = await getCurrentUser()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <QuizClient userId={user.id} />
    </main>
  )
}

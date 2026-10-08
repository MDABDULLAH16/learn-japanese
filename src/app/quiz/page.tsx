export const instant = false

import { getOrCreateMockUser } from "@/lib/actions"
import { QuizClient } from "./QuizClient"

export default async function QuizPage() {
  const user = await getOrCreateMockUser()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <QuizClient userId={user.id} />
    </main>
  )
}

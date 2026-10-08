export const instant = false

import { getCurrentUser, getUserProgress } from "@/lib/actions"
import { AlphabetClient } from "./AlphabetClient"

export default async function AlphabetPage() {
  const user = await getCurrentUser()
  const progress = await getUserProgress(user.id)

  const completedIds = progress.map(p => p.item_id)

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <AlphabetClient userId={user.id} completedIds={completedIds} />
    </main>
  )
}

import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { KanjiPracticeClient } from "./KanjiPracticeClient"

export const instant = false
export default async function KanjiPracticePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <KanjiPracticeClient userId={user.id} />
}

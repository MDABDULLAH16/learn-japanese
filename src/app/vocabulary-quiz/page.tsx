export const instant = false

import { getCurrentUser, getUserRecapItems } from "@/lib/actions"
import { redirect } from "next/navigation"
import { VocabQuizClient } from "./VocabQuizClient"

export default async function VocabularyQuizPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const initialRecaps = await getUserRecapItems(user.id)

  return <VocabQuizClient userId={user.id} initialRecapList={initialRecaps} />
}

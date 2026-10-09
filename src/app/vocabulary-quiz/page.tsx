export const instant = false

import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { VocabQuizClient } from "./VocabQuizClient"

export default async function VocabularyQuizPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <VocabQuizClient userId={user.id} />
}

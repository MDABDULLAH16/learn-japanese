export const instant = false

import { getCurrentUser, getUserRecapItems } from "@/lib/actions"
import { redirect } from "next/navigation"
import { VocabularyClient } from "./VocabularyClient"

export default async function VocabularyPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const initialRecaps = await getUserRecapItems(user.id)

  return <VocabularyClient userId={user.id} initialRecapList={initialRecaps} />
}

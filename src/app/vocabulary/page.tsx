import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { VocabularyClient } from "./VocabularyClient"

export default async function VocabularyPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <VocabularyClient userId={user.id} />
}

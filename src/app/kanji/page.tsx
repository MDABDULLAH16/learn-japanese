import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { KanjiClient } from "./KanjiClient"

export const instant = false
export default async function KanjiPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <KanjiClient userId={user.id} />
}

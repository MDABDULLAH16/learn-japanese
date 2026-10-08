export const instant = false
import { getCurrentUser } from "@/lib/actions"
import ReadingClient from "./ReadingClient"

export default async function ReadingPage() {
  const user = await getCurrentUser()
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight">Reading Practice</h1>
        <p className="text-muted-foreground text-lg mt-2">Practice speaking Japanese and we will verify your reading!</p>
      </header>

      <ReadingClient userId={user.id} />
    </main>
  )
}

export const instant = false
import { getCurrentUser } from "@/lib/actions"
import AlphabetSpeechClient from "./AlphabetSpeechClient"

export default async function AlphabetSpeechPage() {
  const user = await getCurrentUser()
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight">Alphabet Speech Practice</h1>
        <p className="text-muted-foreground text-lg mt-2">Practice speaking Japanese alphabets and verify your pronunciation!</p>
      </header>

      <AlphabetSpeechClient userId={user.id} />
    </main>
  )
}

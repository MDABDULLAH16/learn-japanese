export const instant = false

import { getOrCreateMockUser, getUserProgress } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookA, Trophy, Flame, PlayCircle } from "lucide-react"

export default async function Dashboard() {
  const user = await getOrCreateMockUser()
  const progress = await getUserProgress(user.id)
  
  const hiraganaLearned = progress.filter(p => p.item_type === 'hiragana').length
  const katakanaLearned = progress.filter(p => p.item_type === 'katakana').length
  const totalAlphabets = 46

  const hiraganaProgress = (hiraganaLearned / totalAlphabets) * 100
  const katakanaProgress = (katakanaLearned / totalAlphabets) * 100

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground text-lg mt-2">Ready to continue your Japanese journey?</p>
        </div>
        <div className="flex items-center gap-4 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-bold">
          <Flame className="w-6 h-6" />
          <span>{user.streak} Day Streak</span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quiz Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalScore} XP</div>
            <p className="text-xs text-muted-foreground">Keep practicing to earn more!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiragana Learned</CardTitle>
            <BookA className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiraganaLearned} / {totalAlphabets}</div>
            <Progress value={hiraganaProgress} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Katakana Learned</CardTitle>
            <BookA className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{katakanaLearned} / {totalAlphabets}</div>
            <Progress value={katakanaProgress} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Learning Modules</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/alphabet" className="block group">
          <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <BookA className="w-6 h-6" /> Japanese Alphabet
              </CardTitle>
              <CardDescription>Master the Hiragana and Katakana writing systems.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Interactive grid with Romaji, stroke order simulation, and progress tracking.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/quiz" className="block group">
          <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <PlayCircle className="w-6 h-6" /> Practice & Quiz
              </CardTitle>
              <CardDescription>Test your alphabet knowledge and earn XP.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Multiple-choice quizzes for character recognition and reading practice.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}

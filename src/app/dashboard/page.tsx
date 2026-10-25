export const instant = false

import { getCurrentUser, getUserProgress, getUserRecapItems } from '@/lib/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookA,
  Trophy,
  Flame,
  PlayCircle,
  Mic,
  Languages,
  PenTool,
  Bookmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  GraduationCap,
} from 'lucide-react'

const SUPER_ADMIN_EMAILS = ['abdullahwebdev15@gmail.com', 'abdullahwebdev15@gamil.com']

export default async function StudyDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const userEmail = user.email?.toLowerCase().trim() || ''
  const isSuperAdmin = user.role === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(userEmail)
  const isAdmin = user.role === 'ADMIN' || isSuperAdmin

  const progress = await getUserProgress(user.id)
  const recapItems = await getUserRecapItems(user.id)

  const hiraganaLearned = progress.filter((p) => p.item_type === 'hiragana').length
  const katakanaLearned = progress.filter((p) => p.item_type === 'katakana').length
  const totalAlphabets = 46

  const hiraganaProgress = Math.round((hiraganaLearned / totalAlphabets) * 100)
  const katakanaProgress = Math.round((katakanaLearned / totalAlphabets) * 100)

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 space-y-8 animate-in fade-in duration-300">
      {/* Header & User Profile Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.name || 'Learner'}!
            </h1>
            {isSuperAdmin ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Super Admin
              </span>
            ) : isAdmin ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Admin
              </span>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Track your progress, review saved words, and conquer the JLPT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-3.5 py-2 rounded-xl font-bold text-sm border border-orange-200 dark:border-orange-900">
            <Flame className="w-5 h-5" />
            <span>{user.streak || 0} Day Streak</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total XP / Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{user.totalScore || 0} XP</div>
            <p className="text-xs text-muted-foreground mt-1">Earn points by completing quizzes</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hiragana Mastery
            </CardTitle>
            <BookA className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Learned Characters</span>
              <span>
                {hiraganaLearned} / {totalAlphabets} ({hiraganaProgress}%)
              </span>
            </div>
            <Progress value={hiraganaProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Katakana Mastery
            </CardTitle>
            <BookA className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Learned Characters</span>
              <span>
                {katakanaLearned} / {totalAlphabets} ({katakanaProgress}%)
              </span>
            </div>
            <Progress value={katakanaProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recap notification */}
      {recapItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Spaced Repetition Recap ({recapItems.length} items saved)
              </h4>
              <p className="text-xs text-muted-foreground">
                You have saved vocabulary words ready for review.
              </p>
            </div>
          </div>
          <Link
            href="/vocabulary-quiz"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm shrink-0"
          >
            Practice Recap Quiz
          </Link>
        </div>
      )}

      {/* Learning Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Learning Pathways</h2>
          <span className="text-xs text-muted-foreground">Select a module to continue</span>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/alphabet" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <BookA className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Alphabet Grid
                </CardTitle>
                <CardDescription className="text-xs">
                  Hiragana & Katakana with native audio.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/alphabet-speech" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                  <Mic className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Speech Practice
                </CardTitle>
                <CardDescription className="text-xs">
                  Pronounce kana using speech recognition.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/kanji" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
                  <Languages className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Kanji Library
                </CardTitle>
                <CardDescription className="text-xs">
                  Master JLPT N5–N1 characters and radicals.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/kanji-practice" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit">
                  <PenTool className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Kanji Flashcards
                </CardTitle>
                <CardDescription className="text-xs">
                  3D flashcards for readings and meanings.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/vocabulary" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                  <Languages className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Vocabulary Library
                </CardTitle>
                <CardDescription className="text-xs">
                  Lesson-by-lesson core JLPT vocabulary.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/vocabulary-quiz" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                  <Trophy className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Vocabulary Quiz
                </CardTitle>
                <CardDescription className="text-xs">
                  Multiple-choice drills & recap testing.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/reading" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Reading Practice
                </CardTitle>
                <CardDescription className="text-xs">
                  Read Japanese words aloud with AI check.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/quiz" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
              <CardHeader>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                  Comprehensive Quiz
                </CardTitle>
                <CardDescription className="text-xs">
                  Test kana, words, and earn XP.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  )
}

'use client'

import { useState, useTransition, useEffect, useRef, useSyncExternalStore } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveQuizScore } from '@/lib/actions'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Bookmark,
  Clock,
  Flame,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import confetti from 'canvas-confetti'
import { VOCABULARY_DATA, VocabularyItem, WhitelistLevel } from '@/lib/vocabularyData'
import { useRecapVocabularies, getRecapVocabularies } from '@/lib/recapStorage'

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5)

type Question = {
  vocab: VocabularyItem
  options: VocabularyItem[]
}

type QuizMode = 'ja-bn' | 'bn-ja'

const getWrongOptions = (
  vocab: VocabularyItem,
  allVocabs: VocabularyItem[],
  mode: QuizMode
): VocabularyItem[] => {
  const wrongOptions: VocabularyItem[] = []
  const usedKeys = new Set<string>()

  // Exclude correct answer's key
  const correctKey = mode === 'ja-bn' ? vocab.bangla.trim().toLowerCase() : vocab.nihongo.trim()
  usedKeys.add(correctKey)

  const shuffledPool = shuffle(allVocabs)
  for (const candidate of shuffledPool) {
    if (!candidate.nihongo?.trim() || !candidate.bangla?.trim()) continue

    const key = mode === 'ja-bn' ? candidate.bangla.trim().toLowerCase() : candidate.nihongo.trim()

    if (usedKeys.has(key)) continue

    usedKeys.add(key)
    wrongOptions.push(candidate)

    if (wrongOptions.length === 3) break
  }

  return wrongOptions
}

const emptySubscribe = () => () => {}

export function VocabQuizClient({
  userId,
  initialRecapList,
}: {
  userId: string
  initialRecapList?: VocabularyItem[]
}) {
  const [quizMode, setQuizMode] = useState<QuizMode>('ja-bn')
  const [selectedLesson, setSelectedLesson] = useState<number | 'recap' | null>(null)
  const [recapLevel, setRecapLevel] = useState<'all' | WhitelistLevel>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const lvl = params.get('level') as WhitelistLevel | null
      if (lvl && ['normal', 'medium', 'hard'].includes(lvl)) return lvl
    }
    return 'all'
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [answersHistory, setAnswersHistory] = useState<Record<number, number>>({})
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [, startTransition] = useTransition()
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [mistakesSavedToHard, setMistakesSavedToHard] = useState(false)

  const { recapList, normalList, mediumList, hardList, getItemLevel, setLevel } =
    useRecapVocabularies(initialRecapList, userId)

  const selectedAnswer = answersHistory[currentQuestion]
  const hasAnswered = selectedAnswer !== undefined

  const resetState = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setAnswersHistory({})
    setWrongQuestions([])
  }

  const generateQuiz = (
    lessonNumber: number | 'recap',
    mode: QuizMode = quizMode,
    level: 'all' | WhitelistLevel = recapLevel
  ) => {
    setSelectedLesson(lessonNumber)
    setQuizMode(mode)
    setRecapLevel(level)
    setMistakesSavedToHard(false)

    let selectedVocabs: VocabularyItem[] = []
    if (lessonNumber === 'recap') {
      const recaps = recapList.length > 0 ? recapList : getRecapVocabularies()
      let pool = recaps
      if (level === 'normal') {
        pool = recaps.filter((i) => (i.level || 'normal') === 'normal')
      } else if (level === 'medium') {
        pool = recaps.filter((i) => i.level === 'medium')
      } else if (level === 'hard') {
        pool = recaps.filter((i) => i.level === 'hard')
      }
      if (pool.length === 0) return
      selectedVocabs = shuffle(pool)
    } else {
      const lesson = VOCABULARY_DATA.lessons.find((l) => l.lesson_number === lessonNumber)
      if (!lesson) return
      selectedVocabs = shuffle(lesson.vocabularies)
    }

    // Create pool of all vocabularies to use as wrong options
    const allVocabs = VOCABULARY_DATA.lessons.flatMap((l) => l.vocabularies)

    const generatedQuestions = selectedVocabs.map((vocab) => {
      const wrongVocabs = getWrongOptions(vocab, allVocabs, mode)
      return {
        vocab: vocab,
        options: shuffle([vocab, ...wrongVocabs]),
      }
    })

    setQuestions(generatedQuestions)
    resetState()
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('lesson') === 'recap') {
        const lvlParam = params.get('level') as WhitelistLevel | null
        const targetLvl =
          lvlParam && ['normal', 'medium', 'hard'].includes(lvlParam) ? lvlParam : 'all'

        const recaps =
          initialRecapList && initialRecapList.length > 0
            ? initialRecapList
            : getRecapVocabularies()
        let pool = recaps
        if (targetLvl === 'normal') {
          pool = recaps.filter((i) => (i.level || 'normal') === 'normal')
        } else if (targetLvl === 'medium') {
          pool = recaps.filter((i) => i.level === 'medium')
        } else if (targetLvl === 'hard') {
          pool = recaps.filter((i) => i.level === 'hard')
        }

        if (pool.length >= 4) {
          generateQuiz('recap', 'ja-bn', targetLvl)
        }
      }
    }
  }, [])

  const startMistakesRetry = () => {
    const allVocabs = VOCABULARY_DATA.lessons.flatMap((l) => l.vocabularies)

    const retriedQuestions = wrongQuestions.map((q) => {
      const wrongVocabs = getWrongOptions(q.vocab, allVocabs, quizMode)
      return {
        ...q,
        options: shuffle([q.vocab, ...wrongVocabs]),
      }
    })

    setQuestions(shuffle(retriedQuestions))
    resetState()
  }

  const handleSaveMistakesToHard = () => {
    wrongQuestions.forEach((q) => {
      setLevel(q.vocab, 'hard')
    })
    setMistakesSavedToHard(true)
  }

  const handleAnswer = (index: number) => {
    if (hasAnswered) return
    setAnswersHistory((prev) => ({ ...prev, [currentQuestion]: index }))

    const q = questions[currentQuestion]
    const chosen = q.options[index]
    const isCorrect = chosen.bangla === q.vocab.bangla

    if (isCorrect) {
      setScore((s) => s + 10)
    } else {
      setWrongQuestions((prev) => [...prev, q])
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1)
    } else {
      setShowResults(true)
      if (wrongQuestions.length === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
      startTransition(async () => {
        try {
          await saveQuizScore(userId, score)
        } catch (error) {
          console.error('Failed to save score:', error)
        }
      })
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((c) => c - 1)
    }
  }

  // Swipe support for mobile
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && hasAnswered) {
      handleNext()
    }
    if (isRightSwipe && currentQuestion > 0) {
      handlePrevious()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const handleBackToStart = () => {
    setSelectedLesson(null)
    resetState()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedLesson === null || showResults) return

      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1
        if (!hasAnswered && questions[currentQuestion]?.options[optionIndex]) {
          handleAnswer(optionIndex)
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (hasAnswered) handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLesson, showResults, hasAnswered, currentQuestion, questions])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // SCREEN 1: Lesson Selection
  if (selectedLesson === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 mt-6 md:mt-12 mb-28 md:mb-12 px-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Vocabulary Quiz Challenge</h1>
            <p className="text-muted-foreground mt-1">
              Select a lesson or practice your custom Whitelist by level.
            </p>
          </div>
          <Link href="/vocabulary">
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
              <Bookmark className="w-4 h-4 text-amber-500" /> View Vocabulary
            </Button>
          </Link>
        </div>

        {/* Dedicated Whitelist Quiz Module Card */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 fill-current" />
              </span>
              <div>
                <h3 className="font-bold text-lg">Recap & Whitelist Quiz</h3>
                <p className="text-xs text-muted-foreground">
                  Test only the words you have added to your Whitelist across any device.
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold px-2.5 py-1"
            >
              {recapList.length} Total Saved
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {/* All Whitelist */}
            <Button
              variant="outline"
              disabled={recapList.length < 4}
              onClick={() => recapList.length >= 4 && generateQuiz('recap', quizMode, 'all')}
              className={`h-20 flex flex-col items-center justify-center gap-1 border-amber-500/40 hover:bg-amber-500/10 text-center ${
                recapList.length < 4 ? 'opacity-50 cursor-not-allowed' : 'font-bold'
              }`}
              title={
                recapList.length < 4
                  ? 'Needs at least 4 words in Whitelist'
                  : 'Quiz all Whitelist words'
              }
            >
              <span className="text-sm font-black text-foreground">All Whitelist</span>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                {recapList.length} {recapList.length === 1 ? 'Word' : 'Words'}
              </span>
            </Button>

            {/* Normal */}
            <Button
              variant="outline"
              disabled={normalList.length < 4}
              onClick={() => normalList.length >= 4 && generateQuiz('recap', quizMode, 'normal')}
              className={`h-20 flex flex-col items-center justify-center gap-1 border-emerald-500/40 hover:bg-emerald-500/10 text-center ${
                normalList.length < 4 ? 'opacity-50 cursor-not-allowed' : 'font-bold'
              }`}
              title={
                normalList.length < 4
                  ? 'Needs at least 4 words in Normal'
                  : 'Quiz Normal words (একবার রিভিশন)'
              }
            >
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-sm font-black">Normal</span>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {normalList.length} {normalList.length === 1 ? 'Word' : 'Words'}
              </span>
            </Button>

            {/* Medium */}
            <Button
              variant="outline"
              disabled={mediumList.length < 4}
              onClick={() => mediumList.length >= 4 && generateQuiz('recap', quizMode, 'medium')}
              className={`h-20 flex flex-col items-center justify-center gap-1 border-amber-500/40 hover:bg-amber-500/10 text-center ${
                mediumList.length < 4 ? 'opacity-50 cursor-not-allowed' : 'font-bold'
              }`}
              title={
                mediumList.length < 4
                  ? 'Needs at least 4 words in Medium'
                  : 'Quiz Medium words (মাঝারি)'
              }
            >
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-black">Medium</span>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {mediumList.length} {mediumList.length === 1 ? 'Word' : 'Words'}
              </span>
            </Button>

            {/* Hard */}
            <Button
              variant="outline"
              disabled={hardList.length < 4}
              onClick={() => hardList.length >= 4 && generateQuiz('recap', quizMode, 'hard')}
              className={`h-20 flex flex-col items-center justify-center gap-1 border-rose-500/40 hover:bg-rose-500/10 text-center ${
                hardList.length < 4 ? 'opacity-50 cursor-not-allowed' : 'font-bold'
              }`}
              title={
                hardList.length < 4 ? 'Needs at least 4 words in Hard' : 'Quiz Hard words (কঠিন)'
              }
            >
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-black">Hard</span>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {hardList.length} {hardList.length === 1 ? 'Word' : 'Words'}
              </span>
            </Button>
          </div>
          {recapList.length < 4 && (
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              * Note: Save at least 4 words in any Whitelist category from the Vocabulary section to
              unlock quiz mode.
            </p>
          )}
        </div>

        {/* Regular Lesson Quizzes */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Standard Lessons</h2>
            {/* Quiz Mode Selector */}
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/50">
              <Button
                variant={quizMode === 'ja-bn' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setQuizMode('ja-bn')}
                className="rounded-md transition-all font-semibold text-xs"
              >
                🇯🇵 Japanese ➔ 🇧🇩 Bangla
              </Button>
              <Button
                variant={quizMode === 'bn-ja' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setQuizMode('bn-ja')}
                className="rounded-md transition-all font-semibold text-xs"
              >
                🇧🇩 Bangla ➔ 🇯🇵 Japanese
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {VOCABULARY_DATA.lessons.map((lesson) => (
              <Button
                key={lesson.lesson_number}
                variant="outline"
                className="h-24 flex flex-col gap-1.5 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={() => generateQuiz(lesson.lesson_number, quizMode)}
              >
                <span className="text-2xl font-black">L-{lesson.lesson_number}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  {lesson.vocabularies.length} Words
                </span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // SCREEN 2: Results
  if (showResults) {
    const isPerfect = wrongQuestions.length === 0
    return (
      <Card className="max-w-2xl mx-auto mt-12 text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-primary">+{score} XP</div>
          <div className="inline-block bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm">
            {questions.length - wrongQuestions.length} / {questions.length} Correct
          </div>
          <p className="text-xl text-muted-foreground">
            {isPerfect
              ? 'Flawless victory! You knew every word!'
              : `Great effort! You missed ${wrongQuestions.length} word(s).`}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
            Your XP has been permanently saved to your profile!
          </p>

          {!isPerfect && (
            <div className="pt-2">
              {!mistakesSavedToHard ? (
                <Button
                  variant="outline"
                  onClick={handleSaveMistakesToHard}
                  className="gap-2 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold"
                >
                  <Flame className="w-4 h-4 fill-current text-rose-500" />
                  Save {wrongQuestions.length} Mistakes to Hard Whitelist
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-full animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  Saved {wrongQuestions.length} words to Hard Whitelist!
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
          {!isPerfect && (
            <Button
              onClick={startMistakesRetry}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Retry Mistakes ({wrongQuestions.length})
            </Button>
          )}
          <Button
            onClick={() => selectedLesson && generateQuiz(selectedLesson, quizMode, recapLevel)}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Play Again
          </Button>
          <Button variant="outline" onClick={handleBackToStart}>
            Choose Another Lesson
          </Button>
          <Link href="/">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const currentQLevel = question ? getItemLevel(question.vocab) : null

  const speakJapanese = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!question) return
    const utterance = new SpeechSynthesisUtterance(question.vocab.nihongo)
    utterance.lang = 'ja-JP'
    window.speechSynthesis.speak(utterance)
  }

  // SCREEN 3: Active Quiz
  const progress = questions.length > 0 ? (currentQuestion / questions.length) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-12 mb-28 md:mb-0 space-y-5 px-2 w-full overflow-x-hidden sm:overflow-x-visible">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToStart}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
            {quizMode === 'ja-bn' ? 'JA ➔ BN' : 'BN ➔ JA'}
          </Badge>
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
            {selectedLesson === 'recap'
              ? recapLevel === 'all'
                ? 'Whitelist Quiz'
                : `${recapLevel.toUpperCase()} Whitelist Quiz`
              : `Lesson ${selectedLesson}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              generateQuiz(selectedLesson!, quizMode === 'ja-bn' ? 'bn-ja' : 'ja-bn', recapLevel)
            }
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Switch Quiz Direction"
          >
            Switch
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span className="text-primary font-bold">{score} XP</span>
      </div>

      <Progress value={progress} className="h-2" />

      <Card
        className="overflow-hidden border-2 shadow-sm transition-all duration-300"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardContent className="space-y-6 flex flex-col items-center pt-8">
          <div className="w-full flex flex-col rounded-2xl bg-secondary/10 border overflow-hidden">
            {/* Top Bar with Quiz Actions (Never overlaps text) */}
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-secondary/25 dark:bg-zinc-900/40 border-b border-border/40 select-none">
              <div>
                {quizMode === 'ja-bn' && question.vocab.kanji ? (
                  <Badge
                    variant="outline"
                    className="text-xs py-0.5 px-2.5 font-bold text-primary bg-background shadow-2xs"
                  >
                    漢字 {question.vocab.kanji}
                  </Badge>
                ) : (
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {quizMode === 'ja-bn' ? 'Japanese Word' : 'Bangla Meaning'}
                  </span>
                )}
              </div>

              {/* Pronunciation & 3-step Whitelist Action Buttons together */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/70 shadow-2xs">
                {/* Normal */}
                <button
                  type="button"
                  onClick={() => setLevel(question.vocab, 'normal')}
                  title={
                    currentQLevel === 'normal'
                      ? 'Normal (Click to remove)'
                      : 'Add to Normal: একবার রিভিশন'
                  }
                  aria-label="Normal: quick review"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentQLevel === 'normal'
                      ? 'bg-emerald-500 text-white shadow-xs scale-105 ring-1 ring-emerald-400'
                      : 'text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/15'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => setLevel(question.vocab, 'medium')}
                  title={
                    currentQLevel === 'medium'
                      ? 'Medium (Click to remove)'
                      : 'Add to Medium: মাঝারি প্র্যাকটিস'
                  }
                  aria-label="Medium: moderate practice"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentQLevel === 'medium'
                      ? 'bg-amber-500 text-white shadow-xs scale-105 ring-1 ring-amber-400'
                      : 'text-muted-foreground/60 hover:text-amber-600 hover:bg-amber-500/15'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>

                {/* Hard */}
                <button
                  type="button"
                  onClick={() => setLevel(question.vocab, 'hard')}
                  title={
                    currentQLevel === 'hard' ? 'Hard (Click to remove)' : 'Add to Hard: কঠিন শব্দ'
                  }
                  aria-label="Hard: needs focus"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentQLevel === 'hard'
                      ? 'bg-rose-500 text-white shadow-xs scale-105 ring-1 ring-rose-400'
                      : 'text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/15'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                </button>

                <div className="h-3.5 w-px bg-border/60 mx-0.5 shrink-0" />

                {/* Pronounce on far right */}
                <button
                  type="button"
                  className="h-7 w-7 rounded-full flex items-center justify-center text-primary/75 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                  onClick={speakJapanese}
                  title="Listen to pronunciation"
                  aria-label="Listen to pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Text Box */}
            <div
              onClick={speakJapanese}
              className="p-6 sm:p-8 text-center w-full flex flex-col items-center justify-center min-h-[140px] cursor-pointer group/q transition-colors hover:bg-secondary/15 select-none"
              title="Click to hear Japanese audio"
            >
              <h2
                className={`font-black text-primary leading-tight drop-shadow-sm break-words whitespace-normal px-2 ${
                  quizMode === 'ja-bn'
                    ? question.vocab.nihongo.length > 5
                      ? 'text-4xl sm:text-6xl'
                      : 'text-5xl sm:text-7xl'
                    : 'text-3xl sm:text-5xl'
                }`}
              >
                {quizMode === 'ja-bn' ? question.vocab.nihongo : question.vocab.bangla}
              </h2>
            </div>
          </div>

          {hasAnswered && quizMode === 'ja-bn' && (
            <div className="w-full text-center space-y-1 bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in fade-in zoom-in-95">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Romaji / Pronunciation
              </span>
              <p className="text-lg font-bold text-primary">
                {question.vocab.romaji || ''}
                {question.vocab.uchharon ? (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    ({question.vocab.uchharon})
                  </span>
                ) : null}
              </p>
            </div>
          )}

          {hasAnswered && quizMode === 'bn-ja' && (
            <div className="w-full flex items-center justify-center gap-3 bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in fade-in zoom-in-95">
              <Button
                variant="ghost"
                size="icon"
                onClick={speakJapanese}
                className="h-9 w-9 text-primary/70 hover:text-primary rounded-full bg-primary/10"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
              <div className="text-left">
                <span className="text-xs font-bold text-muted-foreground uppercase block">
                  Japanese Reading
                </span>
                <p className="text-base font-bold text-primary">
                  {question.vocab.romaji}{' '}
                  {question.vocab.uchharon ? `(${question.vocab.uchharon})` : ''}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx
              const isCorrect = option.bangla === question.vocab.bangla

              let btnVariant: 'outline' | 'default' | 'destructive' = 'outline'
              let borderClass = 'border-border'

              if (hasAnswered) {
                if (isCorrect) {
                  btnVariant = 'default'
                  borderClass = 'border-green-600 bg-green-600 hover:bg-green-600 text-white'
                } else if (isSelected) {
                  btnVariant = 'destructive'
                  borderClass = 'border-destructive bg-destructive text-destructive-foreground'
                }
              }

              return (
                <Button
                  key={idx}
                  variant={btnVariant}
                  className={`h-auto min-h-[4rem] text-left p-4 justify-between border-2 transition-all ${borderClass}`}
                  onClick={() => handleAnswer(idx)}
                  disabled={hasAnswered}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg font-bold">
                      {quizMode === 'ja-bn' ? option.bangla : option.nihongo}
                    </span>
                    {quizMode === 'bn-ja' && option.kanji && (
                      <span className="text-xs text-muted-foreground">{option.kanji}</span>
                    )}
                  </div>
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 shrink-0" />
                  )}
                </Button>
              )
            })}
          </div>

          <div className="w-full flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={!hasAnswered} className="gap-2">
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}{' '}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

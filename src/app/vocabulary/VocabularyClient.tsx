'use client'

import { useState, useEffect, useRef } from 'react'
import { VOCABULARY_DATA, Lesson, VocabularyItem, WhitelistLevel } from '@/lib/vocabularyData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  X,
  Trophy,
  Bookmark,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ListFilter,
} from 'lucide-react'
import { useRecapVocabularies } from '@/lib/recapStorage'

export function VocabularyClient({
  userId,
  initialRecapList,
}: {
  userId: string
  initialRecapList?: VocabularyItem[]
}) {
  const [selectedLesson, setSelectedLesson] = useState<number | 'recap'>(
    VOCABULARY_DATA.lessons[0].lesson_number
  )
  const [recapCategory, setRecapCategory] = useState<'all' | WhitelistLevel>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showScrollLessonBar, setShowScrollLessonBar] = useState(false)
  const lastScrollY = useRef(0)
  const stickyLessonsRef = useRef<HTMLDivElement>(null)
  const mainLessonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY.current

      // When near top (<= 160px), hide sticky bar & floating up button
      if (currentScrollY <= 160) {
        setShowScrollLessonBar(false)
      } else if (diff < -8) {
        // User scrolled UP -> show sticky bar and floating up button
        setShowScrollLessonBar(true)
      } else if (diff > 8) {
        // User scrolled DOWN -> hide sticky bar and floating up button
        setShowScrollLessonBar(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-center selected lesson button in scroll containers
  useEffect(() => {
    if (stickyLessonsRef.current) {
      const activeBtn = stickyLessonsRef.current.querySelector<HTMLElement>('[data-active="true"]')
      if (activeBtn) {
        const container = stickyLessonsRef.current
        const scrollLeft =
          activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
    if (mainLessonsRef.current) {
      const activeBtn = mainLessonsRef.current.querySelector<HTMLElement>('[data-active="true"]')
      if (activeBtn) {
        const container = mainLessonsRef.current
        const scrollLeft =
          activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
  }, [selectedLesson])

  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' })
    }
  }

  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY * 1.2
    }
  }

  const { recapList, normalList, mediumList, hardList, getItemLevel, setLevel, clear } =
    useRecapVocabularies(initialRecapList, userId)

  const currentLesson =
    typeof selectedLesson === 'number'
      ? VOCABULARY_DATA.lessons.find((l) => l.lesson_number === selectedLesson) ||
        VOCABULARY_DATA.lessons[0]
      : null

  const totalVocabularies = VOCABULARY_DATA.lessons.reduce(
    (acc, lesson) => acc + lesson.vocabularies.length,
    0
  )

  const displayedRecapList =
    recapCategory === 'all'
      ? recapList
      : recapCategory === 'normal'
        ? normalList
        : recapCategory === 'medium'
          ? mediumList
          : hardList

  const handleSelectLesson = (lesson: number | 'recap') => {
    setSelectedLesson(lesson)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full">
      {/* Sticky Floating Lesson Navbar on Scroll UP */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-background/90 dark:bg-background/95 backdrop-blur-md border-b border-border/80 shadow-md shadow-black/5 dark:shadow-black/20 transition-all duration-300 ease-out ${
          showScrollLessonBar
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5">
          {/* Active Lesson indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Lesson:
            </span>
            <Badge
              variant="secondary"
              className="font-bold text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 shrink-0"
            >
              {selectedLesson === 'recap' ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Bookmark className="w-3 h-3 fill-current" /> Recap ({recapList.length})
                </span>
              ) : (
                <span>Lesson {selectedLesson}</span>
              )}
            </Badge>
          </div>

          {/* Left Arrow Button for Sticky Lessons */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            onClick={() => scrollContainer(stickyLessonsRef, 'left')}
            title="Scroll Lessons Left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Horizontal scrollable lesson buttons */}
          <div
            ref={stickyLessonsRef}
            onWheel={handleHorizontalWheel}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5 px-1 flex-1 scroll-smooth"
          >
            <Button
              variant={selectedLesson === 'recap' ? 'default' : 'outline'}
              size="sm"
              data-active={selectedLesson === 'recap'}
              onClick={() => handleSelectLesson('recap')}
              className={`h-7 px-2.5 text-xs rounded-full whitespace-nowrap shrink-0 gap-1 font-semibold transition-all ${
                selectedLesson === 'recap'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-1 ring-amber-500/40'
                  : 'border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${selectedLesson === 'recap' ? 'fill-current' : ''}`} />
              Recap ({recapList.length})
            </Button>

            <div className="h-4 w-px bg-border/60 mx-0.5 shrink-0" />

            {VOCABULARY_DATA.lessons.map((lesson) => {
              const isActive = selectedLesson === lesson.lesson_number
              return (
                <Button
                  key={`sticky_lesson_${lesson.lesson_number}`}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  data-active={isActive}
                  onClick={() => handleSelectLesson(lesson.lesson_number)}
                  className={`h-7 px-2.5 text-xs rounded-full whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'font-bold shadow-sm ring-1 ring-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  L-{lesson.lesson_number}
                </Button>
              )
            })}
          </div>

          {/* Right Arrow Button for Sticky Lessons */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            onClick={() => scrollContainer(stickyLessonsRef, 'right')}
            title="Scroll Lessons Right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Quick Quiz */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={
                selectedLesson === 'recap'
                  ? '/vocabulary-quiz?lesson=recap'
                  : `/vocabulary-quiz?lesson=${selectedLesson}`
              }
            >
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs font-semibold gap-1 text-primary border-primary/20 hover:bg-primary/10"
                title="Start Quiz"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Quiz</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full overflow-x-hidden sm:overflow-x-visible">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold tracking-tight">Vocabulary Practice</h1>
              <Badge
                variant="secondary"
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              >
                Total: {totalVocabularies}
              </Badge>
              <button
                onClick={() => setSelectedLesson('recap')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                title="Click to view Recap & Whitelist"
              >
                <Bookmark className="w-3 h-3 fill-current" />
                Whitelist: {recapList.length}
              </button>
            </div>
            <p className="text-muted-foreground mt-1">
              Learn new words and classify them into Normal, Medium, or Hard for tailored revision.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {recapList.length >= 4 && (
              <Link href="/vocabulary-quiz?lesson=recap">
                <Button
                  variant="outline"
                  className="gap-2 shadow-sm font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <Bookmark className="w-4 h-4 fill-current" /> Whitelist Quiz ({recapList.length})
                </Button>
              </Link>
            )}
            <Link href="/vocabulary-quiz">
              <Button className="gap-2 shadow-sm font-semibold">
                <Trophy className="w-4 h-4 text-amber-300" /> Vocabulary Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Lesson Selector Bar with Left/Right Scroll Controls */}
        <div className="flex items-center gap-1.5 w-full max-w-full">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline pr-1">
            Select Lesson:
          </span>

          {/* Left Arrow Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shadow-xs"
            onClick={() => scrollContainer(mainLessonsRef, 'left')}
            title="Scroll Lessons Left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Scrollable container */}
          <div
            ref={mainLessonsRef}
            onWheel={handleHorizontalWheel}
            className="flex items-center gap-2 overflow-x-auto pb-3 pt-2 scrollbar-hide snap-x w-full max-w-full px-1 scroll-smooth"
          >
            {/* Dedicated Recap / Whitelist Lesson Button */}
            <Button
              variant={selectedLesson === 'recap' ? 'default' : 'outline'}
              size="sm"
              data-active={selectedLesson === 'recap'}
              onClick={() => setSelectedLesson('recap')}
              className={`rounded-full snap-start whitespace-nowrap flex-shrink-0 gap-1.5 transition-all font-semibold ${
                selectedLesson === 'recap'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-2 ring-amber-500/30'
                  : 'border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${selectedLesson === 'recap' ? 'fill-current' : ''}`}
              />
              Recap & Whitelist
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedLesson === 'recap'
                    ? 'bg-black/20 text-white'
                    : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                }`}
              >
                {recapList.length}
              </span>
            </Button>

            <div className="h-5 w-px bg-border/60 mx-1 flex-shrink-0" />

            {VOCABULARY_DATA.lessons.map((lesson) => {
              const isActive = selectedLesson === lesson.lesson_number
              return (
                <Button
                  key={lesson.lesson_number}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  data-active={isActive}
                  onClick={() => setSelectedLesson(lesson.lesson_number)}
                  className={`rounded-full snap-start whitespace-nowrap flex-shrink-0 transition-all ${
                    isActive ? 'font-bold shadow-sm' : ''
                  }`}
                >
                  Lesson {lesson.lesson_number} ({lesson.vocabularies.length})
                </Button>
              )
            })}
          </div>

          {/* Right Arrow Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shadow-xs"
            onClick={() => scrollContainer(mainLessonsRef, 'right')}
            title="Scroll Lessons Right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="mt-6">
          {selectedLesson === 'recap' ? (
            <div className="space-y-6">
              {/* Recap Lesson Banner */}
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-7 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Bookmark className="h-4 w-4 fill-current" />
                      </span>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Recap & Whitelist Library
                      </h2>
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold px-2.5 py-0.5"
                      >
                        {recapList.length} Total Words
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Every vocabulary card has 3 level icons:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Normal
                      </strong>{' '}
                      (একবার রিভিশন),{' '}
                      <strong className="text-amber-600 dark:text-amber-400 font-semibold">
                        Medium
                      </strong>{' '}
                      (মাঝারি), and{' '}
                      <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                        Hard
                      </strong>{' '}
                      (কঠিন). Practice each section separately below. All items are synced to your
                      database across devices.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {displayedRecapList.length >= 4 && (
                      <Link
                        href={`/vocabulary-quiz?lesson=recap${recapCategory !== 'all' ? `&level=${recapCategory}` : ''}`}
                      >
                        <Button
                          size="sm"
                          className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-200" /> Quiz{' '}
                          {recapCategory === 'all' ? 'All' : recapCategory.toUpperCase()} (
                          {displayedRecapList.length})
                        </Button>
                      </Link>
                    )}

                    {displayedRecapList.length > 0 &&
                      (!showClearConfirm ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowClearConfirm(true)}
                          className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear{' '}
                          {recapCategory === 'all' ? 'All' : recapCategory.toUpperCase()}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-1 rounded-lg animate-in zoom-in-95">
                          <span className="text-xs text-destructive font-medium px-1">
                            Clear {displayedRecapList.length} {recapCategory} words?
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2.5 text-xs font-semibold"
                            onClick={() => {
                              clear(recapCategory === 'all' ? undefined : recapCategory)
                              setShowClearConfirm(false)
                            }}
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setShowClearConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 3 Interactive Quick Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-amber-500/15">
                  {/* Normal Stat Card */}
                  <button
                    type="button"
                    onClick={() => setRecapCategory('normal')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      recapCategory === 'normal'
                        ? 'bg-emerald-500/15 border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-background/60 hover:bg-emerald-500/5 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          Normal
                        </div>
                        <div className="text-[11px] text-muted-foreground">একবার রিভিশন</div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-extrabold text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {normalList.length}
                    </Badge>
                  </button>

                  {/* Medium Stat Card */}
                  <button
                    type="button"
                    onClick={() => setRecapCategory('medium')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      recapCategory === 'medium'
                        ? 'bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-background/60 hover:bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          Medium
                        </div>
                        <div className="text-[11px] text-muted-foreground">মাঝারি প্র্যাকটিস</div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-extrabold text-xs px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    >
                      {mediumList.length}
                    </Badge>
                  </button>

                  {/* Hard Stat Card */}
                  <button
                    type="button"
                    onClick={() => setRecapCategory('hard')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      recapCategory === 'hard'
                        ? 'bg-rose-500/15 border-rose-500/50 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-background/60 hover:bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 fill-current" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                          Hard
                        </div>
                        <div className="text-[11px] text-muted-foreground">কঠিন / বিশেষ মনোযোগ</div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-extrabold text-xs px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                    >
                      {hardList.length}
                    </Badge>
                  </button>
                </div>
              </div>

              {/* Whitelist Practice Filter Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-border/60">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                  <Button
                    size="sm"
                    variant={recapCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setRecapCategory('all')}
                    className={`rounded-full h-8 text-xs font-semibold gap-1.5 transition-all ${
                      recapCategory === 'all' ? 'bg-foreground text-background' : ''
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    All Whitelist ({recapList.length})
                  </Button>

                  <Button
                    size="sm"
                    variant={recapCategory === 'normal' ? 'default' : 'outline'}
                    onClick={() => setRecapCategory('normal')}
                    className={`rounded-full h-8 text-xs font-semibold gap-1.5 transition-all ${
                      recapCategory === 'normal'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-500/40 shadow-xs'
                        : 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Normal ({normalList.length})
                  </Button>

                  <Button
                    size="sm"
                    variant={recapCategory === 'medium' ? 'default' : 'outline'}
                    onClick={() => setRecapCategory('medium')}
                    className={`rounded-full h-8 text-xs font-semibold gap-1.5 transition-all ${
                      recapCategory === 'medium'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white ring-1 ring-amber-500/40 shadow-xs'
                        : 'border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Medium ({mediumList.length})
                  </Button>

                  <Button
                    size="sm"
                    variant={recapCategory === 'hard' ? 'default' : 'outline'}
                    onClick={() => setRecapCategory('hard')}
                    className={`rounded-full h-8 text-xs font-semibold gap-1.5 transition-all ${
                      recapCategory === 'hard'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-1 ring-rose-500/40 shadow-xs'
                        : 'border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Hard ({hardList.length})
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground font-medium">
                  Showing{' '}
                  <span className="font-bold text-foreground">{displayedRecapList.length}</span>{' '}
                  {recapCategory === 'all' ? 'saved' : recapCategory} words
                </div>
              </div>

              {/* Empty State vs List */}
              {displayedRecapList.length === 0 ? (
                <div className="text-center py-16 px-6 border border-dashed rounded-2xl bg-secondary/10 flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    {recapCategory === 'normal' ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    ) : recapCategory === 'medium' ? (
                      <Clock className="w-8 h-8 text-amber-500" />
                    ) : recapCategory === 'hard' ? (
                      <Flame className="w-8 h-8 text-rose-500 fill-current" />
                    ) : (
                      <Bookmark className="w-8 h-8 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-xl font-bold">
                      {recapCategory === 'all'
                        ? 'No words in Whitelist yet'
                        : `No words in "${recapCategory.toUpperCase()}" Whitelist yet`}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {recapCategory === 'all'
                        ? 'Browse any lesson and click Normal 🟢, Medium 🟡, or Hard 🔴 on any card to add it to your Whitelist!'
                        : `Mark words with the ${recapCategory.toUpperCase()} icon on any card to practice them specifically in this section!`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {recapCategory !== 'all' && (
                      <Button variant="outline" size="sm" onClick={() => setRecapCategory('all')}>
                        View All Whitelist ({recapList.length})
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedLesson(VOCABULARY_DATA.lessons[0].lesson_number)}
                      className="font-semibold"
                    >
                      <BookOpen className="w-4 h-4 mr-1.5" /> Start with Lesson{' '}
                      {VOCABULARY_DATA.lessons[0].lesson_number}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedRecapList.map((vocab, index) => (
                    <LearnCard
                      key={`recap_${vocab.nihongo}_${vocab.bangla}_${index}`}
                      vocab={vocab}
                      index={index}
                      total={displayedRecapList.length}
                      currentLevel={getItemLevel(vocab)}
                      onSetLevel={setLevel}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <LearnSection
                lesson={currentLesson!}
                getItemLevel={getItemLevel}
                onSetLevel={setLevel}
              />

              {/* Bottom Lesson Navigation Card */}
              {typeof selectedLesson === 'number' && (
                <div className="p-6 rounded-2xl border border-border/80 bg-gradient-to-br from-secondary/40 via-card to-secondary/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20 shrink-0">
                      {selectedLesson}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Lesson {selectedLesson} Complete!</h3>
                      <p className="text-xs text-muted-foreground">
                        Completed all {currentLesson?.vocabularies.length || 0} words in this lesson
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    {selectedLesson > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectLesson(selectedLesson - 1)}
                        className="gap-1 font-semibold text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev Lesson
                      </Button>
                    )}

                    <Link href={`/vocabulary-quiz?lesson=${selectedLesson}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 font-semibold text-xs border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        Quiz Lesson {selectedLesson}
                      </Button>
                    </Link>

                    {selectedLesson < VOCABULARY_DATA.lessons.length && (
                      <Button
                        size="sm"
                        onClick={() => handleSelectLesson(selectedLesson + 1)}
                        className="gap-1 font-semibold text-xs bg-primary text-primary-foreground shadow-sm"
                      >
                        Next Lesson ({selectedLesson + 1})
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground ml-1"
                      title="Back to Top"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      Top
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Up Scroll Button on bottom-right (shows ONLY when scrolling UP) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-2xl bg-primary text-primary-foreground flex items-center justify-center transition-all duration-300 border border-primary/20 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 group ${
          showScrollLessonBar
            ? 'translate-y-0 opacity-100 pointer-events-auto scale-100'
            : 'translate-y-16 opacity-0 pointer-events-none scale-75'
        }`}
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
      </button>
    </div>
  )
}

function LearnSection({
  lesson,
  getItemLevel,
  onSetLevel,
}: {
  lesson: Lesson
  getItemLevel: (vocab: VocabularyItem) => WhitelistLevel | null
  onSetLevel: (vocab: VocabularyItem, level: WhitelistLevel) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lesson.vocabularies.map((vocab, index) => (
        <LearnCard
          key={`${vocab.nihongo}_${vocab.bangla}_${index}`}
          vocab={vocab}
          index={index}
          total={lesson.vocabularies.length}
          currentLevel={getItemLevel(vocab)}
          onSetLevel={onSetLevel}
        />
      ))}
    </div>
  )
}

function LearnCard({
  vocab,
  index,
  total,
  currentLevel,
  onSetLevel,
}: {
  vocab: VocabularyItem
  index: number
  total: number
  currentLevel: WhitelistLevel | null
  onSetLevel: (vocab: VocabularyItem, level: WhitelistLevel) => void
}) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [showKanjiModal, setShowKanjiModal] = useState(false)
  const [showModalRomaji, setShowModalRomaji] = useState(false)

  const speakJapanese = (e: React.MouseEvent) => {
    e.stopPropagation()
    const utterance = new SpeechSynthesisUtterance(vocab.nihongo)
    utterance.lang = 'ja-JP'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      <Card className="p-0 py-0 pt-0 gap-0 overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md hover:border-primary/50 group flex flex-col w-full relative [--card-spacing:0px]">
        <CardContent className="p-0 flex-1 flex flex-col w-full">
          <div className="pt-2.5 px-3.5 sm:px-4 pb-4 sm:pb-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-secondary/30 to-secondary/10 relative border-b w-full">
            {/* Top Row: Kanji on Left, Action Pill on Right (Natural flow - Never overlaps text!) */}
            <div className="w-full flex items-center justify-between min-h-[30px] mb-1.5 z-10">
              {vocab.kanji ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowModalRomaji(false)
                    setShowKanjiModal(true)
                  }}
                  className="hover:scale-105 transition-transform cursor-pointer"
                  title="View Kanji Details"
                >
                  <Badge
                    variant="secondary"
                    className="text-xs sm:text-sm px-2.5 py-1 h-auto bg-background/90 backdrop-blur-md shadow-sm border-primary/20 font-bold cursor-pointer hover:bg-primary/10"
                  >
                    {vocab.kanji}
                  </Badge>
                </button>
              ) : (
                <div />
              )}

              {/* Top-Right Action Controls: 3 Whitelist Level Icons + Audio Pronunciation on the far right */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/70 shadow-xs">
                {/* Normal Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetLevel(vocab, 'normal')
                  }}
                  title={
                    currentLevel === 'normal'
                      ? 'Normal (Click to remove from Whitelist)'
                      : 'Add to Normal: একবার রিভিশন করলেই হবে'
                  }
                  aria-label="Normal: quick review"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentLevel === 'normal'
                      ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/15'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${currentLevel === 'normal' ? 'stroke-[2.5]' : ''}`}
                  />
                </button>

                {/* Medium Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetLevel(vocab, 'medium')
                  }}
                  title={
                    currentLevel === 'medium'
                      ? 'Medium (Click to remove from Whitelist)'
                      : 'Add to Medium: মাঝারি প্র্যাকটিস প্রয়োজন'
                  }
                  aria-label="Medium: moderate practice"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentLevel === 'medium'
                      ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-amber-600 hover:bg-amber-500/15'
                  }`}
                >
                  <Clock
                    className={`w-3.5 h-3.5 ${currentLevel === 'medium' ? 'stroke-[2.5]' : ''}`}
                  />
                </button>

                {/* Hard Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetLevel(vocab, 'hard')
                  }}
                  title={
                    currentLevel === 'hard'
                      ? 'Hard (Click to remove from Whitelist)'
                      : 'Add to Hard: কঠিন, বারবার প্র্যাকটিস লাগবে'
                  }
                  aria-label="Hard: needs practice"
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentLevel === 'hard'
                      ? 'bg-rose-500 text-white shadow-xs ring-1 ring-rose-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/15'
                  }`}
                >
                  <Flame
                    className={`w-3.5 h-3.5 ${currentLevel === 'hard' ? 'fill-white stroke-[2.5]' : ''}`}
                  />
                </button>

                <div className="h-4 w-px bg-border/60 mx-0.5 shrink-0" />

                {/* Audio pronunciation on the far right */}
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

            {/* Centered Japanese Word */}
            <div className="w-full flex-1 flex items-center justify-center py-2">
              <h3 className="text-5xl sm:text-6xl font-black text-primary mb-2 text-center drop-shadow-sm break-words whitespace-normal px-2 leading-tight">
                {vocab.nihongo}
              </h3>
            </div>
          </div>

          <div className="p-5 flex-1 bg-card flex flex-col justify-between">
            <div className="space-y-4">
              {/* Pronunciation Section */}
              <div className="space-y-2">
                {!showPronunciation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => setShowPronunciation(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" /> Reveal Pronunciation
                  </Button>
                ) : (
                  <div className="space-y-2 p-3 bg-secondary/30 rounded-lg animate-in zoom-in-95 duration-200 border border-secondary">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Romaji
                      </span>
                      <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-foreground">
                        {vocab.romaji}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Uchharon
                      </span>
                      <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-primary">
                        {vocab.uchharon}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 uppercase tracking-widest cursor-pointer"
                      onClick={() => setShowPronunciation(false)}
                    >
                      <EyeOff className="w-3 h-3 mr-1" /> Hide
                    </Button>
                  </div>
                )}
              </div>

              {/* Meaning Section with Modern Hover Title Tag / Tooltip */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                {!showMeaning ? (
                  <div className="relative group/meaning-tooltip w-full">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-primary transition-all font-medium cursor-pointer"
                      onClick={() => setShowMeaning(true)}
                      title={`${vocab.bangla} (${vocab.english})`}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Reveal Meaning
                    </Button>

                    {/* Modern Floating Hover Meaning Tooltip / Title Tag */}
                    <div
                      role="tooltip"
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-auto min-w-[200px] max-w-[280px] pointer-events-none z-30
                               opacity-0 scale-95 translate-y-1 group-hover/meaning-tooltip:opacity-100 group-hover/meaning-tooltip:scale-100 group-hover/meaning-tooltip:translate-y-0
                               transition-all duration-200 ease-out"
                    >
                      <div className="relative px-3.5 py-2.5 rounded-xl bg-popover/95 dark:bg-zinc-900/95 backdrop-blur-md border border-primary/30 shadow-xl shadow-black/20 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Meaning Preview</span>
                        </div>
                        <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 leading-tight">
                          {vocab.bangla}
                        </div>
                        <div className="text-xs font-medium text-foreground/80 leading-tight mt-0.5">
                          {vocab.english}
                        </div>
                        {/* Downward triangle arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-popover/95 dark:bg-zinc-900/95 border-r border-b border-primary/30" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-primary/5 rounded-lg animate-in zoom-in-95 duration-200 border border-primary/10">
                    <div>
                      <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">
                        Bangla
                      </span>
                      <span className="text-base font-bold text-blue-700 dark:text-blue-400 leading-tight">
                        {vocab.bangla}
                      </span>
                    </div>
                    <div className="h-px w-full bg-primary/10 my-1"></div>
                    <div>
                      <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">
                        English
                      </span>
                      <span className="text-sm font-medium text-foreground/80 leading-tight">
                        {vocab.english}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-primary/10 uppercase tracking-widest cursor-pointer"
                      onClick={() => setShowMeaning(false)}
                    >
                      <EyeOff className="w-3 h-3 mr-1" /> Hide
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Numbering Footer at the bottom */}
          <div className="px-5 py-2.5 flex items-center justify-between text-xs border-t border-border/40 bg-muted/20 rounded-b-2xl">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              WORD
            </span>
            <span className="font-bold text-xs text-foreground/80 bg-background/80 px-2 py-0.5 rounded-full border border-border/60 shadow-2xs">
              {index + 1} / {total}
            </span>
          </div>
        </CardContent>
      </Card>

      {showKanjiModal && vocab.kanji && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowKanjiModal(false)}
        >
          <Card
            className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/10 border-b flex flex-col items-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKanjiModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <h2
                className="text-7xl font-black text-primary mb-4 mt-2 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
                onClick={() => setShowModalRomaji(!showModalRomaji)}
                title="Click Kanji to toggle Romaji spelling"
              >
                {vocab.kanji}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-muted-foreground">{vocab.nihongo}</p>
              </div>

              {/* 3 Whitelist Level Pill Buttons + Audio Pronunciation on far right */}
              <div className="mt-3 flex items-center gap-1 p-1 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/70 shadow-xs">
                <button
                  type="button"
                  onClick={() => onSetLevel(vocab, 'normal')}
                  title={
                    currentLevel === 'normal'
                      ? 'Normal (Click to remove)'
                      : 'Add to Normal: একবার রিভিশন'
                  }
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    currentLevel === 'normal'
                      ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/15'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetLevel(vocab, 'medium')}
                  title={
                    currentLevel === 'medium'
                      ? 'Medium (Click to remove)'
                      : 'Add to Medium: মাঝারি প্র্যাকটিস'
                  }
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    currentLevel === 'medium'
                      ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-amber-600 hover:bg-amber-500/15'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetLevel(vocab, 'hard')}
                  title={
                    currentLevel === 'hard' ? 'Hard (Click to remove)' : 'Add to Hard: কঠিন শব্দ'
                  }
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    currentLevel === 'hard'
                      ? 'bg-rose-500 text-white shadow-xs ring-1 ring-rose-400/60 scale-105'
                      : 'text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/15'
                  }`}
                >
                  <Flame className="w-4 h-4 fill-current" />
                </button>

                <div className="h-4 w-px bg-border/60 mx-0.5" />

                <button
                  type="button"
                  className="h-8 w-8 text-primary/75 hover:text-primary rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                  onClick={speakJapanese}
                  title="Listen Pronunciation"
                  aria-label="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">
                    Bangla
                  </p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{vocab.bangla}</p>
                </div>

                <div
                  className="bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center group select-none relative overflow-hidden"
                  onClick={() => setShowModalRomaji(!showModalRomaji)}
                  title={showModalRomaji ? 'Click to hide Romaji' : 'Click to show Romaji'}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Romaji
                    </p>
                    <div className="h-4 w-4 flex items-center justify-center text-muted-foreground/70 group-hover:text-primary transition-colors">
                      {showModalRomaji ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                  {showModalRomaji ? (
                    <p className="font-extrabold text-foreground text-base tracking-wide animate-in fade-in zoom-in-95 duration-150">
                      {vocab.romaji}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5 py-0.5 px-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>Click to show</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary/60 mb-1.5">
                  English Meaning
                </p>
                <p className="font-semibold text-foreground/90">{vocab.english}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

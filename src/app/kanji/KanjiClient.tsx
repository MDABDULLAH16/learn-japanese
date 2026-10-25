'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { KANJI_DATA, KanjiItem } from '@/lib/kanjiData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  PenTool,
  Volume2,
  Eye,
  EyeOff,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Flame,
  ListFilter,
  Sparkles,
} from 'lucide-react'
import { useRecapKanji } from '@/lib/kanjiRecapStorage'
import { KanjiRecapItem } from '@/lib/actions'
import { WhitelistLevel } from '@/lib/vocabularyData'

export function KanjiClient({
  userId,
  initialLevel = 'N5',
  initialLesson = 1,
  initialRecapList,
}: {
  userId: string
  initialLevel?: 'N5' | 'N4'
  initialLesson?: number | 'recap'
  initialRecapList?: KanjiRecapItem[]
}) {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4'>(initialLevel)
  const [selectedLesson, setSelectedLesson] = useState<number | 'recap'>(initialLesson)
  const [recapCategory, setRecapCategory] = useState<'all' | WhitelistLevel>('all')
  const [shownReadings, setShownReadings] = useState<Set<string>>(new Set())
  const [shownMeanings, setShownMeanings] = useState<Set<string>>(new Set())
  const [showScrollLessonBar, setShowScrollLessonBar] = useState(false)

  const stickyLessonsRef = useRef<HTMLDivElement>(null)
  const mainLessonsRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  const { recapList, normalList, mediumList, hardList, getItemLevel, setLevel } =
    useRecapKanji(initialRecapList, userId)

  // Scroll listener: shows sticky lesson bar when scrolling UP
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY.current

      if (currentScrollY <= 160) {
        setShowScrollLessonBar(false)
      } else if (diff < -8) {
        setShowScrollLessonBar(true)
      } else if (diff > 8) {
        setShowScrollLessonBar(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-center selected lesson button in scroll containers
  useEffect(() => {
    const centerButton = (container: HTMLElement | null) => {
      if (!container) return
      const activeBtn = container.querySelector<HTMLElement>('[data-active="true"]')
      if (activeBtn) {
        const scrollLeft =
          activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }

    centerButton(stickyLessonsRef.current)
    centerButton(mainLessonsRef.current)
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

  const handleSelectLesson = (lesson: number | 'recap') => {
    setSelectedLesson(lesson)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleReading = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShownReadings((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleMeaning = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShownMeanings((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Get unique lessons for the selected level
  const lessons = useMemo(
    () =>
      Array.from(
        new Set(KANJI_DATA.filter((k) => k.level === selectedLevel).map((k) => k.lesson))
      ).sort((a, b) => a - b),
    [selectedLevel]
  )

  // Map whitelisted kanji IDs to full KanjiItem objects
  const kanjiMap = useMemo(() => {
    const map = new Map<string, KanjiItem>()
    for (const item of KANJI_DATA) {
      map.set(item.id, item)
    }
    return map
  }, [])

  // Filtered kanji list for current view
  const displayedKanjiList = useMemo(() => {
    if (selectedLesson === 'recap') {
      const targetList =
        recapCategory === 'all'
          ? recapList
          : recapCategory === 'normal'
            ? normalList
            : recapCategory === 'medium'
              ? mediumList
              : hardList

      return targetList
        .map((recapItem) => kanjiMap.get(recapItem.id))
        .filter((k): k is KanjiItem => Boolean(k))
    }

    return KANJI_DATA.filter((k) => k.level === selectedLevel && k.lesson === selectedLesson)
  }, [selectedLesson, recapCategory, recapList, normalList, mediumList, hardList, kanjiMap, selectedLevel])

  const totalLevelKanji = useMemo(
    () => KANJI_DATA.filter((k) => k.level === selectedLevel).length,
    [selectedLevel]
  )

  const speakJapanese = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!text) return
    const cleanText = text
      .replace(/\([^)]*\)/g, '')
      .replace(/[-~、。,]/g, '')
      .trim()
    if (!cleanText) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      utterance.pitch = 1.0
      const voices = window.speechSynthesis.getVoices()
      const jpVoice =
        voices.find((v) => v.lang === 'ja-JP' && v.name.includes('Google')) ||
        voices.find((v) => v.lang === 'ja-JP' && !v.name.toLowerCase().includes('espeak')) ||
        voices.find((v) => v.lang === 'ja-JP') ||
        voices.find((v) => v.lang.startsWith('ja'))
      if (jpVoice) utterance.voice = jpVoice
      window.speechSynthesis.speak(utterance)
    }
  }

  const extractKana = (reading: string): string => {
    const firstReading = reading.split(',')[0].trim()
    return firstReading.replace(/\([^)]*\)/g, '').trim() || reading
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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5">
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

            {lessons.map((lessonNum) => {
              const isActive = selectedLesson === lessonNum
              return (
                <Button
                  key={`sticky_lesson_${lessonNum}`}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  data-active={isActive}
                  onClick={() => handleSelectLesson(lessonNum)}
                  className={`h-7 px-2.5 text-xs rounded-full whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'font-bold shadow-sm ring-1 ring-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  L-{lessonNum}
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

          {/* Quick Practice Shortcut */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/kanji-practice">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs font-semibold gap-1 text-primary border-primary/20 hover:bg-primary/10"
                title="Practice Kanji"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Practice</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full">
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
              <h1 className="text-3xl font-extrabold tracking-tight">Dedicated Kanji</h1>
              <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Total: {totalLevelKanji} Kanji
              </Badge>
              <button
                onClick={() => handleSelectLesson('recap')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                title="Click to view Whitelist / Recap"
              >
                <Bookmark className="w-3 h-3 fill-current" />
                Whitelist: {recapList.length}
              </button>
            </div>
            <p className="text-muted-foreground mt-1">
              Learn individual Kanji characters, stroke mnemonics, and classify them into difficulty levels for revision.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {recapList.length > 0 && (
              <Button
                variant={selectedLesson === 'recap' ? 'default' : 'outline'}
                onClick={() => handleSelectLesson('recap')}
                className="gap-2 shadow-sm font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Bookmark className="w-4 h-4 fill-current" /> Whitelist Recap ({recapList.length})
              </Button>
            )}
            <Link href="/kanji-practice">
              <Button className="w-full sm:w-auto shadow-sm gap-2 font-semibold">
                <PenTool className="w-4 h-4" /> Kanji Practice
              </Button>
            </Link>
          </div>
        </div>

        {/* JLPT Level selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide w-full max-w-full">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">
            JLPT Level:
          </span>
          <Button
            variant={selectedLevel === 'N5' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedLevel('N5')
              if (selectedLesson !== 'recap') setSelectedLesson(1)
            }}
            className="rounded-full"
          >
            N5 (Beginner)
          </Button>
          <Button
            variant={selectedLevel === 'N4' ? 'default' : 'outline'}
            size="sm"
            disabled
            className="rounded-full opacity-60 cursor-not-allowed"
            title="Coming in the next update!"
          >
            N4 (Coming Soon)
          </Button>
        </div>

        {/* Lesson Selector Bar with Left/Right Scroll Controls & Recap Button */}
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

          {/* Horizontal scrollable lesson buttons */}
          <div
            ref={mainLessonsRef}
            onWheel={handleHorizontalWheel}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 flex-1 scroll-smooth"
          >
            {/* Whitelist / Recap Tab Button */}
            <Button
              variant={selectedLesson === 'recap' ? 'default' : 'outline'}
              size="sm"
              data-active={selectedLesson === 'recap'}
              onClick={() => handleSelectLesson('recap')}
              className={`rounded-full shrink-0 gap-1.5 font-bold transition-all ${
                selectedLesson === 'recap'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-2 ring-amber-500/30'
                  : 'border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${selectedLesson === 'recap' ? 'fill-current' : ''}`} />
              Recap ({recapList.length})
            </Button>

            <div className="h-5 w-px bg-border/60 mx-1 shrink-0" />

            {/* Individual Lesson Buttons */}
            {lessons.map((lessonNum) => {
              const isActive = selectedLesson === lessonNum
              return (
                <Button
                  key={`lesson_${lessonNum}`}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  data-active={isActive}
                  onClick={() => handleSelectLesson(lessonNum)}
                  className={`rounded-full shrink-0 transition-all font-semibold ${
                    isActive ? 'font-bold shadow-xs ring-2 ring-primary/30' : ''
                  }`}
                >
                  Lesson {lessonNum}
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

        {/* RECAP VIEW: When selectedLesson === 'recap' */}
        {selectedLesson === 'recap' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Whitelist Overview Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Bookmark className="w-5 h-5 fill-current" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Kanji Whitelist & Recap
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your personal practice list for difficult or important Kanji. Filter by difficulty level below.
                  </p>
                </div>
              </div>

              {/* 3 Difficulty Level Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Normal Card */}
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
                      <div className="text-[11px] text-muted-foreground">একবার রিভিশন করলেই হবে</div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-extrabold text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    {normalList.length}
                  </Badge>
                </button>

                {/* Medium Card */}
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
                      <div className="text-[11px] text-muted-foreground">মাঝারি প্র্যাকটিস প্রয়োজন</div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-extrabold text-xs px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  >
                    {mediumList.length}
                  </Badge>
                </button>

                {/* Hard Card */}
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

            {/* Filter Tabs */}
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
                Showing <span className="font-bold text-foreground">{displayedKanjiList.length}</span>{' '}
                {recapCategory === 'all' ? 'saved' : recapCategory} Kanji
              </div>
            </div>

            {/* Empty State */}
            {displayedKanjiList.length === 0 && (
              <div className="text-center py-16 px-6 border border-dashed rounded-2xl bg-secondary/10 flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Bookmark className="w-8 h-8 fill-current" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">No Kanji in this category yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Browse any lesson and click on the Normal, Medium, or Hard pill buttons on a Kanji card to add it to your Whitelist!
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSelectLesson(1)}
                  className="rounded-full gap-2 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Go to Lesson 1
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Kanji Cards Grid */}
        {displayedKanjiList.length > 0 && (
          <div className="mt-4">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayedKanjiList.map((kanji) => {
                const isReadingShown = shownReadings.has(kanji.id)
                const isMeaningShown = shownMeanings.has(kanji.id)
                const currentLevel = getItemLevel(kanji.id)
                const kunReading = kanji.kunyomi[0] ? extractKana(kanji.kunyomi[0]) : ''
                const onReading = kanji.onyomi[0] ? extractKana(kanji.onyomi[0]) : ''
                const readingDisplay = [kunReading, onReading].filter(Boolean).join(' / ')

                return (
                  <Card
                    key={kanji.id}
                    className="overflow-hidden border border-border/70 transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 group cursor-pointer bg-card hover:bg-secondary/15 relative flex flex-col items-center justify-between p-3.5 min-h-[195px]"
                    onClick={() =>
                      router.push(
                        `/kanji/${kanji.id}?level=${selectedLevel}&lesson=${
                          selectedLesson === 'recap' ? kanji.lesson : selectedLesson
                        }`
                      )
                    }
                  >
                    {/* Card Header: Lesson badge (if recap) + 3 Whitelist Level Pill Buttons */}
                    <div className="w-full flex items-center justify-between gap-1 mb-1">
                      {selectedLesson === 'recap' ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold px-1.5 py-0.5 bg-muted/80 text-muted-foreground"
                        >
                          L-{kanji.lesson}
                        </Badge>
                      ) : (
                        <div />
                      )}

                      {/* 3 Whitelist Action Pills */}
                      <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/70 shadow-2xs ml-auto">
                        {/* Normal Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLevel(kanji, 'normal')
                          }}
                          title={
                            currentLevel === 'normal'
                              ? 'Normal (Click to remove)'
                              : 'Add to Normal: একবার রিভিশন'
                          }
                          aria-label="Normal level"
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            currentLevel === 'normal'
                              ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/60 scale-105'
                              : 'text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-500/15'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3 h-3 ${currentLevel === 'normal' ? 'stroke-[2.5]' : ''}`}
                          />
                        </button>

                        {/* Medium Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLevel(kanji, 'medium')
                          }}
                          title={
                            currentLevel === 'medium'
                              ? 'Medium (Click to remove)'
                              : 'Add to Medium: মাঝারি প্র্যাকটিস'
                          }
                          aria-label="Medium level"
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            currentLevel === 'medium'
                              ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-400/60 scale-105'
                              : 'text-muted-foreground/50 hover:text-amber-600 hover:bg-amber-500/15'
                          }`}
                        >
                          <Clock
                            className={`w-3 h-3 ${currentLevel === 'medium' ? 'stroke-[2.5]' : ''}`}
                          />
                        </button>

                        {/* Hard Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLevel(kanji, 'hard')
                          }}
                          title={
                            currentLevel === 'hard'
                              ? 'Hard (Click to remove)'
                              : 'Add to Hard: কঠিন, বারবার প্র্যাকটিস'
                          }
                          aria-label="Hard level"
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            currentLevel === 'hard'
                              ? 'bg-rose-500 text-white shadow-xs ring-1 ring-rose-400/60 scale-105'
                              : 'text-muted-foreground/50 hover:text-rose-600 hover:bg-rose-500/15'
                          }`}
                        >
                          <Flame
                            className={`w-3 h-3 ${currentLevel === 'hard' ? 'fill-white stroke-[2.5]' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Main Content: Kanji character, Kun/On Reading, and Bangla Meaning */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full py-1 text-center">
                      {/* Kanji character */}
                      <h3 className="text-5xl sm:text-6xl font-black text-primary drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {kanji.kanji}
                      </h3>

                      {/* Kunyomi / Onyomi reading (toggleable) */}
                      {isReadingShown && (
                        <p className="text-sm font-bold text-foreground truncate tracking-wide animate-in fade-in duration-150 w-full px-1 mt-1">
                          {readingDisplay || '—'}
                        </p>
                      )}

                      {/* Bangla Meaning (toggleable) */}
                      {isMeaningShown && (
                        <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 text-center truncate w-full px-1 mt-0.5 animate-in fade-in duration-150">
                          {kanji.meaning_bn}
                        </p>
                      )}
                    </div>

                    {/* Bottom Controls: Pronounce Buttons (訓, 音) + Show/Hide Toggles (রিডিং, অর্থ) */}
                    <div className="flex flex-col items-center gap-1.5 mt-2 w-full shrink-0">
                      {/* Pronounce buttons */}
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        {kanji.kunyomi.length > 0 && (
                          <button
                            type="button"
                            className="flex items-center justify-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 active:scale-95 transition-all shadow-2xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              speakJapanese(kanji.kunyomi[0], e)
                            }}
                            title={`Kunyomi: ${kanji.kunyomi[0]}`}
                          >
                            <Volume2 className="w-3 h-3" /> 訓
                          </button>
                        )}
                        {kanji.onyomi.length > 0 && (
                          <button
                            type="button"
                            className="flex items-center justify-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all shadow-2xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              speakJapanese(kanji.onyomi[0], e)
                            }}
                            title={`Onyomi: ${kanji.onyomi[0]}`}
                          >
                            <Volume2 className="w-3 h-3" /> 音
                          </button>
                        )}
                      </div>

                      {/* Reading and Meaning Show/Hide Toggles */}
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <button
                          type="button"
                          className={`flex items-center justify-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all ${
                            isReadingShown
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={(e) => toggleReading(kanji.id, e)}
                          title={
                            isReadingShown ? 'Hide reading (রিডিং লুকান)' : 'Show reading (রিডিং দেখান)'
                          }
                        >
                          {isReadingShown ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          <span>রিডিং</span>
                        </button>

                        <button
                          type="button"
                          className={`flex items-center justify-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all ${
                            isMeaningShown
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={(e) => toggleMeaning(kanji.id, e)}
                          title={
                            isMeaningShown ? 'Hide meaning (অর্থ লুকান)' : 'Show meaning (অর্থ দেখান)'
                          }
                        >
                          {isMeaningShown ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          <span>অর্থ</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

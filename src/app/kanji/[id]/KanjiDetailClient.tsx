'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { KANJI_DATA, KanjiItem } from '@/lib/kanjiData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Lightbulb,
  Sparkles,
  Languages,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react'
import { kanaToRomaji } from '@/lib/romaji'
import { useRecapKanji } from '@/lib/kanjiRecapStorage'

export function KanjiDetailClient({
  initialKanji,
  initialLevel,
  initialLesson,
  userId,
}: {
  initialKanji: KanjiItem
  initialLevel: 'N5' | 'N4'
  initialLesson: number
  userId: string
}) {
  const router = useRouter()
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem>(initialKanji)

  const { getItemLevel, setLevel } = useRecapKanji(undefined, userId)
  const currentLevel = getItemLevel(selectedKanji.id)

  const filteredKanji = useMemo(
    () => KANJI_DATA.filter((k) => k.level === initialLevel && k.lesson === initialLesson),
    [initialLevel, initialLesson]
  )

  const currentIndex = useMemo(
    () => filteredKanji.findIndex((k) => k.id === selectedKanji.id),
    [filteredKanji, selectedKanji.id]
  )

  const navigateToKanji = useCallback(
    (target: KanjiItem) => {
      setSelectedKanji(target)
      window.history.replaceState(
        null,
        '',
        `/kanji/${target.id}?level=${initialLevel}&lesson=${initialLesson}`
      )
    },
    [initialLevel, initialLesson]
  )

  const handlePrevKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex > 0) {
      navigateToKanji(filteredKanji[currentIndex - 1])
    } else {
      navigateToKanji(filteredKanji[filteredKanji.length - 1])
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, filteredKanji, navigateToKanji])

  const handleNextKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex >= 0 && currentIndex < filteredKanji.length - 1) {
      navigateToKanji(filteredKanji[currentIndex + 1])
    } else {
      navigateToKanji(filteredKanji[0])
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, filteredKanji, navigateToKanji])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(`/kanji?level=${initialLevel}&lesson=${initialLesson}`)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevKanji()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextKanji()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevKanji, handleNextKanji, router, initialLevel, initialLesson])

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 pb-28 sm:pb-10 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href={`/kanji?level=${initialLevel}&lesson=${initialLesson}`}
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Kanji List
        </Link>

        {/* Level, Lesson & Index Badge */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-bold border-primary/30 text-primary px-3 py-1 text-xs">
            {selectedKanji.level} • Lesson {selectedKanji.lesson}
          </Badge>
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Kanji {currentIndex >= 0 ? currentIndex + 1 : 1} of {filteredKanji.length}
          </span>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevKanji}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm rounded-full gap-1 hover:bg-secondary"
              title="Previous Kanji (← Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextKanji}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm rounded-full gap-1 hover:bg-secondary"
              title="Next Kanji (→ Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Detail Card Container */}
      <Card className="bg-card text-card-foreground border border-border/80 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
          {/* Left Column: Kanji Hero & Mnemonic */}
          <div className="lg:col-span-5 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-border/60 bg-gradient-to-b from-secondary/35 via-secondary/10 to-background flex flex-col justify-between p-6 lg:p-8 space-y-6">
            <div className="space-y-6">
              {/* Hero Kanji Card */}
              <div className="flex flex-col items-center text-center p-6 bg-card/60 backdrop-blur-xs rounded-2xl border border-border/60 shadow-xs relative">
                <div className="relative mb-3 flex items-center justify-center">
                  <h1 className="text-8xl sm:text-9xl font-black text-primary tracking-tight select-none drop-shadow-sm">
                    {selectedKanji.kanji}
                  </h1>
                </div>

                {/* Pronounce Main Kanji Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 text-primary font-bold border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-xs mb-3"
                  onClick={(e) => speakJapanese(selectedKanji.kanji, e)}
                  title="Pronounce Kanji"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen Pronunciation
                </Button>

                {/* Whitelist Level Pill Buttons */}
                <div className="flex items-center gap-1 p-1 rounded-full bg-background/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border/70 shadow-xs mb-4">
                  <button
                    type="button"
                    onClick={() => setLevel(selectedKanji, 'normal')}
                    title={
                      currentLevel === 'normal'
                        ? 'Normal (Click to remove from Whitelist)'
                        : 'Add to Normal: একবার রিভিশন করলেই হবে'
                    }
                    className={`h-7 px-2.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      currentLevel === 'normal'
                        ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/60 scale-105'
                        : 'text-muted-foreground/70 hover:text-emerald-600 hover:bg-emerald-500/15'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLevel(selectedKanji, 'medium')}
                    title={
                      currentLevel === 'medium'
                        ? 'Medium (Click to remove from Whitelist)'
                        : 'Add to Medium: মাঝারি প্র্যাকটিস প্রয়োজন'
                    }
                    className={`h-7 px-2.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      currentLevel === 'medium'
                        ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-400/60 scale-105'
                        : 'text-muted-foreground/70 hover:text-amber-600 hover:bg-amber-500/15'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Medium</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLevel(selectedKanji, 'hard')}
                    title={
                      currentLevel === 'hard'
                        ? 'Hard (Click to remove from Whitelist)'
                        : 'Add to Hard: কঠিন, বারবার প্র্যাকটিস লাগবে'
                    }
                    className={`h-7 px-2.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      currentLevel === 'hard'
                        ? 'bg-rose-500 text-white shadow-xs ring-1 ring-rose-400/60 scale-105'
                        : 'text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/15'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${currentLevel === 'hard' ? 'fill-white' : ''}`} />
                    <span>Hard</span>
                  </button>
                </div>

                {/* Meanings */}
                <div className="space-y-1 w-full">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {selectedKanji.meaning_en}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {selectedKanji.meaning_bn}
                  </p>
                </div>

                {/* Quick Readings Summary */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-4 pt-4 border-t border-border/50 w-full text-xs">
                  {selectedKanji.kunyomi.length > 0 && (
                    <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                      <span className="font-bold mr-1">Kun:</span>
                      {selectedKanji.kunyomi.join(', ')}
                    </div>
                  )}
                  {selectedKanji.onyomi.length > 0 && (
                    <div className="bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full font-medium">
                      <span className="font-bold mr-1">On:</span>
                      {selectedKanji.onyomi.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Mnemonic / Hint Box */}
              {selectedKanji.mnemonic && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Mnemonic / মনে রাখার উপায়
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                    {selectedKanji.mnemonic}
                  </p>
                </div>
              )}
            </div>

            {/* Left Column Footer Helper */}
            <div className="hidden lg:flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground font-medium">
              <span>← / → arrows to browse</span>
              <span>Esc to go back</span>
            </div>
          </div>

          {/* Right Column: Detailed Readings, Vocabulary & Sentences */}
          <div className="lg:col-span-7 xl:col-span-8 flex-1 p-5 sm:p-6 lg:p-8 space-y-8 bg-card/40">
            {/* 1. Readings Breakdown (Kunyomi & Onyomi side-by-side) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <Languages className="w-5 h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold">
                  Readings & Pronunciation (読み方)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {/* Kunyomi (Japanese) */}
                <div className="bg-blue-500/5 p-4 sm:p-5 rounded-2xl border border-blue-500/25 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">
                        訓読み • Kunyomi (Japanese)
                      </span>
                    </div>

                    {selectedKanji.kun_yomi_new ? (
                      <div className="space-y-3">
                        {selectedKanji.kun_yomi_new.reading && (
                          <div className="flex items-center gap-2">
                            <p className="font-black text-xl text-foreground">
                              {selectedKanji.kun_yomi_new.reading}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-600 rounded-full hover:bg-blue-500/10 shrink-0"
                              onClick={(e) =>
                                speakJapanese(
                                  extractKana(selectedKanji.kun_yomi_new!.reading),
                                  e
                                )
                              }
                              title="Kunyomi উচ্চারণ শুনুন"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                        {selectedKanji.kun_yomi_new.examples &&
                          selectedKanji.kun_yomi_new.examples.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {selectedKanji.kun_yomi_new.examples.map((ex, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-2.5 bg-background/80 rounded-xl border border-border/60 hover:border-blue-500/40 transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-lg text-primary">
                                        {ex.word}
                                      </span>
                                      <span className="text-xs text-muted-foreground font-semibold">
                                        ({ex.reading})
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {ex.meaning_bn}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-blue-500/10 shrink-0"
                                    onClick={(e) => speakJapanese(extractKana(ex.reading), e)}
                                    title="উচ্চারণ শুনুন"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedKanji.kunyomi.length > 0 ? (
                          selectedKanji.kunyomi.map((k, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 bg-background font-bold text-sm px-3 py-1.5 rounded-lg border border-border/60 text-foreground"
                            >
                              <span>{k}</span>
                              <span className="text-muted-foreground font-medium text-xs">
                                ({kanaToRomaji(k)})
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full -mr-1"
                                onClick={(e) => speakJapanese(k, e)}
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm italic">None</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Onyomi (Chinese) */}
                <div className="bg-rose-500/5 p-4 sm:p-5 rounded-2xl border border-rose-500/25 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-rose-600 dark:text-rose-400">
                        音読み • Onyomi (Chinese)
                      </span>
                    </div>

                    {selectedKanji.on_yomi_new ? (
                      <div className="space-y-3">
                        {selectedKanji.on_yomi_new.reading && (
                          <div className="flex items-center gap-2">
                            <p className="font-black text-xl text-foreground">
                              {selectedKanji.on_yomi_new.reading}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-600 rounded-full hover:bg-rose-500/10 shrink-0"
                              onClick={(e) =>
                                speakJapanese(
                                  extractKana(selectedKanji.on_yomi_new!.reading),
                                  e
                                )
                              }
                              title="Onyomi উচ্চারণ শুনুন"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                        {selectedKanji.on_yomi_new.examples &&
                          selectedKanji.on_yomi_new.examples.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {selectedKanji.on_yomi_new.examples.map((ex, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-2.5 bg-background/80 rounded-xl border border-border/60 hover:border-rose-500/40 transition-colors"
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-lg text-primary">
                                        {ex.word}
                                      </span>
                                      <span className="text-xs text-muted-foreground font-semibold">
                                        ({ex.reading})
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {ex.meaning_bn}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-rose-500/10 shrink-0"
                                    onClick={(e) => speakJapanese(extractKana(ex.reading), e)}
                                    title="উচ্চারণ শুনুন"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedKanji.onyomi.length > 0 ? (
                          selectedKanji.onyomi.map((o, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 bg-background font-bold text-sm px-3 py-1.5 rounded-lg border border-border/60 text-foreground"
                            >
                              <span>{o}</span>
                              <span className="text-muted-foreground font-medium text-xs">
                                ({kanaToRomaji(o)})
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full -mr-1"
                                onClick={(e) => speakJapanese(o, e)}
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm italic">None</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vocabulary Examples (Words using this Kanji) */}
            {selectedKanji.examples.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-base sm:text-lg font-bold">
                      Vocabulary Words (関連語彙)
                    </h2>
                  </div>
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {selectedKanji.examples.length} words
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {selectedKanji.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex flex-col justify-between p-3.5 bg-secondary/20 hover:bg-secondary/35 rounded-xl border border-border/60 transition-all hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-2xl text-primary">{ex.word}</span>
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold px-2 py-0.5 bg-background/60"
                          >
                            {ex.reading}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full bg-background/70 hover:bg-background shadow-xs shrink-0"
                          onClick={(e) => speakJapanese(ex.reading, e)}
                          title="Listen"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-foreground">{ex.meaning_en}</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {ex.meaning_bn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Example Sentences */}
            {selectedKanji.sentences.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base sm:text-lg font-bold">Example Sentences (例文)</h2>
                  </div>
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {selectedKanji.sentences.length} sentences
                  </Badge>
                </div>

                <div className="space-y-3.5">
                  {selectedKanji.sentences.map((sent, i) => (
                    <div
                      key={i}
                      className="p-4 sm:p-5 bg-card/90 rounded-2xl border border-border/80 shadow-xs relative hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 pr-2">
                          <p className="font-bold text-lg sm:text-xl text-foreground tracking-wide leading-relaxed">
                            {sent.japanese}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {sent.romaji}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-primary rounded-full bg-background shrink-0 shadow-xs hover:scale-105 transition-transform"
                          onClick={(e) => speakJapanese(sent.japanese, e)}
                          title="Pronounce sentence"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="h-px w-full bg-border/60 my-3"></div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-muted-foreground">
                          {sent.english}
                        </p>
                        <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {sent.bangla}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* In-flow Bottom Navigation for Mobile & Desktop */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevKanji}
          className="flex-1 sm:flex-initial h-12 px-6 rounded-xl font-bold gap-2 hover:bg-secondary transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous Kanji</span>
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span>Kanji {currentIndex >= 0 ? currentIndex + 1 : 1} of {filteredKanji.length}</span>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={handleNextKanji}
          className="flex-1 sm:flex-initial h-12 px-6 rounded-xl font-bold gap-2 transition-all active:scale-95 shadow-sm"
        >
          <span>Next Kanji</span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Sticky Bottom Navigation Bar for Mobile Devices */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-2xl sm:hidden flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevKanji}
          className="flex-1 h-11 rounded-xl font-bold gap-1 text-sm active:scale-95 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </Button>

        <div className="flex flex-col items-center justify-center px-2 shrink-0">
          <span className="text-xl font-black text-primary leading-tight">
            {selectedKanji.kanji}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {currentIndex >= 0 ? currentIndex + 1 : 1} / {filteredKanji.length}
          </span>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleNextKanji}
          className="flex-1 h-11 rounded-xl font-bold gap-1 text-sm active:scale-95 shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

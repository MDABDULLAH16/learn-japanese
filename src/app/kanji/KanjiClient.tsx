'use client'

import { useState, useEffect, useCallback } from 'react'
import { KANJI_DATA, KanjiItem } from '@/lib/kanjiData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  PenTool, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  Lightbulb, 
  Sparkles, 
  Languages 
} from 'lucide-react'
import { kanaToRomaji } from '@/lib/romaji'

export function KanjiClient({ userId }: { userId: string }) {
  const [selectedLevel, setSelectedLevel] = useState<"N5" | "N4">("N5")
  const [selectedLesson, setSelectedLesson] = useState<number>(1)
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const filteredKanji = KANJI_DATA.filter(k => k.level === selectedLevel && k.lesson === selectedLesson)
  
  // Get unique lessons for the selected level
  const lessons = Array.from(new Set(KANJI_DATA.filter(k => k.level === selectedLevel).map(k => k.lesson))).sort((a, b) => a - b)

  const currentIndex = selectedKanji ? filteredKanji.findIndex(k => k.id === selectedKanji.id) : -1

  const handlePrevKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex > 0) {
      setSelectedKanji(filteredKanji[currentIndex - 1])
    } else {
      setSelectedKanji(filteredKanji[filteredKanji.length - 1])
    }
  }, [currentIndex, filteredKanji])

  const handleNextKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex >= 0 && currentIndex < filteredKanji.length - 1) {
      setSelectedKanji(filteredKanji[currentIndex + 1])
    } else {
      setSelectedKanji(filteredKanji[0])
    }
  }, [currentIndex, filteredKanji])

  // Keyboard navigation
  useEffect(() => {
    if (!selectedKanji) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          setSelectedKanji(null)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevKanji()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextKanji()
      } else if (e.key === 'f' || e.key === 'F') {
        // Toggle fullscreen only when not typing in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsFullscreen(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [selectedKanji, isFullscreen, handlePrevKanji, handleNextKanji])

  const speakJapanese = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!text) return
    // Extract only kana/kanji — strip romaji in parentheses and special chars
    const cleanText = text
      .replace(/\([^)]*\)/g, '')  // remove (romaji) parts
      .replace(/[-~、。,]/g, '')   // remove separators
      .trim()
    if (!cleanText) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      utterance.pitch = 1.0
      // Pick the best Japanese voice available
      const voices = window.speechSynthesis.getVoices()
      const jpVoice = 
        voices.find(v => v.lang === 'ja-JP' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'ja-JP' && !v.name.toLowerCase().includes('espeak')) ||
        voices.find(v => v.lang === 'ja-JP') ||
        voices.find(v => v.lang.startsWith('ja'))
      if (jpVoice) utterance.voice = jpVoice
      window.speechSynthesis.speak(utterance)
    }
  }

  // Helper: extract first kana from reading string like "ふた (futa)" or "イチ (ichi), イツ (itsu)"
  const extractKana = (reading: string): string => {
    // Take only up to first comma (for multiple readings), then strip romaji in ()
    const firstReading = reading.split(',')[0].trim()
    return firstReading.replace(/\([^)]*\)/g, '').trim() || reading
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Dedicated Kanji</h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Total {filteredKanji.length} Kanji
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Learn individual Kanji characters, meanings, readings, and stroke mnemonics.</p>
        </div>
        
        <Link href="/kanji-practice">
          <Button className="w-full sm:w-auto shadow-sm gap-2">
            <PenTool className="w-4 h-4" /> Kanji Practice
          </Button>
        </Link>
      </div>

      {/* JLPT Level selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">JLPT Level:</span>
        <Button
          variant={selectedLevel === "N5" ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedLevel("N5")
            setSelectedKanji(null)
          }}
          className="rounded-full flex-shrink-0"
        >
          N5 (Basic)
        </Button>
        <Button
          variant={selectedLevel === "N4" ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLevel("N4")}
          className="rounded-full flex-shrink-0 opacity-50 cursor-not-allowed"
          title="Coming in the next update!"
        >
          N4 (Coming Soon)
        </Button>
      </div>

      {/* Lessons Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">Lesson:</span>
        {lessons.length > 0 ? lessons.map(lessonNum => (
          <Button
            key={lessonNum}
            variant={selectedLesson === lessonNum ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedLesson(lessonNum)
              setSelectedKanji(null)
            }}
            className="rounded-full flex-shrink-0"
          >
            Lesson {lessonNum}
          </Button>
        )) : (
          <span className="text-sm text-muted-foreground italic">No lessons available</span>
        )}
      </div>

      {/* Kanji Cards Grid */}
      <div className="mt-4">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredKanji.map((kanji) => (
            <Card 
              key={kanji.id}
              className="overflow-hidden border border-border/70 transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 group cursor-pointer flex flex-col justify-center items-center p-5 aspect-square bg-card hover:bg-secondary/15 relative"
              onClick={() => setSelectedKanji(kanji)}
            >
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Details</Badge>
              </div>
              <h3 className="text-5xl sm:text-6xl font-black text-primary mb-2 drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
                {kanji.kanji}
              </h3>
              <p className="text-sm font-semibold text-foreground text-center truncate w-full px-1">
                {kanji.meaning_en}
              </p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 text-center truncate w-full px-1 mt-0.5">
                {kanji.meaning_bn}
              </p>
              {/* Kunyomi & Onyomi quick-listen buttons */}
              <div className="flex items-center gap-2 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {kanji.kunyomi.length > 0 && (
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all min-h-[32px]"
                    onClick={(e) => { e.stopPropagation(); speakJapanese(kanji.kunyomi[0], e) }}
                    title={`Kunyomi: ${kanji.kunyomi[0]}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> 訓
                  </button>
                )}
                {kanji.onyomi.length > 0 && (
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 active:scale-95 transition-all min-h-[32px]"
                    onClick={(e) => { e.stopPropagation(); speakJapanese(kanji.onyomi[0], e) }}
                    title={`Onyomi: ${kanji.onyomi[0]}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> 音
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Fullscreen / Large Screen Kanji Details Modal */}
      {selectedKanji && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'} bg-background/85 backdrop-blur-md animate-in fade-in-50 duration-200`}
          onClick={() => { setSelectedKanji(null); setIsFullscreen(false); }}
        >
          <div 
            className={`bg-card text-card-foreground border border-border/80 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
              isFullscreen 
                ? 'w-screen h-screen rounded-none border-none' 
                : 'w-full max-w-6xl xl:max-w-7xl h-[92vh] max-h-[94vh] rounded-2xl md:rounded-3xl'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="px-5 py-3.5 border-b border-border/60 bg-muted/40 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-bold border-primary/30 text-primary px-2.5 py-1 text-xs">
                  {selectedKanji.level} • Lesson {selectedKanji.lesson}
                </Badge>
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  Kanji {currentIndex + 1} of {filteredKanji.length}
                </span>
              </div>

              {/* Prev / Next Kanji Buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
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

              {/* Window Controls */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Full Screen (F)"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  onClick={() => { setSelectedKanji(null); setIsFullscreen(false); }}
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body: Responsive Split-Layout on Desktop */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
              {/* Left Column: Kanji Hero & Mnemonic (Sticky/Distinct on Desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-border/60 bg-gradient-to-b from-secondary/35 via-secondary/10 to-background flex flex-col justify-between overflow-y-auto p-6 lg:p-8 space-y-6">
                <div className="space-y-6">
                  {/* Hero Kanji Card */}
                  <div className="flex flex-col items-center text-center p-6 bg-card/60 backdrop-blur-xs rounded-2xl border border-border/60 shadow-xs relative">
                    <div className="relative mb-3 flex items-center justify-center">
                      <h2 className="text-8xl sm:text-9xl font-black text-primary tracking-tight select-none drop-shadow-sm">
                        {selectedKanji.kanji}
                      </h2>
                    </div>

                    {/* Pronounce Main Kanji Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full gap-2 text-primary font-bold border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-xs mb-4" 
                      onClick={(e) => speakJapanese(selectedKanji.kanji, e)}
                      title="Pronounce Kanji"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen Pronunciation
                    </Button>

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
                  <span>Esc to close</span>
                </div>
              </div>

              {/* Right Column: Detailed Readings, Vocabulary & Sentences (Scrollable on Desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-8 bg-card/40">
                {/* 1. Readings Breakdown (Kunyomi & Onyomi side-by-side) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                    <Languages className="w-5 h-5 text-primary" />
                    <h3 className="text-base sm:text-lg font-bold">Readings & Pronunciation (読み方)</h3>
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
                                  onClick={(e) => speakJapanese(extractKana(selectedKanji.kun_yomi_new!.reading), e)}
                                  title="Kunyomi উচ্চারণ শুনুন"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                            {selectedKanji.kun_yomi_new.examples && selectedKanji.kun_yomi_new.examples.length > 0 && (
                              <div className="space-y-2 mt-3">
                                {selectedKanji.kun_yomi_new.examples.map((ex, i) => (
                                  <div key={i} className="flex items-center justify-between p-2.5 bg-background/80 rounded-xl border border-border/60 hover:border-blue-500/40 transition-colors">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-lg text-primary">{ex.word}</span>
                                        <span className="text-xs text-muted-foreground font-semibold">({ex.reading})</span>
                                      </div>
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{ex.meaning_bn}</span>
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
                            {selectedKanji.kunyomi.length > 0 ? selectedKanji.kunyomi.map((k, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-background font-bold text-sm px-3 py-1.5 rounded-lg border border-border/60 text-foreground">
                                <span>{k}</span>
                                <span className="text-muted-foreground font-medium text-xs">({kanaToRomaji(k)})</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full -mr-1"
                                  onClick={(e) => speakJapanese(k, e)}
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )) : <span className="text-muted-foreground text-sm italic">None</span>}
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
                                  onClick={(e) => speakJapanese(extractKana(selectedKanji.on_yomi_new!.reading), e)}
                                  title="Onyomi উচ্চারণ শুনুন"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                            {selectedKanji.on_yomi_new.examples && selectedKanji.on_yomi_new.examples.length > 0 && (
                              <div className="space-y-2 mt-3">
                                {selectedKanji.on_yomi_new.examples.map((ex, i) => (
                                  <div key={i} className="flex items-center justify-between p-2.5 bg-background/80 rounded-xl border border-border/60 hover:border-rose-500/40 transition-colors">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-lg text-primary">{ex.word}</span>
                                        <span className="text-xs text-muted-foreground font-semibold">({ex.reading})</span>
                                      </div>
                                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{ex.meaning_bn}</span>
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
                            {selectedKanji.onyomi.length > 0 ? selectedKanji.onyomi.map((o, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-background font-bold text-sm px-3 py-1.5 rounded-lg border border-border/60 text-foreground">
                                <span>{o}</span>
                                <span className="text-muted-foreground font-medium text-xs">({kanaToRomaji(o)})</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full -mr-1"
                                  onClick={(e) => speakJapanese(o, e)}
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )) : <span className="text-muted-foreground text-sm italic">None</span>}
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
                        <h3 className="text-base sm:text-lg font-bold">Vocabulary Words (関連語彙)</h3>
                      </div>
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {selectedKanji.examples.length} words
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {selectedKanji.examples.map((ex, i) => (
                        <div key={i} className="flex flex-col justify-between p-3.5 bg-secondary/20 hover:bg-secondary/35 rounded-xl border border-border/60 transition-all hover:shadow-xs">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-black text-2xl text-primary">{ex.word}</span>
                              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 bg-background/60">
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
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{ex.meaning_bn}</p>
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
                        <h3 className="text-base sm:text-lg font-bold">Example Sentences (例文)</h3>
                      </div>
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {selectedKanji.sentences.length} sentences
                      </Badge>
                    </div>

                    <div className="space-y-3.5">
                      {selectedKanji.sentences.map((sent, i) => (
                        <div key={i} className="p-4 sm:p-5 bg-card/90 rounded-2xl border border-border/80 shadow-xs relative hover:border-primary/40 transition-all">
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
                            <p className="text-sm font-medium text-muted-foreground">{sent.english}</p>
                            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{sent.bangla}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

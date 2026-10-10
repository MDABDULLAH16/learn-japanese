'use client'

import { useState } from 'react'
import { KANJI_DATA } from '@/lib/kanjiData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

export function KanjiPracticeClient({ userId }: { userId: string }) {
  const [selectedLevel, setSelectedLevel] = useState<"N5" | "N4">("N5")
  const [selectedLesson, setSelectedLesson] = useState<number>(1)
  
  const filteredKanji = KANJI_DATA.filter(k => k.level === selectedLevel && k.lesson === selectedLesson)
  const lessons = Array.from(new Set(KANJI_DATA.filter(k => k.level === selectedLevel).map(k => k.lesson))).sort((a, b) => a - b)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % filteredKanji.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + filteredKanji.length) % filteredKanji.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  if (filteredKanji.length === 0) return null;

  const currentKanji = filteredKanji[currentIndex]

  return (
    <div className="max-w-3xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/kanji" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kanji List
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Kanji Practice</h1>
          <p className="text-muted-foreground mt-1">Test your memory with interactive flashcards.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">Level:</span>
        <Button
          variant={selectedLevel === "N5" ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setSelectedLevel("N5"); setCurrentIndex(0); setIsFlipped(false); }}
          className="rounded-full flex-shrink-0"
        >
          N5 (Basic)
        </Button>
        <Button
          variant={selectedLevel === "N4" ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLevel("N4")}
          className="rounded-full flex-shrink-0 opacity-50 cursor-not-allowed"
          title="Coming soon!"
        >
          N4 (Coming Soon)
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">Lesson:</span>
        {lessons.length > 0 ? lessons.map(lessonNum => (
          <Button
            key={lessonNum}
            variant={selectedLesson === lessonNum ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedLesson(lessonNum); setCurrentIndex(0); setIsFlipped(false); }}
            className="rounded-full flex-shrink-0"
          >
            Lesson {lessonNum}
          </Button>
        )) : (
          <span className="text-sm text-muted-foreground italic">No lessons available</span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 mt-8">
        <div className="flex items-center justify-between w-full max-w-md mb-2">
          <span className="text-sm font-bold text-muted-foreground">Card {currentIndex + 1} of {filteredKanji.length}</span>
          <Badge variant="outline">{currentKanji.level}</Badge>
        </div>

        {/* Flashcard */}
        <div 
          className="w-full max-w-md aspect-[4/5] [perspective:1000px] relative cursor-pointer group"
          onClick={handleFlip}
        >
          <div className={`w-full h-full transition-transform duration-500 [transform-style:preserve-3d] relative ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            
            {/* Front of card */}
            <Card className={`absolute inset-0 [backface-visibility:hidden] w-full h-full flex flex-col items-center justify-center p-8 bg-card border-2 hover:border-primary/50 transition-colors shadow-lg`}>
              <h2 className="text-[8rem] font-black text-primary drop-shadow-sm leading-none">{currentKanji.kanji}</h2>
              <p className="text-muted-foreground font-medium mt-8 animate-pulse text-sm flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" /> Tap to flip
              </p>
            </Card>

            {/* Back of card */}
            <Card className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] w-full h-full flex flex-col p-6 bg-gradient-to-br from-secondary/40 to-secondary/10 border-2 border-primary/20 shadow-xl overflow-y-auto`}>
              <div className="flex-1 flex flex-col items-center justify-center w-full mb-6 mt-4">
                <h3 className="text-4xl font-black text-primary mb-2">{currentKanji.kanji}</h3>
                <h4 className="text-xl font-bold text-foreground text-center">{currentKanji.meaning_en}</h4>
                <h5 className="text-lg font-bold text-blue-600 dark:text-blue-400 text-center mt-1">{currentKanji.meaning_bn}</h5>
                {currentKanji.mnemonic && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mt-4 text-center px-4 leading-snug">
                    {currentKanji.mnemonic}
                  </p>
                )}
              </div>
              
              <div className="space-y-4 w-full">
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border flex flex-col">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500/70 mb-2">Kunyomi</p>
                  <div className="flex flex-wrap gap-2">
                    {currentKanji.kun_yomi_new ? (
                      <span className="font-bold text-md">{currentKanji.kun_yomi_new.reading || <span className="text-muted-foreground text-sm">None</span>}</span>
                    ) : (
                      currentKanji.kunyomi.length > 0 ? currentKanji.kunyomi.map((k, i) => (
                        <span key={i} className="font-bold">{k}</span>
                      )) : <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border flex flex-col">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-rose-500/70 mb-2">Onyomi</p>
                  <div className="flex flex-wrap gap-2">
                    {currentKanji.on_yomi_new ? (
                      <span className="font-bold text-md">{currentKanji.on_yomi_new.reading || <span className="text-muted-foreground text-sm">None</span>}</span>
                    ) : (
                      currentKanji.onyomi.length > 0 ? currentKanji.onyomi.map((o, i) => (
                        <span key={i} className="font-bold">{o}</span>
                      )) : <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground/50 font-medium mt-6 text-center text-xs w-full">Tap anywhere to flip back</p>
            </Card>

          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 w-full max-w-md pt-4">
          <Button variant="outline" size="lg" onClick={handlePrev} className="flex-1 rounded-full h-14">
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </Button>
          <Button variant="default" size="lg" onClick={handleNext} className="flex-1 rounded-full h-14 shadow-md">
            Next <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { KANJI_DATA, KanjiItem } from '@/lib/kanjiData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BookOpen, X, ChevronRight, PenTool, Volume2 } from 'lucide-react'
import { kanaToRomaji } from '@/lib/romaji'

export function KanjiClient({ userId }: { userId: string }) {
  const [selectedLevel, setSelectedLevel] = useState<"N5" | "N4">("N5")
  const [selectedLesson, setSelectedLesson] = useState<number>(1)
  
  const filteredKanji = KANJI_DATA.filter(k => k.level === selectedLevel && k.lesson === selectedLesson)
  
  // Get unique lessons for the selected level
  const lessons = Array.from(new Set(KANJI_DATA.filter(k => k.level === selectedLevel).map(k => k.lesson))).sort((a, b) => a - b)

  return (
    <div className="max-w-5xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Dedicated Kanji</h1>
          <p className="text-muted-foreground mt-1">Learn individual Kanji characters, meanings, and readings.</p>
        </div>
        
        <Link href="/kanji-practice">
          <Button className="w-full sm:w-auto shadow-sm">
            <PenTool className="w-4 h-4 mr-2" /> Kanji Practice
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">JLPT Level:</span>
        <Button
          variant={selectedLevel === "N5" ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLevel("N5")}
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

      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide w-full max-w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">Lesson:</span>
        {lessons.length > 0 ? lessons.map(lessonNum => (
          <Button
            key={lessonNum}
            variant={selectedLesson === lessonNum ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLesson(lessonNum)}
            className="rounded-full flex-shrink-0"
          >
            Lesson {lessonNum}
          </Button>
        )) : (
          <span className="text-sm text-muted-foreground italic">No lessons available</span>
        )}
      </div>

      <div className="mt-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredKanji.map((kanji) => (
            <KanjiCard key={kanji.id} item={kanji} />
          ))}
        </div>
      </div>
    </div>
  )
}

function KanjiCard({ item }: { item: KanjiItem }) {
  const [showModal, setShowModal] = useState(false)

  const speakText = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    // Remove dashes often used in readings (e.g. "-び" -> "び")
    const cleanText = text.replace(/-/g, '')
    window.speechSynthesis.cancel() // Stop previous audio
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ja-JP'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      <Card 
        className="overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/50 group cursor-pointer flex flex-col justify-center items-center p-6 aspect-square bg-card hover:bg-secondary/10"
        onClick={() => setShowModal(true)}
      >
        <h3 className="text-5xl sm:text-6xl font-black text-primary mb-3 drop-shadow-sm">{item.kanji}</h3>
        <p className="text-sm font-medium text-muted-foreground text-center truncate w-full px-2">{item.meaning_en}</p>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border-primary/20 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/10 border-b flex flex-col items-center relative shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Badge className="absolute top-4 left-4" variant="secondary">{item.level} - Lesson {item.lesson}</Badge>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                <h2 className="text-8xl font-black text-primary">{item.kanji}</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 text-primary/70 hover:text-primary rounded-full bg-primary/5 hover:bg-primary/10 transition-transform hover:scale-105" 
                  onClick={(e) => speakText(e, item.kanji)}
                  title="Pronounce Kanji"
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <p className="text-2xl font-bold text-muted-foreground">{item.meaning_en}</p>
                <div className="h-6 w-px bg-border/50"></div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.meaning_bn}</p>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500/70 mb-2">Kunyomi (Japanese)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.kunyomi.length > 0 ? item.kunyomi.map((k, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="bg-background font-bold text-sm px-3 py-1 text-foreground"
                      >
                        {k} <span className="text-muted-foreground font-medium ml-1 text-xs">({kanaToRomaji(k)})</span>
                      </Badge>
                    )) : <span className="text-muted-foreground text-sm">None</span>}
                  </div>
                </div>
                
                <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-rose-500/70">Onyomi (Chinese)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.onyomi.length > 0 ? item.onyomi.map((o, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="bg-background font-bold text-sm px-3 py-1 text-foreground"
                      >
                        {o} <span className="text-muted-foreground font-medium ml-1 text-xs">({kanaToRomaji(o)})</span>
                      </Badge>
                    )) : <span className="text-muted-foreground text-sm">None</span>}
                  </div>
                </div>
              </div>

              {item.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center">
                    <BookOpen className="w-3 h-3 mr-2" /> Vocabulary Examples
                  </h4>
                  <div className="space-y-2">
                    {item.examples.map((ex, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50 gap-2">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-xl text-primary">{ex.word}</p>
                          <Badge variant="outline" className="text-xs font-semibold">{ex.reading}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full" 
                            onClick={(e) => speakText(e, ex.word)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="sm:text-right flex flex-col">
                          <p className="text-sm font-medium text-foreground">{ex.meaning_en}</p>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{ex.meaning_bn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.sentences.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center">
                    <BookOpen className="w-3 h-3 mr-2" /> Example Sentences
                  </h4>
                  <div className="space-y-3">
                    {item.sentences.map((sent, i) => (
                      <div key={i} className="p-4 bg-primary/5 rounded-lg border border-primary/10 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-primary rounded-full bg-background/50 backdrop-blur-sm border border-border/50" 
                          onClick={(e) => speakText(e, sent.japanese)}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <p className="font-bold text-lg text-foreground mb-1 pr-10">{sent.japanese}</p>
                        <p className="text-xs text-muted-foreground mb-2">{sent.romaji}</p>
                        <div className="h-px w-full bg-border/50 my-2"></div>
                        <p className="text-sm font-medium text-foreground">{sent.english}</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{sent.bangla}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

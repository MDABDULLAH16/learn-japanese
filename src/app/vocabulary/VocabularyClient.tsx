'use client'

import { useState } from 'react'
import { VOCABULARY_DATA, Lesson, VocabularyItem } from '@/lib/vocabularyData'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Eye, EyeOff } from 'lucide-react'

export function VocabularyClient({ userId }: { userId: string }) {
  const [selectedLesson, setSelectedLesson] = useState<number>(VOCABULARY_DATA.lessons[0].lesson_number)

  const currentLesson = VOCABULARY_DATA.lessons.find(l => l.lesson_number === selectedLesson) || VOCABULARY_DATA.lessons[0]

  return (
    <div className="max-w-5xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Vocabulary Practice</h1>
          <p className="text-muted-foreground mt-1">Learn new words and practice your memory.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap sticky left-0 bg-background pr-2 py-1 z-10">Select Lesson:</span>
        {VOCABULARY_DATA.lessons.map(lesson => (
          <Button
            key={lesson.lesson_number}
            variant={selectedLesson === lesson.lesson_number ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLesson(lesson.lesson_number)}
            className="rounded-full snap-start whitespace-nowrap flex-shrink-0"
          >
            Lesson {lesson.lesson_number}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        <LearnSection lesson={currentLesson} />
      </div>
    </div>
  )
}

function LearnSection({ lesson }: { lesson: Lesson }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lesson.vocabularies.map((vocab, index) => (
        <LearnCard key={index} vocab={vocab} />
      ))}
    </div>
  )
}

function LearnCard({ vocab }: { vocab: VocabularyItem }) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)

  return (
    <Card className="overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/50 group flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-6 flex flex-col items-center justify-center min-h-[140px] bg-gradient-to-br from-secondary/30 to-secondary/10 relative border-b">
          <h3 className="text-5xl font-black text-primary mb-2 text-center drop-shadow-sm">{vocab.nihongo}</h3>
          {vocab.kanji && (
            <Badge variant="secondary" className="absolute top-3 right-3 text-xs bg-background/90 backdrop-blur-md shadow-sm border-primary/20">
              {vocab.kanji}
            </Badge>
          )}
        </div>
        
        <div className="p-5 flex-1 bg-card flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Pronunciation Section */}
            <div className="space-y-2">
              {!showPronunciation ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all" 
                  onClick={() => setShowPronunciation(true)}
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal Pronunciation
                </Button>
              ) : (
                <div className="space-y-2 p-3 bg-secondary/30 rounded-lg animate-in zoom-in-95 duration-200 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Romaji</span>
                    <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-foreground">{vocab.romaji}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Uchharon</span>
                    <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-primary">{vocab.uchharon}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 uppercase tracking-widest" 
                    onClick={() => setShowPronunciation(false)}
                  >
                    <EyeOff className="w-3 h-3 mr-1" /> Hide
                  </Button>
                </div>
              )}
            </div>
            
            {/* Meaning Section */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              {!showMeaning ? (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary transition-all font-medium" 
                  onClick={() => setShowMeaning(true)}
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal Meaning
                </Button>
              ) : (
                <div className="space-y-3 p-3 bg-primary/5 rounded-lg animate-in zoom-in-95 duration-200 border border-primary/10">
                  <div>
                    <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">Bangla</span>
                    <span className="text-base font-bold text-blue-700 dark:text-blue-400 leading-tight">{vocab.bangla}</span>
                  </div>
                  <div className="h-px w-full bg-primary/10 my-1"></div>
                  <div>
                    <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">English</span>
                    <span className="text-sm font-medium text-foreground/80 leading-tight">{vocab.english}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-primary/10 uppercase tracking-widest" 
                    onClick={() => setShowMeaning(false)}
                  >
                    <EyeOff className="w-3 h-3 mr-1" /> Hide
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}



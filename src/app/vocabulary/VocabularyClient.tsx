'use client'

import { useState } from 'react'
import { VOCABULARY_DATA, Lesson, VocabularyItem } from '@/lib/vocabularyData'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BookOpen, GraduationCap, Eye, EyeOff, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'

type TabType = 'learn' | 'practice'

export function VocabularyClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('learn')
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

        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
          <Button 
            variant={activeTab === 'learn' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('learn')}
            className="rounded-md"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Learn
          </Button>
          <Button 
            variant={activeTab === 'practice' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('practice')}
            className="rounded-md"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Practice
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Select Lesson:</span>
        {VOCABULARY_DATA.lessons.map(lesson => (
          <Button
            key={lesson.lesson_number}
            variant={selectedLesson === lesson.lesson_number ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLesson(lesson.lesson_number)}
            className="rounded-full"
          >
            Lesson {lesson.lesson_number}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'learn' ? (
          <LearnSection lesson={currentLesson} />
        ) : (
          <PracticeSection lesson={currentLesson} />
        )}
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

  return (
    <Card className="overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/50 group">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col items-center justify-center min-h-[120px] bg-secondary/20 relative">
          <h3 className="text-4xl font-bold text-primary mb-2 text-center">{vocab.nihongo}</h3>
          {vocab.kanji && (
            <Badge variant="outline" className="absolute top-3 right-3 text-xs bg-background/80 backdrop-blur-sm">
              {vocab.kanji}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground font-medium">{vocab.romaji}</p>
        </div>
        
        <div className="p-5 border-t bg-card">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pronunciation</span>
              <span className="text-sm font-medium">{vocab.uchharon}</span>
            </div>
            
            <div className="pt-2 border-t">
              {!showMeaning ? (
                <Button 
                  variant="secondary" 
                  className="w-full text-muted-foreground hover:text-foreground" 
                  onClick={() => setShowMeaning(true)}
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal Meaning
                </Button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Bangla</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">{vocab.bangla}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">English</span>
                    <span className="text-sm font-medium">{vocab.english}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-8 mt-2 text-xs text-muted-foreground" 
                    onClick={() => setShowMeaning(false)}
                  >
                    <EyeOff className="w-3 h-3 mr-2" /> Hide
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

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

function PracticeSection({ lesson }: { lesson: Lesson }) {
  const [cards, setCards] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const startPractice = () => {
    setCards(shuffleArray(lesson.vocabularies))
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsStarted(true)
    setIsFinished(false)
  }

  const nextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex(c => c + 1)
      }, 150) // slight delay to allow flip animation to reset visually if needed
    } else {
      setIsFinished(true)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex(c => c - 1)
      }, 150)
    }
  }

  if (!isStarted) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 mt-12 border-2 border-primary/20 hover:border-primary/50 transition-colors">
        <GraduationCap className="w-16 h-16 mx-auto mb-6 text-primary/80" />
        <h2 className="text-2xl font-bold mb-2">Flashcard Practice</h2>
        <p className="text-muted-foreground mb-8">Test your memory on Lesson {lesson.lesson_number} vocabulary. We will shuffle {lesson.vocabularies.length} words for you.</p>
        <Button size="lg" className="w-full font-bold text-lg h-14" onClick={startPractice}>
          Start Practice
        </Button>
      </Card>
    )
  }

  if (isFinished) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 mt-12">
        <h2 className="text-3xl font-bold mb-4">Great Job! 🎉</h2>
        <p className="text-muted-foreground mb-8">You have reviewed all {cards.length} words in Lesson {lesson.lesson_number}.</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setIsStarted(false)}>
            Back to Overview
          </Button>
          <Button onClick={startPractice}>
            <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
          </Button>
        </div>
      </Card>
    )
  }

  const vocab = cards[currentIndex]
  const progress = ((currentIndex) / cards.length) * 100

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-1">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span>Lesson {lesson.lesson_number}</span>
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div 
        className="relative w-full aspect-[4/3] md:aspect-[16/10] [perspective:1000px] group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full absolute top-0 left-0 transition-all duration-500 [transform-style:preserve-3d] shadow-xl rounded-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* FRONT */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bg-card border-2 border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-6 bg-secondary/50 px-3 py-1 rounded-full">Japanese</span>
            
            <h2 className="text-6xl md:text-8xl font-black text-primary mb-4 leading-tight">{vocab.nihongo}</h2>
            {vocab.kanji && <p className="text-2xl text-muted-foreground font-medium">{vocab.kanji}</p>}
            
            <div className="absolute bottom-6 text-sm text-muted-foreground animate-pulse flex items-center gap-2">
              <Eye className="w-4 h-4" /> Tap to flip
            </div>
          </div>

          {/* BACK */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bg-primary text-primary-foreground border-2 border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground/80 tracking-widest uppercase mb-4 bg-black/20 px-3 py-1 rounded-full">Meaning</span>
              
              <div className="space-y-6 w-full">
                <div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-2 text-yellow-300">{vocab.bangla}</h3>
                  <p className="text-xl md:text-2xl font-medium opacity-90">{vocab.english}</p>
                </div>
                
                <div className="h-px w-16 bg-primary-foreground/30 mx-auto"></div>
                
                <div className="bg-black/20 rounded-xl p-4 w-full max-w-sm mx-auto backdrop-blur-sm">
                  <p className="text-xl font-bold mb-1">{vocab.romaji}</p>
                  <p className="text-sm opacity-80 uppercase tracking-widest">{vocab.uchharon}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 h-14 bg-card"
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Prev
        </Button>
        <Button 
          size="lg" 
          className="flex-1 h-14 font-bold text-lg"
          onClick={nextCard}
        >
          {currentIndex + 1 === cards.length ? 'Finish' : 'Next'} <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

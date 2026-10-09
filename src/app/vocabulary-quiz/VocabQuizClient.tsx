'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveQuizScore } from '@/lib/actions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2, RotateCcw, ChevronLeft, ChevronRight, Trophy, Volume2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import confetti from 'canvas-confetti'
import { VOCABULARY_DATA, VocabularyItem } from '@/lib/vocabularyData'

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5)

type Question = {
  vocab: VocabularyItem
  options: string[]
}

export function VocabQuizClient({ userId }: { userId: string }) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [answersHistory, setAnswersHistory] = useState<Record<number, number>>({})
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoaded, setIsLoaded] = useState(false)

  const selectedAnswer = answersHistory[currentQuestion]
  const hasAnswered = selectedAnswer !== undefined

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const generateQuiz = (lessonNumber: number) => {
    setSelectedLesson(lessonNumber)
    
    const lesson = VOCABULARY_DATA.lessons.find(l => l.lesson_number === lessonNumber)
    if (!lesson) return
    
    const sourceData = lesson.vocabularies
    // Select up to 20 random words for the quiz
    const selectedVocabs = shuffle(sourceData).slice(0, 20)
    
    // Create pool of all bangla meanings to use as wrong options
    const allMeanings = VOCABULARY_DATA.lessons.flatMap(l => l.vocabularies).map(v => v.bangla)
    
    const generatedQuestions = selectedVocabs.map(vocab => {
      // Find 3 wrong options
      const wrongMeanings = shuffle(allMeanings.filter(m => m !== vocab.bangla)).slice(0, 3)
      return {
        vocab: vocab,
        options: shuffle([vocab.bangla, ...wrongMeanings])
      }
    })

    setQuestions(generatedQuestions)
    resetState()
  }

  const startMistakesRetry = () => {
    const allMeanings = VOCABULARY_DATA.lessons.flatMap(l => l.vocabularies).map(v => v.bangla)
    
    const retriedQuestions = wrongQuestions.map(q => {
      const wrongMeanings = shuffle(allMeanings.filter(m => m !== q.vocab.bangla)).slice(0, 3)
      return {
        ...q,
        options: shuffle([q.vocab.bangla, ...wrongMeanings])
      }
    })

    setQuestions(shuffle(retriedQuestions))
    resetState()
  }

  const resetState = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setAnswersHistory({})
    setWrongQuestions([])
  }

  const handleAnswer = (index: number) => {
    if (hasAnswered) return
    setAnswersHistory(prev => ({...prev, [currentQuestion]: index}))

    const q = questions[currentQuestion]
    if (q.options[index] === q.vocab.bangla) {
      setScore(s => s + 10)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    } else {
      setWrongQuestions(prev => {
        if (!prev.find(wq => wq.vocab.nihongo === q.vocab.nihongo)) {
          return [...prev, q]
        }
        return prev
      })
    }
  }

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      startTransition(async () => {
        if (score > 0) await saveQuizScore(userId, score)
        setShowResults(true)
      })
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleBackToStart = () => {
    setSelectedLesson(null)
  }

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    
    if (diff > 50 && hasAnswered) {
      nextQuestion();
    }
    if (diff < -50) {
      prevQuestion();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // SCREEN 1: Lesson Selection
  if (!selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto mt-12 space-y-6 px-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Card className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary/80" />
          <h2 className="text-3xl font-bold mb-4">Vocabulary Quiz</h2>
          <p className="text-muted-foreground mb-8">Select a lesson to test your vocabulary memory.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {VOCABULARY_DATA.lessons.map(lesson => (
              <Button 
                key={lesson.lesson_number}
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors" 
                onClick={() => generateQuiz(lesson.lesson_number)}
              >
                <span className="text-2xl font-bold">L{lesson.lesson_number}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{lesson.vocabularies.length} Words</span>
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
          <div className="text-6xl font-bold text-primary">
            +{score} XP
          </div>
          <p className="text-xl text-muted-foreground">
            {isPerfect ? "Flawless victory! You knew every word!" : `Great effort! You missed ${wrongQuestions.length} word(s).`}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
            Your XP has been permanently saved to your profile!
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          {!isPerfect && (
            <Button onClick={startMistakesRetry} className="bg-amber-500 hover:bg-amber-600 text-white">
              <RotateCcw className="mr-2 h-4 w-4" /> Retry Mistakes
            </Button>
          )}
          <Button variant="outline" onClick={handleBackToStart}>
            Choose Another Lesson
          </Button>
          <Link href="/"><Button variant="secondary">Dashboard</Button></Link>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  const speakJapanese = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!question) return
    const utterance = new SpeechSynthesisUtterance(question.vocab.nihongo)
    utterance.lang = 'ja-JP'
    window.speechSynthesis.speak(utterance)
  }

  // SCREEN 3: Active Quiz
  const progress = ((currentQuestion) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-12 mb-28 md:mb-0 space-y-5 px-2 w-full overflow-x-hidden sm:overflow-x-visible">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToStart} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
        <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">Lesson {selectedLesson}</span>
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full">XP: {score}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card 
        className="overflow-hidden border-2 shadow-sm transition-all duration-300"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardContent className="space-y-6 flex flex-col items-center pt-8">
          
          <div className="text-center relative w-full flex flex-col items-center justify-center min-h-[160px] bg-secondary/10 rounded-xl p-6 border">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-primary/70 hover:text-primary hover:bg-primary/10 rounded-full h-10 w-10"
              onClick={speakJapanese}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </Button>

            <h2 className="text-4xl sm:text-7xl font-black text-primary leading-tight drop-shadow-sm mb-4 mt-2 break-words whitespace-normal px-2">
              {question.vocab.nihongo}
            </h2>
            {question.vocab.kanji && (
              <Badge variant="outline" className="text-lg py-1 px-4 text-muted-foreground bg-background shadow-inner">
                {question.vocab.kanji}
              </Badge>
            )}
          </div>
          
          {(hasAnswered) && (
            <div className="w-full text-center space-y-1 bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in fade-in zoom-in-95">
               <span className="text-xs font-bold text-muted-foreground uppercase">Romaji / Pronunciation</span>
               <p className="text-lg font-bold text-primary">{question.vocab.romaji} <span className="text-muted-foreground font-normal">({question.vocab.uchharon})</span></p>
            </div>
          )}

          <p className="text-sm md:text-lg text-foreground font-medium w-full text-left md:text-center mt-2 px-1">Select the correct Bangla meaning:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = question.vocab.bangla === option
              
              let variant: "default" | "outline" | "destructive" | "secondary" = "outline"
              if (hasAnswered) {
                if (isCorrect) variant = "default" 
                else if (isSelected && !isCorrect) variant = "destructive" 
                else variant = "secondary" 
              } else if (isSelected) {
                variant = "default"
              }

              return (
                <Button 
                  key={index} 
                  variant={variant}
                  className={`h-auto py-4 sm:py-5 text-lg sm:text-xl font-bold relative transition-all active:scale-[0.98] ${hasAnswered && isSelected && !isCorrect ? 'animate-in slide-in-from-left-1 slide-in-from-right-1 duration-100' : ''} ${variant === 'outline' ? 'hover:bg-primary/5 hover:border-primary/50' : ''}`}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <span className="whitespace-normal break-words pr-8 w-full text-center">{option}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 className="absolute right-4 h-5 w-5 text-green-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="absolute right-4 h-5 w-5 text-red-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
                </Button>
              )
            })}
          </div>

        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50 dark:bg-slate-900/50 rounded-b-xl p-4 fixed bottom-0 left-0 right-0 z-50 md:relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none gap-2">
          <Button onClick={prevQuestion} disabled={currentQuestion === 0} variant="outline" size="lg" className="h-14 px-4 md:px-8">
            <ChevronLeft className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Previous</span>
          </Button>

          <Button onClick={nextQuestion} disabled={!hasAnswered || isPending} size="lg" className="flex-1 md:flex-none font-bold text-lg h-14 md:px-12 transition-all">
            {isPending ? (
              <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving...</>
            ) : currentQuestion + 1 === questions.length ? (
              'Finish Quiz'
            ) : (
              <>Next <ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

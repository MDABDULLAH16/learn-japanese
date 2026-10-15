'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveQuizScore } from '@/lib/actions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2, RotateCcw, ChevronLeft, ChevronRight, Trophy, Volume2, Bookmark } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import confetti from 'canvas-confetti'
import { VOCABULARY_DATA, VocabularyItem } from '@/lib/vocabularyData'
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
  const correctKey = mode === 'ja-bn' 
    ? vocab.bangla.trim().toLowerCase() 
    : vocab.nihongo.trim()
  usedKeys.add(correctKey)

  const shuffledPool = shuffle(allVocabs)
  for (const candidate of shuffledPool) {
    if (!candidate.nihongo?.trim() || !candidate.bangla?.trim()) continue

    const key = mode === 'ja-bn' 
      ? candidate.bangla.trim().toLowerCase() 
      : candidate.nihongo.trim()

    if (usedKeys.has(key)) continue

    usedKeys.add(key)
    wrongOptions.push(candidate)

    if (wrongOptions.length === 3) break
  }

  return wrongOptions
}

export function VocabQuizClient({ 
  userId,
  initialRecapList 
}: { 
  userId: string
  initialRecapList?: VocabularyItem[] 
}) {
  const [quizMode, setQuizMode] = useState<QuizMode>('ja-bn')
  const [selectedLesson, setSelectedLesson] = useState<number | 'recap' | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [answersHistory, setAnswersHistory] = useState<Record<number, number>>({})
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoaded, setIsLoaded] = useState(false)

  const { recapList, isSaved, toggle } = useRecapVocabularies(initialRecapList, userId)

  const selectedAnswer = answersHistory[currentQuestion]
  const hasAnswered = selectedAnswer !== undefined

  const generateQuiz = (lessonNumber: number | 'recap', mode: QuizMode = quizMode) => {
    setSelectedLesson(lessonNumber)
    setQuizMode(mode)
    
    let selectedVocabs: VocabularyItem[] = []
    if (lessonNumber === 'recap') {
      const recaps = recapList.length > 0 ? recapList : getRecapVocabularies()
      if (recaps.length === 0) return
      selectedVocabs = shuffle(recaps)
    } else {
      const lesson = VOCABULARY_DATA.lessons.find(l => l.lesson_number === lessonNumber)
      if (!lesson) return
      selectedVocabs = shuffle(lesson.vocabularies)
    }
    
    // Create pool of all vocabularies to use as wrong options
    const allVocabs = VOCABULARY_DATA.lessons.flatMap(l => l.vocabularies)
    
    const generatedQuestions = selectedVocabs.map(vocab => {
      const wrongVocabs = getWrongOptions(vocab, allVocabs, mode)
      return {
        vocab: vocab,
        options: shuffle([vocab, ...wrongVocabs])
      }
    })

    setQuestions(generatedQuestions)
    resetState()
  }

  useEffect(() => {
    setIsLoaded(true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('lesson') === 'recap') {
        const recaps = (initialRecapList && initialRecapList.length > 0) ? initialRecapList : getRecapVocabularies()
        if (recaps.length >= 4) {
          generateQuiz('recap', 'ja-bn')
        }
      }
    }
  }, [])

  const startMistakesRetry = () => {
    const allVocabs = VOCABULARY_DATA.lessons.flatMap(l => l.vocabularies)
    
    const retriedQuestions = wrongQuestions.map(q => {
      const wrongVocabs = getWrongOptions(q.vocab, allVocabs, quizMode)
      return {
        ...q,
        options: shuffle([q.vocab, ...wrongVocabs])
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
    const isCorrect = quizMode === 'ja-bn' 
      ? q.options[index].bangla.trim() === q.vocab.bangla.trim() 
      : q.options[index].nihongo.trim() === q.vocab.nihongo.trim()

    if (isCorrect) {
      setScore(s => s + 10)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    } else {
      setWrongQuestions(prev => {
        if (!prev.find(wq => wq.vocab.nihongo.trim() === q.vocab.nihongo.trim())) {
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
          <p className="text-muted-foreground mb-8">Select a lesson to test all vocabulary words with randomized questions.</p>
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-secondary/20 p-1.5 rounded-lg inline-flex gap-1 border">
              <Button 
                variant={quizMode === 'ja-bn' ? 'default' : 'ghost'} 
                onClick={() => setQuizMode('ja-bn')}
                className="rounded-md transition-all font-semibold"
              >
                🇯🇵 Japanese ➔ 🇧🇩 Bangla
              </Button>
              <Button 
                variant={quizMode === 'bn-ja' ? 'default' : 'ghost'} 
                onClick={() => setQuizMode('bn-ja')}
                className="rounded-md transition-all font-semibold"
              >
                🇧🇩 Bangla ➔ 🇯🇵 Japanese
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <Button 
              variant="outline" 
              className={`h-24 flex flex-col gap-2 transition-all border-amber-500/40 relative ${
                recapList.length >= 4 
                  ? 'hover:bg-amber-500/10 hover:border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/5' 
                  : 'opacity-50 cursor-not-allowed border-dashed'
              }`} 
              disabled={recapList.length < 4}
              onClick={() => recapList.length >= 4 && generateQuiz('recap', quizMode)}
              title={recapList.length < 4 ? 'Save at least 4 words in Recap to take quiz' : 'Quiz your bookmarked Recap words'}
            >
              <span className="text-xl font-bold flex items-center gap-1.5">
                <Bookmark className="w-5 h-5 fill-current text-amber-500" />
                Recap
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                {recapList.length} Saved {recapList.length === 1 ? 'Word' : 'Words'}
              </span>
            </Button>
            {VOCABULARY_DATA.lessons.map(lesson => (
              <Button 
                key={lesson.lesson_number}
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors" 
                onClick={() => generateQuiz(lesson.lesson_number, quizMode)}
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
          <div className="inline-block bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm">
            {questions.length - wrongQuestions.length} / {questions.length} Correct
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
              <RotateCcw className="mr-2 h-4 w-4" /> Retry Mistakes ({wrongQuestions.length})
            </Button>
          )}
          <Button onClick={() => selectedLesson && generateQuiz(selectedLesson, quizMode)}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play Again
          </Button>
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
  const progress = questions.length > 0 ? ((currentQuestion) / questions.length) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-12 mb-28 md:mb-0 space-y-5 px-2 w-full overflow-x-hidden sm:overflow-x-visible">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToStart} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
            {quizMode === 'ja-bn' ? 'JA ➔ BN' : 'BN ➔ JA'}
          </Badge>
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
            {selectedLesson === 'recap' ? 'Recap Lesson' : `Lesson ${selectedLesson}`}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectedLesson && generateQuiz(selectedLesson, quizMode)} 
            className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
            title="Restart quiz with new shuffle"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restart
          </Button>
        </div>
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
            {quizMode === 'ja-bn' && (
              <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full h-10 w-10 transition-all ${
                    isSaved(question.vocab)
                      ? 'text-amber-500 bg-amber-500/15 hover:bg-amber-500/25'
                      : 'text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-500/10'
                  }`}
                  onClick={() => toggle(question.vocab)}
                  title={isSaved(question.vocab) ? "Remove from Recap" : "Add to Recap"}
                >
                  <Bookmark className={`w-5 h-5 transition-transform ${isSaved(question.vocab) ? 'fill-amber-500 scale-110' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary/70 hover:text-primary hover:bg-primary/10 rounded-full h-10 w-10"
                  onClick={speakJapanese}
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
            )}

            <h2 className={`font-black text-primary leading-tight drop-shadow-sm mb-4 mt-2 break-words whitespace-normal px-2 ${quizMode === 'ja-bn' ? 'text-4xl sm:text-7xl' : 'text-3xl sm:text-5xl'}`}>
              {quizMode === 'ja-bn' ? question.vocab.nihongo : question.vocab.bangla}
            </h2>
            {quizMode === 'ja-bn' && question.vocab.kanji && (
              <Badge variant="outline" className="text-lg py-1 px-4 text-muted-foreground bg-background shadow-inner">
                {question.vocab.kanji}
              </Badge>
            )}
          </div>
          
          {(hasAnswered) && quizMode === 'ja-bn' && (
            <div className="w-full text-center space-y-1 bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in fade-in zoom-in-95">
               <span className="text-xs font-bold text-muted-foreground uppercase">Romaji / Pronunciation</span>
               <p className="text-lg font-bold text-primary">
                 {question.vocab.romaji || ''}
                 {question.vocab.uchharon ? <span className="text-muted-foreground font-normal"> ({question.vocab.uchharon})</span> : null}
               </p>
            </div>
          )}
          
          {(hasAnswered) && quizMode === 'bn-ja' && (
            <div className="w-full flex items-center justify-center gap-3 bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in fade-in zoom-in-95">
               <Button variant="ghost" size="icon" onClick={speakJapanese} className="h-9 w-9 text-primary/70 hover:text-primary rounded-full bg-primary/10">
                 <Volume2 className="w-4 h-4" />
               </Button>
               <div>
                 <span className="text-xs font-bold text-muted-foreground uppercase block text-center">Correct Japanese</span>
                 <p className="text-lg sm:text-xl font-bold text-primary">
                   {question.vocab.nihongo} {question.vocab.kanji ? <span className="text-sm font-medium text-muted-foreground">({question.vocab.kanji})</span> : null}
                 </p>
                 {(question.vocab.romaji || question.vocab.uchharon) && (
                   <p className="text-sm text-primary/80">
                     {question.vocab.romaji}
                     {question.vocab.uchharon ? <span className="text-muted-foreground font-normal"> ({question.vocab.uchharon})</span> : null}
                   </p>
                 )}
               </div>
            </div>
          )}

          <p className="text-sm md:text-lg text-foreground font-medium w-full text-left md:text-center mt-2 px-1">
            {quizMode === 'ja-bn' ? 'Select the correct Bangla meaning:' : 'Select the correct Japanese word:'}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = quizMode === 'ja-bn' 
                ? question.vocab.bangla.trim() === option.bangla.trim() 
                : question.vocab.nihongo.trim() === option.nihongo.trim()
              
              let variant: "default" | "outline" | "destructive" | "secondary" = "outline"
              if (hasAnswered) {
                if (isCorrect) variant = "default" 
                else if (isSelected && !isCorrect) variant = "destructive" 
                else variant = "secondary" 
              } else if (isSelected) {
                variant = "default"
              }

              const mainText = quizMode === 'ja-bn' 
                ? (option.bangla || '—') 
                : (option.nihongo || '—')

              const subText = quizMode === 'ja-bn'
                ? option.nihongo
                : `${option.bangla}${option.kanji ? ` (${option.kanji})` : ''}`

              return (
                <Button 
                  key={index} 
                  variant={variant}
                  className={`h-auto py-4 sm:py-5 text-lg sm:text-xl font-bold relative transition-all active:scale-[0.98] ${hasAnswered && isSelected && !isCorrect ? 'animate-in slide-in-from-left-1 slide-in-from-right-1 duration-100' : ''} ${variant === 'outline' ? 'hover:bg-primary/5 hover:border-primary/50' : ''} flex flex-col items-center justify-center gap-1 disabled:opacity-100`}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <span className={`whitespace-normal break-words pr-8 w-full text-center ${hasAnswered && !isCorrect && !isSelected ? 'text-foreground' : ''}`}>
                    {mainText}
                  </span>
                  
                  {hasAnswered && subText && (
                    <span className={`text-sm font-normal opacity-100 block mt-1 pr-8 w-full text-center ${isCorrect ? 'text-primary-foreground/90' : isSelected ? 'text-destructive-foreground/90' : 'text-foreground/70'}`}>
                      {subText}
                    </span>
                  )}

                  {hasAnswered && isCorrect && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
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

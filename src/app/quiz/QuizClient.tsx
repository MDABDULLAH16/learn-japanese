'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveQuizScore } from '@/lib/actions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Lightbulb, RotateCcw } from 'lucide-react'
import { getAllItemsFlat, Character, HIRAGANA_DATA, KATAKANA_DATA } from '@/lib/alphabetData'
import confetti from 'canvas-confetti'
import { Progress } from '@/components/ui/progress'

// Helper to shuffle array
const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5)

type Question = {
  charStr: string
  romajiStr: string
  options: string[]
  isKatakana: boolean
  hint?: string
}

type Difficulty = 'normal' | 'medium' | 'hard'
type AlphabetType = 'hiragana' | 'katakana' | 'mix'

export function QuizClient({ userId }: { userId: string }) {
  const [alphabetType, setAlphabetType] = useState<AlphabetType | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [isPending, startTransition] = useTransition()

  const getSourceData = (type: AlphabetType, level: Difficulty) => {
    let source: Character[] = []

    const includeHiragana = type === 'hiragana' || type === 'mix'
    const includeKatakana = type === 'katakana' || type === 'mix'

    if (level === 'normal') {
      if (includeHiragana) source = [...source, ...HIRAGANA_DATA.basic.items]
      if (includeKatakana) source = [...source, ...KATAKANA_DATA.basic.items]
    } else {
      if (includeHiragana) source = [
        ...source, 
        ...HIRAGANA_DATA.basic.items, 
        ...HIRAGANA_DATA.dakuten.items, 
        ...HIRAGANA_DATA.yoon.items
      ]
      if (includeKatakana) source = [
        ...source, 
        ...KATAKANA_DATA.basic.items, 
        ...KATAKANA_DATA.dakuten.items, 
        ...KATAKANA_DATA.yoon.items
      ]
    }

    return source.filter(i => i.char !== '')
  }

  const generateQuiz = (level: Difficulty) => {
    setDifficulty(level)
    let generatedQuestions: Question[] = []
    
    const sourceData = getSourceData(alphabetType!, level)

    if (level === 'normal' || level === 'medium') {
      const selected = shuffle(sourceData) // Use ALL available characters
      generatedQuestions = selected.map(charObj => {
        // Find 3 wrong options from the SAME alphabet type if possible, or mixed
        const wrongChars = shuffle(sourceData.filter(c => c.romaji !== charObj.romaji)).slice(0, 3)
        return {
          charStr: charObj.char,
          romajiStr: charObj.romaji,
          options: shuffle([charObj.romaji, ...wrongChars.map(c => c.romaji)]),
          isKatakana: /[ア-ン]/.test(charObj.char),
          hint: charObj.hint
        }
      })
    } 
    else if (level === 'hard') {
      // Group ALL characters into 2-character words so every character is tested once
      const allChars = shuffle(sourceData)
      
      for (let i = 0; i < allChars.length; i += 2) {
        const char1 = allChars[i]
        const char2 = allChars[i+1]
        
        let wordChar = char1.char
        let wordRomaji = char1.romaji
        let isKatakanaWord = /[ア-ン]/.test(char1.char)
        
        if (char2) {
          wordChar += char2.char
          wordRomaji += char2.romaji
        }
        
        const options = [wordRomaji]
        while (options.length < 4) {
          let wrongRomaji = sourceData[Math.floor(Math.random() * sourceData.length)].romaji
          if (char2) wrongRomaji += sourceData[Math.floor(Math.random() * sourceData.length)].romaji
          
          if (!options.includes(wrongRomaji)) options.push(wrongRomaji)
        }

        generatedQuestions.push({
          charStr: wordChar,
          romajiStr: wordRomaji,
          options: shuffle(options),
          isKatakana: isKatakanaWord,
          hint: "Break it down! Read each character one by one."
        })
      }
    }

    setQuestions(generatedQuestions)
    resetState()
  }

  const startMistakesRetry = () => {
    const retriedQuestions = wrongQuestions.map(q => {
      let wrongRomajis: string[] = []
      if (difficulty === 'hard') {
        const sourceData = getSourceData(alphabetType!, difficulty!)
        while (wrongRomajis.length < 3) {
          let w = ''
          for(let i=0; i < (q.charStr.length > 2 ? 3 : 2); i++) w += sourceData[Math.floor(Math.random() * sourceData.length)].romaji
          if(w !== q.romajiStr && !wrongRomajis.includes(w)) wrongRomajis.push(w)
        }
      } else {
        const sourceData = getSourceData(alphabetType!, difficulty!)
        wrongRomajis = shuffle(sourceData.filter(c => c.romaji !== q.romajiStr)).slice(0, 3).map(c => c.romaji)
      }
      return {
        ...q,
        options: shuffle([q.romajiStr, ...wrongRomajis])
      }
    })

    setQuestions(shuffle(retriedQuestions))
    resetState()
  }

  const resetState = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setShowHint(false)
    setWrongQuestions([])
  }

  const handleAnswer = (index: number) => {
    if (hasAnswered) return
    setSelectedAnswer(index)
    setHasAnswered(true)

    const q = questions[currentQuestion]
    if (q.options[index] === q.romajiStr) {
      setScore(s => s + (showHint ? 5 : 10))
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    } else {
      setWrongQuestions(prev => [...prev, q])
    }
  }

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
      setShowHint(false)
    } else {
      startTransition(async () => {
        if (score > 0) await saveQuizScore(userId, score)
        setShowResults(true)
      })
    }
  }

  const handleBackToStart = () => {
    setAlphabetType(null)
    setDifficulty(null)
  }

  // SCREEN 1: Alphabet Type Selection
  if (!alphabetType) {
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Card className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4">What do you want to practice?</h2>
          <p className="text-muted-foreground mb-8">Select which alphabet system to focus on.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors" onClick={() => setAlphabetType('hiragana')}>
              <span className="text-2xl font-bold text-blue-600">Hiragana</span>
              <span className="text-sm text-muted-foreground">ひらがな</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors" onClick={() => setAlphabetType('katakana')}>
              <span className="text-2xl font-bold text-purple-600">Katakana</span>
              <span className="text-sm text-muted-foreground">カタカナ</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors" onClick={() => setAlphabetType('mix')}>
              <span className="text-2xl font-bold text-orange-600">Mixed</span>
              <span className="text-sm text-muted-foreground">Both Alphabets</span>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // SCREEN 2: Difficulty Selection
  if (!difficulty) {
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-6">
        <Button variant="ghost" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={handleBackToStart}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="text-center p-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Level</h2>
          <p className="text-muted-foreground mb-8">Practicing: <strong className="uppercase text-primary">{alphabetType}</strong></p>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-500 transition-colors" onClick={() => generateQuiz('normal')}>
              <span className="text-xl font-bold text-green-600">Normal</span>
              <span className="text-xs text-muted-foreground whitespace-normal">Basic single characters (a-n)</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500 transition-colors" onClick={() => generateQuiz('medium')}>
              <span className="text-xl font-bold text-blue-600">Medium</span>
              <span className="text-xs text-muted-foreground whitespace-normal">All characters including Dakuten & Yoon</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-500 transition-colors" onClick={() => generateQuiz('hard')}>
              <span className="text-xl font-bold text-red-600">Hard</span>
              <span className="text-xs text-muted-foreground whitespace-normal">Combined characters (words) randomly generated</span>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // SCREEN 3: Results
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
            {isPerfect ? "Flawless victory! You got everything right!" : `Great effort! You made ${wrongQuestions.length} mistake(s).`}
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
            Start New Quiz
          </Button>
          <Link href="/"><Button variant="secondary">Dashboard</Button></Link>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  // SCREEN 4: Active Quiz
  const progress = ((currentQuestion) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-12 mb-28 md:mb-0 space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToStart} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
        <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">{alphabetType} - {difficulty}</span>
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full">XP: {score}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="overflow-hidden border-2 shadow-sm transition-all duration-300">
        <CardContent className="space-y-6 flex flex-col items-center pt-8">
          
          <div className="text-center relative w-full flex flex-col items-center justify-center min-h-[220px]">
            <span className="absolute top-0 text-xs font-bold tracking-wider text-muted-foreground bg-secondary px-4 py-1.5 rounded-full uppercase">
              {question.isKatakana ? 'KATAKANA' : 'HIRAGANA'}
            </span>
            <h2 className="text-8xl sm:text-[140px] font-black text-primary leading-tight mt-10 mb-4 tracking-tight break-words max-w-full text-center">
              {question.charStr}
            </h2>
            
            <div className="absolute right-0 top-0">
               {!hasAnswered && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowHint(h => !h)} 
                    className={`rounded-full h-12 w-12 transition-colors ${showHint ? 'text-amber-600 bg-amber-100/80' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-100/50'}`} 
                    title="Toggle hint"
                  >
                    <Lightbulb className="w-7 h-7" />
                  </Button>
               )}
            </div>
          </div>
          
          {(showHint || hasAnswered) && (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-5 py-3 rounded-lg animate-in fade-in text-center max-w-md border border-amber-100 dark:border-amber-900/50">
              {showHint && <Lightbulb className="w-4 h-4 inline-block mr-2 -mt-0.5" />}
              {question.hint || "This combined character doesn't have a direct visual hint. Break it down into its root characters!"}
            </p>
          )}

          <p className="text-sm md:text-lg text-foreground font-medium w-full text-left md:text-center mt-2 px-1">Select the correct Romaji reading:</p>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = question.romajiStr === option
              
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
                  className={`h-auto py-5 sm:py-6 text-xl sm:text-2xl font-medium relative lowercase transition-all active:scale-[0.98] ${hasAnswered && isSelected && !isCorrect ? 'animate-in slide-in-from-left-1 slide-in-from-right-1 duration-100' : ''} ${variant === 'outline' ? 'hover:bg-primary/5 hover:border-primary/50' : ''}`}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <span className="whitespace-normal break-words pr-8 w-full text-center">{option}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 className="absolute right-4 h-6 w-6 text-green-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="absolute right-4 h-6 w-6 text-red-500 bg-white rounded-full flex-shrink-0 animate-in zoom-in" />}
                </Button>
              )
            })}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t bg-slate-50 dark:bg-slate-900/50 rounded-b-xl p-4 fixed bottom-0 left-0 right-0 z-50 md:relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none">
          <Button onClick={nextQuestion} disabled={!hasAnswered || isPending} size="lg" className="w-full md:w-auto font-bold text-lg h-14 md:px-12 transition-all">
            {isPending ? (
              <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving Score...</>
            ) : currentQuestion + 1 === questions.length ? (
              'Finish Quiz & Save Score'
            ) : (
              'Next Question'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

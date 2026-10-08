'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveQuizScore } from '@/lib/actions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Lightbulb, RotateCcw } from 'lucide-react'
import { getAllItemsFlat, Character, HIRAGANA_DATA, KATAKANA_DATA } from '@/lib/alphabetData'

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
      const selected = shuffle(sourceData).slice(0, 10)
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
      for (let i = 0; i < 10; i++) {
        const wordLength = Math.floor(Math.random() * 2) + 2 // 2 or 3 chars
        
        // Pick whether this specific word will be Hiragana or Katakana (if mixed)
        const isKatakanaWord = alphabetType === 'katakana' || (alphabetType === 'mix' && Math.random() > 0.5)
        
        const wordSource = isKatakanaWord 
          ? [...KATAKANA_DATA.basic.items, ...KATAKANA_DATA.dakuten.items, ...KATAKANA_DATA.yoon.items].filter(i => i.char)
          : [...HIRAGANA_DATA.basic.items, ...HIRAGANA_DATA.dakuten.items, ...HIRAGANA_DATA.yoon.items].filter(i => i.char)

        let wordChar = ''
        let wordRomaji = ''
        for (let j = 0; j < wordLength; j++) {
          const randomChar = wordSource[Math.floor(Math.random() * wordSource.length)]
          wordChar += randomChar.char
          wordRomaji += randomChar.romaji
        }

        const options = [wordRomaji]
        while (options.length < 4) {
          let wrongRomaji = ''
          for (let j = 0; j < wordLength; j++) {
            wrongRomaji += wordSource[Math.floor(Math.random() * wordSource.length)].romaji
          }
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
  return (
    <div className="max-w-2xl mx-auto mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToStart} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <Badge variant="outline">Question {currentQuestion + 1} of {questions.length}</Badge>
          <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'default' : 'secondary'} className="uppercase">
            {alphabetType} - {difficulty}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">XP: {score}</span>
        </CardHeader>
        <CardContent className="space-y-8 flex flex-col items-center pt-2">
          
          <div className="text-center space-y-2">
            <span className="text-sm font-bold tracking-wider text-muted-foreground bg-secondary px-3 py-1 rounded">
              {question.isKatakana ? 'KATAKANA' : 'HIRAGANA'}
            </span>
            <h2 className="text-[90px] sm:text-[120px] font-bold text-primary leading-tight my-4 tracking-widest break-all">
              {question.charStr}
            </h2>
            <p className="text-lg text-foreground font-medium">Select the correct Romaji reading:</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
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
                  className="h-auto py-6 text-2xl sm:text-3xl font-normal relative lowercase transition-all hover:bg-primary/10 break-all"
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <span className="truncate pr-8">{option}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 className="absolute right-4 h-6 w-6 text-green-500 bg-white rounded-full flex-shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="absolute right-4 h-6 w-6 text-red-500 bg-white rounded-full flex-shrink-0" />}
                </Button>
              )
            })}
          </div>

          {/* Hint Area */}
          <div className="w-full mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold text-sm">Need a hint? (Halves XP for this question)</span>
              </div>
              {!showHint && !hasAnswered && (
                <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-amber-600 border-amber-200 hover:bg-amber-100">
                  Show Hint
                </Button>
              )}
            </div>
            {(showHint || hasAnswered) && (
              <p className="mt-2 text-sm text-muted-foreground animate-in fade-in">
                {question.hint || "This combined character doesn't have a direct visual hint. Break it down into its root characters!"}
              </p>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <Button onClick={nextQuestion} disabled={!hasAnswered || isPending} size="lg" className="w-full sm:w-auto font-bold text-lg h-14 px-8">
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

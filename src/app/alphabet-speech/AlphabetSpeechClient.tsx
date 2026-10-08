"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Check, X, ArrowRight, RotateCcw, ArrowLeft, Lightbulb, Volume2, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { saveQuizScore } from "@/lib/actions"
import { Character, HIRAGANA_DATA, KATAKANA_DATA } from "@/lib/alphabetData"

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5)

type SpeechQuestion = {
  charStr: string
  romajiStr: string
  isKatakana: boolean
}

type Difficulty = 'normal' | 'medium' | 'hard'
type AlphabetType = 'hiragana' | 'katakana' | 'mix'

interface AlphabetSpeechClientProps {
  userId: string
}

export default function AlphabetSpeechClient({ userId }: AlphabetSpeechClientProps) {
  const [alphabetType, setAlphabetType] = useState<AlphabetType | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [questions, setQuestions] = useState<SpeechQuestion[]>([])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [hasSupport, setHasSupport] = useState(true)
  const [showHint, setShowHint] = useState(false)
  
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [wrongQuestions, setWrongQuestions] = useState<SpeechQuestion[]>([])
  const [isPending, startTransition] = useTransition()

  const currentItem = questions[currentIndex]
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.lang = "ja-JP"
        recognitionRef.current.interimResults = false

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript
          setTranscript(transcriptText)
          verifyReading(transcriptText)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      } else {
        setHasSupport(false)
      }
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [currentIndex, questions])

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
    let generatedQuestions: SpeechQuestion[] = []
    const sourceData = getSourceData(alphabetType!, level)

    if (level === 'normal' || level === 'medium') {
      const selected = shuffle(sourceData).slice(0, 10)
      generatedQuestions = selected.map(charObj => ({
        charStr: charObj.char,
        romajiStr: charObj.romaji,
        isKatakana: /[ア-ン]/.test(charObj.char)
      }))
    } else if (level === 'hard') {
      for (let i = 0; i < 10; i++) {
        const wordLength = Math.floor(Math.random() * 2) + 2 // 2 or 3 chars
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
        generatedQuestions.push({
          charStr: wordChar,
          romajiStr: wordRomaji,
          isKatakana: isKatakanaWord
        })
      }
    }
    setQuestions(generatedQuestions)
    resetState()
  }

  const resetState = () => {
    setCurrentIndex(0)
    setScore(0)
    setShowResults(false)
    setWrongQuestions([])
    setTranscript("")
    setResult(null)
    setShowHint(false)
  }

  const handleBackToStart = () => {
    setAlphabetType(null)
    setDifficulty(null)
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      setResult(null)
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const verifyReading = (spokenText: string) => {
    if (!currentItem) return
    const normalizedSpoken = spokenText.replace(/\s+/g, '').toLowerCase()
    const targetRomaji = currentItem.romajiStr.toLowerCase()
    const targetChar = currentItem.charStr
    
    if (normalizedSpoken.includes(targetChar) || normalizedSpoken === targetRomaji || spokenText.includes(targetChar) || targetChar.includes(normalizedSpoken)) {
      setResult("success")
      setScore(s => s + (showHint ? 5 : 10))
    } else {
      setResult("error")
      setWrongQuestions(prev => [...prev, currentItem])
    }
  }

  const playAudio = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.speak(utterance)
    }
  }

  const nextWord = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setTranscript("")
      setResult(null)
      setShowHint(false)
    } else {
      startTransition(async () => {
        if (score > 0) await saveQuizScore(userId, score)
        setShowResults(true)
      })
    }
  }

  const startMistakesRetry = () => {
    setQuestions(shuffle([...wrongQuestions]))
    resetState()
  }

  if (!hasSupport) {
    return (
      <Card className="max-w-2xl mx-auto border-red-500 bg-red-50 dark:bg-red-950/20 mt-12">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400 font-medium text-center">
            Your browser does not support the Web Speech API. Please try using Google Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!alphabetType) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Card className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4">What do you want to practice?</h2>
          <p className="text-muted-foreground mb-8">Select which alphabet system to speak.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => setAlphabetType('hiragana')}>
              <span className="text-2xl font-bold text-blue-600">Hiragana</span>
              <span className="text-sm text-muted-foreground">ひらがな</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-950" onClick={() => setAlphabetType('katakana')}>
              <span className="text-2xl font-bold text-purple-600">Katakana</span>
              <span className="text-sm text-muted-foreground">カタカナ</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-950" onClick={() => setAlphabetType('mix')}>
              <span className="text-2xl font-bold text-orange-600">Mixed</span>
              <span className="text-sm text-muted-foreground">Both Alphabets</span>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!difficulty) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" className="inline-flex items-center text-sm font-medium text-muted-foreground" onClick={handleBackToStart}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="text-center p-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Level</h2>
          <p className="text-muted-foreground mb-8">Speaking: <strong className="uppercase text-primary">{alphabetType}</strong></p>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950" onClick={() => generateQuiz('normal')}>
              <span className="text-xl font-bold text-green-600">Normal</span>
              <span className="text-xs text-muted-foreground whitespace-normal">Basic single characters</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => generateQuiz('medium')}>
              <span className="text-xl font-bold text-blue-600">Medium</span>
              <span className="text-xs text-muted-foreground whitespace-normal">Including Dakuten & Yoon</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col gap-2 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => generateQuiz('hard')}>
              <span className="text-xl font-bold text-red-600">Hard</span>
              <span className="text-xs text-muted-foreground whitespace-normal">Random generated words</span>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const isPerfect = wrongQuestions.length === 0
    return (
      <Card className="max-w-2xl mx-auto mt-12 text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Speech Practice Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-primary">+{score} XP</div>
          <p className="text-xl text-muted-foreground">
            {isPerfect ? "Flawless pronunciation!" : `You had trouble with ${wrongQuestions.length} item(s).`}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          {!isPerfect && (
            <Button onClick={startMistakesRetry} className="bg-amber-500 hover:bg-amber-600 text-white">
              <RotateCcw className="mr-2 h-4 w-4" /> Retry Mistakes
            </Button>
          )}
          <Button variant="outline" onClick={handleBackToStart}>Start New Practice</Button>
          <Link href="/"><Button variant="secondary">Dashboard</Button></Link>
        </CardFooter>
      </Card>
    )
  }

  const progress = ((currentIndex) / questions.length) * 100

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToStart} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quit
        </Button>
        <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'default' : 'secondary'} className="uppercase">
          {alphabetType} - {difficulty}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">XP: {score}</span>
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Item {currentIndex + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="overflow-hidden border-2 transition-all duration-300">
        <CardHeader className="text-center pb-2 bg-muted/30">
          <CardTitle className="text-muted-foreground font-normal text-sm uppercase tracking-wider">
            Speak this out loud
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-10 pb-8 flex flex-col items-center justify-center min-h-[250px] relative">
          <div className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-primary">
            {currentItem?.charStr}
          </div>
          
          <div className="flex items-center gap-3">
            {showHint ? (
              <div className="animate-in fade-in flex items-center bg-muted/30 px-6 py-2 rounded-full">
                <div className="text-xl md:text-2xl text-foreground font-semibold">
                  {currentItem?.romajiStr}
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="text-muted-foreground hover:text-primary">
                <Lightbulb className="w-4 h-4 mr-2" /> Show Pronunciation
              </Button>
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => playAudio(currentItem?.charStr || "")} 
              className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary/10" 
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </Button>
          </div>

          {transcript && (
            <div className={`mt-8 px-6 py-3 rounded-2xl w-full text-center text-lg font-medium transition-colors ${
              result === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              result === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              'bg-muted text-foreground'
            }`}>
              <span className="text-xs uppercase tracking-wider block opacity-70 mb-1">You said</span>
              "{transcript}"
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 bg-muted/10 pt-6">
          <Button 
            variant={isListening ? "destructive" : "default"} 
            size="lg" 
            className="flex-1 w-full sm:w-auto h-16 text-lg relative overflow-hidden group"
            onClick={toggleListening}
          >
            {isListening ? (
              <>
                <span className="absolute inset-0 bg-red-500/20 animate-pulse"></span>
                <MicOff className="w-6 h-6 mr-3 z-10" /> 
                <span className="z-10">Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" /> 
                Tap to Speak
              </>
            )}
          </Button>

          <Button 
            variant={result === 'success' ? 'default' : 'secondary'} 
            size="lg" 
            className="flex-1 w-full sm:w-auto h-16 text-lg"
            onClick={nextWord}
          >
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>{result === 'success' ? 'Next Word' : 'Skip Word'} <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {result === 'success' && (
        <div className="flex items-center justify-center text-green-600 font-bold text-lg animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-6 h-6 mr-2" /> Perfect pronunciation!
        </div>
      )}
      {result === 'error' && (
        <div className="flex items-center justify-center text-red-500 font-bold text-lg animate-in fade-in slide-in-from-bottom-4">
          <X className="w-6 h-6 mr-2" /> Not quite right. Try again!
        </div>
      )}
    </div>
  )
}

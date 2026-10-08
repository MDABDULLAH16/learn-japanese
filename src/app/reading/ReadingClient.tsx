"use client"

import { useState, useEffect, useRef } from "react"
import { readingData, ReadingItem, ReadingLevel } from "@/lib/readingData"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Check, X, ArrowRight, RotateCcw, ArrowLeft, Lightbulb, Volume2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface ReadingClientProps {
  userId: string
}

export default function ReadingClient({ userId }: ReadingClientProps) {
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [hasSupport, setHasSupport] = useState(true)
  const [showHint, setShowHint] = useState(false)
  
  const currentCategory = selectedLevel ? readingData[selectedLevel] : null
  const currentItem = currentCategory?.items[currentIndex]
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for browser support
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
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [currentIndex, selectedLevel])

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
    const normalizedSpoken = spokenText.replace(/\s+/g, '')
    const normalizedTarget = currentItem.japanese.replace(/\s+/g, '')
    
    if (normalizedSpoken.includes(normalizedTarget) || normalizedTarget.includes(normalizedSpoken) || spokenText.includes(currentItem.japanese)) {
      setResult("success")
    } else {
      setResult("error")
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
    if (currentCategory && currentIndex < currentCategory.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setTranscript("")
      setResult(null)
      setShowHint(false)
    } else if (currentCategory && currentIndex >= currentCategory.items.length - 1) {
      setCurrentIndex(currentIndex + 1) // to trigger completion screen
      setShowHint(false)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setTranscript("")
    setResult(null)
    setShowHint(false)
  }

  const backToMenu = () => {
    setSelectedLevel(null)
    setCurrentIndex(0)
    setTranscript("")
    setResult(null)
    setShowHint(false)
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

  // SCREEN 1: Level Selection
  if (!selectedLevel) {
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Card className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4">Reading Practice</h2>
          <p className="text-muted-foreground mb-8">Choose a level to start practicing your pronunciation.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.entries(readingData) as [ReadingLevel, typeof readingData[ReadingLevel]][]).map(([levelKey, levelData]) => (
              <Button 
                key={levelKey}
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 hover:bg-primary/5 transition-colors" 
                onClick={() => setSelectedLevel(levelKey)}
              >
                <span className="text-xl font-bold capitalize text-primary">{levelKey}</span>
                <span className="text-sm font-semibold whitespace-normal">{levelData.title}</span>
                <span className="text-xs text-muted-foreground whitespace-normal">{levelData.description}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // SCREEN 3: Completion
  if (currentCategory && currentIndex >= currentCategory.items.length) {
    const levelKeys = Object.keys(readingData) as ReadingLevel[]
    const currentLevelIndex = levelKeys.indexOf(selectedLevel)
    const nextLevelKey = currentLevelIndex < levelKeys.length - 1 ? levelKeys[currentLevelIndex + 1] : null

    return (
      <Card className="max-w-2xl mx-auto mt-12 text-center py-12">
        <CardContent>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground mb-8">You've finished the {currentCategory.title} practice.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={restart} size="lg" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
            </Button>
            {nextLevelKey ? (
              <Button onClick={() => {
                setSelectedLevel(nextLevelKey)
                setCurrentIndex(0)
                setTranscript("")
                setResult(null)
                setShowHint(false)
              }} size="lg">
                Next Level <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={backToMenu} size="lg">
                Back to Menu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // SCREEN 2: Practice
  const progress = ((currentIndex) / (currentCategory?.items.length || 1)) * 100

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={backToMenu} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <span className="text-sm font-medium text-primary uppercase tracking-wider">{currentCategory?.title}</span>
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Word {currentIndex + 1} of {currentCategory?.items.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="overflow-hidden border-2 transition-all duration-300">
        <CardHeader className="text-center pb-2 bg-muted/30">
          <CardTitle className="text-muted-foreground font-normal text-sm uppercase tracking-wider">
            Read this out loud
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-10 pb-8 flex flex-col items-center justify-center min-h-[250px] relative">
          <div className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-primary">
            {currentItem?.japanese}
          </div>
          
          <div className="text-xl text-muted-foreground font-medium mb-4">
            {currentItem?.meaning}
          </div>
          
          <div className="flex items-center gap-3">
            {showHint ? (
              <div className="animate-in fade-in flex items-center bg-muted/30 px-6 py-2 rounded-full">
                <div className="text-xl md:text-2xl text-foreground font-semibold">
                  {currentItem?.romaji}
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
              onClick={() => playAudio(currentItem?.japanese || "")} 
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
            {result === 'success' ? 'Next Word' : 'Skip Word'} <ArrowRight className="w-5 h-5 ml-2" />
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

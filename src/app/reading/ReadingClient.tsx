"use client"

import { useState, useEffect, useRef } from "react"
import { readingData, ReadingItem, ReadingLevel } from "@/lib/readingData"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Check, X, ArrowRight, RotateCcw, ArrowLeft, Lightbulb, Volume2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { convertToRomaji } from "@/lib/actions"

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
  const [attempts, setAttempts] = useState(0)
  const [spokenRomaji, setSpokenRomaji] = useState<string | null>(null)

  const currentCategory = selectedLevel ? readingData[selectedLevel] : null
  const currentItem = currentCategory?.items[currentIndex]

  const currentItemRef = useRef(currentItem)
  useEffect(() => {
    currentItemRef.current = currentItem
  }, [currentItem])

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false // Stop automatically after one utterance
        recognitionRef.current.lang = "ja-JP"
        recognitionRef.current.interimResults = false
        recognitionRef.current.maxAlternatives = 10
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
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) { }
      }
      setIsListening(false)
    } else {
      setTranscript("")
      setResult(null)

      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const results = event.results[current]

          let bestTranscript = results[0].transcript
          let isMatch = false
          const item = currentItemRef.current

          if (!item) return

          if (!bestTranscript.trim()) {
            bestTranscript = "(could not recognize)"
          }

          const targetRomaji = item.romaji.replace(/\s+/g, '').toLowerCase()

          // Loop through all alternatives
          for (let i = 0; i < results.length; i++) {
            const text = results[i].transcript

            const normalizedSpoken = text.replace(/\s+/g, '')
            const normalizedTarget = item.japanese.replace(/\s+/g, '')
            const spokenLower = normalizedSpoken.toLowerCase()
            const isDigitMatch = /^\d+$/.test(normalizedSpoken) && item.meaning.includes(normalizedSpoken)

            if (
              normalizedSpoken.includes(normalizedTarget) ||
              normalizedTarget.includes(normalizedSpoken) ||
              text.includes(item.japanese) ||
              spokenLower === targetRomaji ||
              spokenLower.includes(targetRomaji) ||
              isDigitMatch
            ) {
              bestTranscript = text
              isMatch = true
              break
            }
          }

          setTranscript(bestTranscript)
          if (isMatch) {
            setResult("success")
            if (recognitionRef.current) {
              try { recognitionRef.current.stop() } catch (e) { }
            }
            // Fetch Romaji for the correct answer to display in the UI
            if (!/^\d+$/.test(bestTranscript) && !bestTranscript.startsWith("(")) {
              convertToRomaji(bestTranscript).then(r => {
                if (r) setSpokenRomaji(r.toLowerCase())
              })
            }
          } else {
            // Check Romaji asynchronously to handle Kanji conversions (e.g., spoken 'mizu' -> Chrome returns '水' -> target is 'みず')
            if (!/^\d+$/.test(bestTranscript) && !bestTranscript.startsWith("(")) {
              convertToRomaji(bestTranscript).then(r => {
                const rLower = r ? r.toLowerCase() : null
                if (rLower) setSpokenRomaji(rLower)

                if (rLower && rLower.replace(/\s+/g, '') === targetRomaji) {
                  setResult("success")
                  if (recognitionRef.current) {
                    try { recognitionRef.current.stop() } catch (e) { }
                  }
                } else {
                  setResult("error")
                  setAttempts(a => a + 1)
                }
              })
            } else {
              setResult("error")
              setAttempts(a => a + 1)
            }
          }
        }

        recognitionRef.current.onnomatch = () => {
          setTranscript("(could not recognize)")
          setResult("error")
          setAttempts(a => a + 1)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          if (event.error === 'no-speech') {
            setTranscript("(no speech detected)")
            setResult("error")
            setAttempts(a => a + 1)
          } else {
            setTranscript(`(Error: ${event.error})`)
            setResult("error")
            setIsListening(false)
          }
          if (event.error === 'not-allowed') {
            alert("Microphone access denied. Please check your browser permissions.")
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (error) {
          console.error("Failed to start speech recognition:", error)
          setIsListening(false)
        }
      }
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
      setSpokenRomaji(null)
      setResult(null)
      setShowHint(false)
      setAttempts(0)
    } else if (currentCategory && currentIndex >= currentCategory.items.length - 1) {
      setCurrentIndex(currentIndex + 1) // to trigger completion screen
      setShowHint(false)
      setAttempts(0)
      setSpokenRomaji(null)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setTranscript("")
    setSpokenRomaji(null)
    setResult(null)
    setShowHint(false)
    setAttempts(0)
  }

  const backToMenu = () => {
    setSelectedLevel(null)
    setCurrentIndex(0)
    setTranscript("")
    setSpokenRomaji(null)
    setResult(null)
    setShowHint(false)
    setAttempts(0)
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
                setSpokenRomaji(null)
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
          <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-primary break-words break-keep px-2 max-w-full text-center leading-tight">
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

          {(isListening || transcript || result) && (
            <div key={attempts + (result === 'success' ? 's' : 'e')} className={`mt-8 px-6 py-3 rounded-2xl w-full text-center text-lg font-medium transition-all duration-300 animate-in fade-in zoom-in-95 ${result === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shadow-sm shadow-green-500/20' :
                result === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 shadow-sm shadow-red-500/20' :
                  'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse'
              }`}>
              <span className="text-xs uppercase tracking-wider block opacity-70 mb-1">
                {result === 'error' || result === 'success' ? "You said" : transcript ? "Listening..." : "Listening to your voice..."}
              </span>
              <span className={!transcript ? "opacity-50 italic" : ""}>
                {transcript ? `"${transcript}"` : "(Speak now)"}
              </span>
              {result && spokenRomaji && (
                <span className={`block mt-2 text-sm font-bold opacity-90 animate-in slide-in-from-top-1 ${result === 'success' ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-400'}`}>
                  Pronounced: <span className={result === 'success' ? 'underline decoration-green-500' : 'underline decoration-red-400'}>{spokenRomaji}</span>
                </span>
              )}
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
        <div key={`err-${attempts}`} className="flex items-center justify-center text-red-500 font-bold text-lg animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
          <X className="w-6 h-6 mr-2" /> Not quite right. Try again! {attempts > 0 ? `(${attempts})` : ''}
        </div>
      )}
    </div>
  )
}

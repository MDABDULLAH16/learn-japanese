'use client'

import { useState } from 'react'
import {
  Volume2,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  char: string
  audio: string
  correct: string
  options: string[]
  type: 'hiragana' | 'katakana' | 'kanji'
  hint: string
}

const QUESTIONS: Question[] = [
  {
    char: 'あ',
    audio: 'あ',
    correct: 'a',
    options: ['a', 'o', 'ko', 'te'],
    type: 'hiragana',
    hint: 'The first character in the Japanese Hiragana syllabary',
  },
  {
    char: 'カ',
    audio: 'カ',
    correct: 'ka',
    options: ['ta', 'ka', 'ku', 'ro'],
    type: 'katakana',
    hint: 'Katakana character used in words like "Kamera"',
  },
  {
    char: '桜',
    audio: 'さくら',
    correct: 'Cherry blossom (Sakura)',
    options: ['Mountain', 'Cherry blossom (Sakura)', 'River', 'Sun'],
    type: 'kanji',
    hint: 'Japan’s iconic spring flower',
  },
  {
    char: 'ねこ',
    audio: 'ねこ',
    correct: 'Cat',
    options: ['Dog', 'Cat', 'Fish', 'Bird'],
    type: 'hiragana',
    hint: 'Furry animal that says "nya nya"',
  },
  {
    char: '山',
    audio: 'やま',
    correct: 'Mountain (Yama)',
    options: ['Fire', 'River', 'Mountain (Yama)', 'Tree'],
    type: 'kanji',
    hint: 'Resembles three peaks of a mountain',
  },
]

export function KanaMiniQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentQ = QUESTIONS[currentIndex]

  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    } catch {
      // Ignore
    }
  }

  const handleSelect = (option: string) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(option)
    playAudio(currentQ.audio)

    const isCorrect = option === currentQ.correct
    if (isCorrect) {
      setScore((s) => s + 1)
    }

    setTimeout(() => {
      if (currentIndex + 1 < QUESTIONS.length) {
        setCurrentIndex((i) => i + 1)
        setSelectedAnswer(null)
      } else {
        setIsFinished(true)
      }
    }, 1200)
  }

  const restart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setIsFinished(false)
  }

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5 border border-border/80 shadow-xl relative overflow-hidden">
      {/* Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive 60-Second Challenge</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          Question {currentIndex + 1} of {QUESTIONS.length}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              What does this mean or sound like?
            </span>
            <div className="relative inline-flex items-center justify-center p-6 rounded-2xl bg-muted/60 border border-border/70 my-2 group">
              <span className="text-6xl font-black text-foreground font-serif tracking-tight select-none">
                {currentQ.char}
              </span>
              <button
                onClick={() => playAudio(currentQ.audio)}
                className="absolute -bottom-3 -right-3 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition cursor-pointer"
                title="Hear audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground italic">{currentQ.hint}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswer === opt
              const isCorrect = opt === currentQ.correct

              let btnStyle = 'bg-card border-border hover:border-primary/50 hover:bg-accent/40'
              if (selectedAnswer !== null) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold'
                } else {
                  btnStyle = 'opacity-50'
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedAnswer !== null}
                  className={`p-3.5 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm min-w-0 break-words whitespace-normal ${btnStyle}`}
                >
                  {selectedAnswer !== null && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {selectedAnswer !== null && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className="min-w-0 break-words text-center leading-snug">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-foreground">
              {score === QUESTIONS.length
                ? '完璧！ Perfect Score!'
                : score >= 3
                  ? 'よくできました！ Great Job!'
                  : 'Keep practicing! がんばって！'}
            </h4>
            <p className="text-muted-foreground text-sm mt-1">
              You scored <span className="font-bold text-foreground">{score}</span> out of{' '}
              <span className="font-bold text-foreground">{QUESTIONS.length}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-input text-xs font-semibold hover:bg-accent transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <Link
              href="/alphabet"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-md"
            >
              <span>Learn All 46 Characters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

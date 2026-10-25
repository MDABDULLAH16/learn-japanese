'use client'

import { useState } from 'react'
import {
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Keyboard,
} from 'lucide-react'
import { toHiragana, toKatakana } from '@/lib/romajiConverter'

const PRESET_EXAMPLES = [
  { romaji: 'arigatou', label: 'Thank you' },
  { romaji: 'konnichiwa', label: 'Hello' },
  { romaji: 'ohayou gozaimasu', label: 'Good morning' },
  { romaji: 'sushi', label: 'Sushi' },
  { romaji: 'anime', label: 'Anime' },
  { romaji: 'nihon', label: 'Japan' },
  { romaji: 'watashi wa gakusei desu', label: 'I am a student' },
  { romaji: 'otanjoubi omedetou', label: 'Happy Birthday' },
]

export function ConverterClient() {
  const [inputText, setInputText] = useState('konnichiwa')
  const [copiedType, setCopiedType] = useState<'hira' | 'kata' | null>(null)
  const [isPlaying, setIsPlaying] = useState<'hira' | 'kata' | null>(null)

  const hiraganaOutput = toHiragana(inputText)
  const katakanaOutput = toKatakana(inputText)

  const copyToClipboard = (text: string, type: 'hira' | 'kata') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedType(type)
      setTimeout(() => setCopiedType(null), 1800)
    }
  }

  const playAudio = (text: string, type: 'hira' | 'kata') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      u.rate = 0.85
      setIsPlaying(type)
      u.onend = () => setIsPlaying(null)
      u.onerror = () => setIsPlaying(null)
      window.speechSynthesis.speak(u)
    } catch {
      setIsPlaying(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-wide border border-cyan-500/20">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Real-time Japanese Typist</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Romaji to Kana Converter
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Type English letters (Romaji) and watch them instantly convert into authentic Japanese
          Hiragana and Katakana with native audio playback.
        </p>
      </header>

      {/* Main Input Box */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="romaji-input"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
          >
            <Keyboard className="w-4 h-4 text-primary" />
            <span>Type Romaji (English Alphabet)</span>
          </label>
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          id="romaji-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here, e.g. arigatou, tokyo, sugoi..."
          rows={3}
          className="w-full p-4 rounded-2xl bg-muted/30 border border-border/80 text-lg sm:text-xl font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground font-medium mr-1">Quick Try:</span>
          {PRESET_EXAMPLES.map((ex) => (
            <button
              key={ex.romaji}
              onClick={() => setInputText(ex.romaji)}
              className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
            >
              {ex.romaji} <span className="opacity-60 text-[10px]">({ex.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Results: Hiragana & Katakana */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* 1. Hiragana Card */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-4 relative group">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                ひらがな
              </span>
              <h3 className="text-lg font-bold text-foreground">Hiragana Output</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(hiraganaOutput, 'hira')}
                disabled={!hiraganaOutput}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                title="Copy Hiragana"
              >
                {copiedType === 'hira' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => playAudio(hiraganaOutput, 'hira')}
                disabled={!hiraganaOutput}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isPlaying === 'hira'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
                title="Listen to Japanese pronunciation"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying === 'hira' ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          <div className="min-h-[110px] p-4 rounded-2xl bg-muted/40 flex items-center justify-center text-center">
            <span className="text-3xl sm:text-4xl font-black text-foreground font-serif tracking-wide select-all">
              {hiraganaOutput || (
                <span className="text-muted-foreground/40 text-lg font-sans">
                  Hiragana will appear here
                </span>
              )}
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>Used for native Japanese words and grammar.</span>
            <span>{hiraganaOutput.length} chars</span>
          </div>
        </div>

        {/* 2. Katakana Card */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-4 relative group">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                カタカナ
              </span>
              <h3 className="text-lg font-bold text-foreground">Katakana Output</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(katakanaOutput, 'kata')}
                disabled={!katakanaOutput}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                title="Copy Katakana"
              >
                {copiedType === 'kata' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => playAudio(katakanaOutput, 'kata')}
                disabled={!katakanaOutput}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isPlaying === 'kata'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white'
                }`}
                title="Listen to Japanese pronunciation"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying === 'kata' ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          <div className="min-h-[110px] p-4 rounded-2xl bg-muted/40 flex items-center justify-center text-center">
            <span className="text-3xl sm:text-4xl font-black text-foreground font-serif tracking-wide select-all">
              {katakanaOutput || (
                <span className="text-muted-foreground/40 text-lg font-sans">
                  Katakana will appear here
                </span>
              )}
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>Used for foreign loanwords, names, and emphasis.</span>
            <span>{katakanaOutput.length} chars</span>
          </div>
        </div>
      </div>

      {/* Typing Tips Section */}
      <div className="p-6 rounded-3xl bg-muted/30 border border-border/60 space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Quick Typing Tips:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-xl bg-card border border-border/60">
            <span className="font-bold text-foreground">Double Consonants (っ):</span>
            <p className="mt-0.5">
              Type double letters like `matte` → `まって` or `kekka` → `けっか`.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60">
            <span className="font-bold text-foreground">Special Sounds:</span>
            <p className="mt-0.5">Type `shi` (し), `chi` (ち), `tsu` (つ), `fu` (ふ), `nn` (ん).</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/60">
            <span className="font-bold text-foreground">Combination Sounds:</span>
            <p className="mt-0.5">Type `kya` (きゃ), `shu` (しゅ), `cho` (ちょ), `ryo` (りょ).</p>
          </div>
        </div>
      </div>
    </div>
  )
}

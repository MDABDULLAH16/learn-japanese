'use client'

import { useState } from 'react'
import { Volume2, Sparkles, ArrowRight, Check } from 'lucide-react'

interface SampleItem {
  char: string
  romaji: string
  meaning: string
  reading?: string
  example?: string
  exampleMeaning?: string
}

const HIRAGANA_SAMPLES: SampleItem[] = [
  {
    char: 'あ',
    romaji: 'a',
    meaning: 'Sound "a" as in father',
    example: 'ありがとう',
    exampleMeaning: 'Thank you',
  },
  {
    char: 'い',
    romaji: 'i',
    meaning: 'Sound "i" as in machine',
    example: 'いぬ (Inu)',
    exampleMeaning: 'Dog',
  },
  {
    char: 'う',
    romaji: 'u',
    meaning: 'Sound "u" as in rude',
    example: 'うみ (Umi)',
    exampleMeaning: 'Ocean / Sea',
  },
  {
    char: 'え',
    romaji: 'e',
    meaning: 'Sound "e" as in red',
    example: 'えき (Eki)',
    exampleMeaning: 'Train Station',
  },
  {
    char: 'お',
    romaji: 'o',
    meaning: 'Sound "o" as in open',
    example: 'お茶 (Ocha)',
    exampleMeaning: 'Green Tea',
  },
  {
    char: 'か',
    romaji: 'ka',
    meaning: 'Sound "ka"',
    example: 'かわ (Kawa)',
    exampleMeaning: 'River',
  },
  {
    char: 'さ',
    romaji: 'sa',
    meaning: 'Sound "sa"',
    example: 'さくら (Sakura)',
    exampleMeaning: 'Cherry Blossom',
  },
]

const KATAKANA_SAMPLES: SampleItem[] = [
  {
    char: 'ア',
    romaji: 'a',
    meaning: 'Katakana sound "a"',
    example: 'アイス (Aisu)',
    exampleMeaning: 'Ice cream',
  },
  {
    char: 'カ',
    romaji: 'ka',
    meaning: 'Katakana sound "ka"',
    example: 'カメラ (Kamera)',
    exampleMeaning: 'Camera',
  },
  {
    char: 'サ',
    romaji: 'sa',
    meaning: 'Katakana sound "sa"',
    example: 'サラダ (Sarada)',
    exampleMeaning: 'Salad',
  },
  {
    char: 'コ',
    romaji: 'ko',
    meaning: 'Katakana sound "ko"',
    example: 'コーヒー (Kōhī)',
    exampleMeaning: 'Coffee',
  },
  {
    char: 'テ',
    romaji: 'te',
    meaning: 'Katakana sound "te"',
    example: 'テレビ (Terebi)',
    exampleMeaning: 'Television',
  },
  {
    char: 'パ',
    romaji: 'pa',
    meaning: 'Katakana sound "pa"',
    example: 'パン (Pan)',
    exampleMeaning: 'Bread',
  },
]

const KANJI_SAMPLES: SampleItem[] = [
  {
    char: '日',
    romaji: 'hi / nichi',
    meaning: 'Sun, Day, Japan',
    reading: 'On: ニチ, Kun: ひ',
    example: '日本 (Nihon)',
    exampleMeaning: 'Japan',
  },
  {
    char: '月',
    romaji: 'tsuki / getsu',
    meaning: 'Moon, Month',
    reading: 'On: ゲツ, Kun: つき',
    example: '今月 (Kongetsu)',
    exampleMeaning: 'This month',
  },
  {
    char: '火',
    romaji: 'hi / ka',
    meaning: 'Fire',
    reading: 'On: カ, Kun: ひ',
    example: '火曜日 (Kayōbi)',
    exampleMeaning: 'Tuesday',
  },
  {
    char: '水',
    romaji: 'mizu / sui',
    meaning: 'Water',
    reading: 'On: スイ, Kun: みず',
    example: '水曜日 (Suiyōbi)',
    exampleMeaning: 'Wednesday',
  },
  {
    char: '木',
    romaji: 'ki / moku',
    meaning: 'Tree, Wood',
    reading: 'On: モク, Kun: き',
    example: '木曜日 (Mokuyōbi)',
    exampleMeaning: 'Thursday',
  },
  {
    char: '桜',
    romaji: 'sakura',
    meaning: 'Cherry Blossom',
    reading: 'On: オウ, Kun: さくら',
    example: '桜の花 (Sakura no hana)',
    exampleMeaning: 'Cherry flower',
  },
  {
    char: '心',
    romaji: 'kokoro / shin',
    meaning: 'Heart, Mind, Spirit',
    reading: 'On: シン, Kun: こころ',
    example: '真心 (Magokoro)',
    exampleMeaning: 'True sincerity',
  },
]

export function InteractiveHeroExplorer() {
  const [tab, setTab] = useState<'hiragana' | 'katakana' | 'kanji'>('hiragana')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const items =
    tab === 'hiragana' ? HIRAGANA_SAMPLES : tab === 'katakana' ? KATAKANA_SAMPLES : KANJI_SAMPLES

  const active = items[selectedIndex] || items[0]

  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsPlaying(false)
    }
  }

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-card/80 border border-border/80 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Preview</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">Tap & Listen to Japanese</h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-muted/80 rounded-xl">
          <button
            onClick={() => {
              setTab('hiragana')
              setSelectedIndex(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === 'hiragana'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ひらがな (Hiragana)
          </button>
          <button
            onClick={() => {
              setTab('katakana')
              setSelectedIndex(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === 'katakana'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            カタカナ (Katakana)
          </button>
          <button
            onClick={() => {
              setTab('kanji')
              setSelectedIndex(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === 'kanji'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            漢字 (Kanji)
          </button>
        </div>
      </div>

      {/* Main Character Presentation Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6">
        {/* Left: Giant Calligraphy Card with Audio Button */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center relative overflow-hidden group">
          <span className="text-7xl sm:text-8xl font-black text-foreground tracking-tight select-none py-2 transition-transform duration-300 group-hover:scale-110 font-serif">
            {active.char}
          </span>
          <div className="text-sm font-semibold text-primary uppercase tracking-widest mt-1">
            {active.romaji}
          </div>

          <button
            onClick={() => playAudio(active.char)}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-primary text-primary-foreground scale-95'
                : 'bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
            title="Hear native pronunciation"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
            <span>{isPlaying ? 'Playing...' : 'Pronounce'}</span>
          </button>
        </div>

        {/* Right: Details, Readings, Example & Audio */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Meaning & Usage
            </span>
            <div className="text-xl font-bold text-foreground mt-0.5">{active.meaning}</div>
            {active.reading && (
              <div className="text-xs font-medium text-muted-foreground mt-1 bg-muted/60 px-2.5 py-1 rounded-md inline-block">
                {active.reading}
              </div>
            )}
          </div>

          {active.example && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Real-life Example Word
              </span>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-base font-bold text-foreground">{active.example}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {active.exampleMeaning}
                  </span>
                </div>
                <button
                  onClick={() => playAudio(active.example || active.char)}
                  className="p-2 rounded-lg bg-background hover:bg-accent text-primary transition cursor-pointer"
                  title="Play example pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Character Selector Pills */}
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-2">
              Select character:
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.char}
                  onClick={() => {
                    setSelectedIndex(idx)
                    playAudio(item.char)
                  }}
                  className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center transition cursor-pointer ${
                    selectedIndex === idx
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-muted/80 text-foreground hover:bg-accent'
                  }`}
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          Native speech synthesis supported
        </span>
        <span className="hidden sm:inline">100% Free · No Registration Required for Alphabet</span>
      </div>
    </div>
  )
}

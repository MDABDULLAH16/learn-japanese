'use client'

import { useState, useMemo } from 'react'
import {
  Volume2,
  Copy,
  Check,
  Search,
  Sparkles,
  Compass,
  Heart,
  AlertCircle,
  Utensils,
  BookOpen,
} from 'lucide-react'
import { JAPANESE_PHRASES, JapanesePhrase } from '@/lib/phrasesData'

const CATEGORIES = [
  { id: 'all', label: 'All Phrases', icon: Sparkles, count: JAPANESE_PHRASES.length },
  {
    id: 'daily',
    label: 'Daily Greetings & Manners',
    icon: BookOpen,
    count: JAPANESE_PHRASES.filter((p) => p.category === 'daily').length,
  },
  {
    id: 'anime',
    label: 'Anime & Pop Culture',
    icon: Heart,
    count: JAPANESE_PHRASES.filter((p) => p.category === 'anime').length,
  },
  {
    id: 'travel',
    label: 'Travel & Dining',
    icon: Utensils,
    count: JAPANESE_PHRASES.filter((p) => p.category === 'travel').length,
  },
  {
    id: 'emergency',
    label: 'Emergency & Safety',
    icon: AlertCircle,
    count: JAPANESE_PHRASES.filter((p) => p.category === 'emergency').length,
  },
]

export function PhrasesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const filteredPhrases = useMemo(() => {
    return JAPANESE_PHRASES.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        item.japanese.toLowerCase().includes(q) ||
        item.romaji.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.bengali.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q)

      return matchesCategory && matchesQuery
    })
  }, [selectedCategory, searchQuery])

  const playAudio = (phrase: JapanesePhrase) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(phrase.japanese)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      setPlayingId(phrase.id)
      utterance.onend = () => setPlayingId(null)
      utterance.onerror = () => setPlayingId(null)
      window.speechSynthesis.speak(utterance)
    } catch {
      setPlayingId(null)
    }
  }

  const copyText = (phrase: JapanesePhrase) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${phrase.japanese} (${phrase.romaji}) - ${phrase.english}`)
      setCopiedId(phrase.id)
      setTimeout(() => setCopiedId(null), 1800)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide border border-rose-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Free Essential Japanese</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Essential Japanese Phrases
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Must-know Japanese phrases for anime fans, travelers, and daily conversation with native
          pronunciation audio & Bengali meanings.
        </p>

        {/* Search bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrase, English, or বাংলা..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border hover:bg-accent text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Phrases Grid */}
      {filteredPhrases.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPhrases.map((phrase) => {
            const isPlaying = playingId === phrase.id
            const isCopied = copiedId === phrase.id

            return (
              <div
                key={phrase.id}
                className="p-5 rounded-3xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group relative"
              >
                {/* Top Row: Category tag and Action buttons */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {phrase.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(phrase)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => playAudio(phrase)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isPlaying
                          ? 'bg-primary text-primary-foreground scale-95'
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                      }`}
                      title="Listen to Japanese pronunciation"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Phrase Typography */}
                <div className="space-y-1">
                  <div className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors font-serif">
                    {phrase.japanese}
                  </div>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest">
                    {phrase.romaji}
                  </div>
                </div>

                {/* Meanings */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                    <span>{phrase.english}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{phrase.bengali}</div>
                </div>

                {/* Cultural / Usage Context */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground italic leading-relaxed">
                  💡 {phrase.context}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <p className="text-lg font-bold text-foreground">No phrases found</p>
          <p className="text-xs">Try adjusting your search query or switching categories.</p>
        </div>
      )}
    </div>
  )
}

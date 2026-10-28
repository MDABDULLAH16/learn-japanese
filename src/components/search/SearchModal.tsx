'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  X,
  Volume2,
  BookOpen,
  Languages,
  ArrowRight,
  History,
  Trash2,
  Sparkles,
  Command,
  CornerDownLeft,
} from 'lucide-react'
import {
  searchJapaneseData,
  SearchResult,
  SearchResultVocab,
  SearchResultKanji,
  splitHighlight,
} from '@/lib/searchEngine'

const RECENT_SEARCHES_KEY = 'learn_japanese_recent_searches'
const MAX_RECENT_SEARCHES = 8

export function SearchModal({
  isOpen,
  onClose,
  initialQuery = '',
}: {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'vocabulary' | 'kanji'>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES))
        }
      }
    } catch {
      // Ignore
    }
  }, [])

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery)
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen, initialQuery])

  // Save query to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim()
    if (!clean || clean.length < 2) return
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      )
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }, [])

  // Clear all recent searches
  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {
      // Ignore
    }
    setRecentSearches([])
  }

  // Remove single recent search
  const removeRecentSearch = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== itemToRemove)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  // Execute search
  const searchOutput = searchJapaneseData(query, {
    category: activeTab,
    limit: 25,
  })

  const results =
    activeTab === 'all'
      ? searchOutput.results
      : activeTab === 'vocabulary'
        ? searchOutput.vocabResults
        : searchOutput.kanjiResults

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, activeTab])

  // Scroll active item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return
    const activeElem = resultsContainerRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null
    if (activeElem) {
      activeElem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Audio speech synthesis
  const playSpeech = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85

      const voices = window.speechSynthesis.getVoices()
      const jaVoice = voices.find(
        (v) => v.lang.startsWith('ja') || v.name.includes('Japanese') || v.name.includes('Kyoko')
      )
      if (jaVoice) {
        utterance.voice = jaVoice
      }

      setPlayingAudioKey(key)
      utterance.onend = () => setPlayingAudioKey(null)
      utterance.onerror = () => setPlayingAudioKey(null)

      window.speechSynthesis.speak(utterance)
    } catch {
      setPlayingAudioKey(null)
    }
  }

  // Handle select / enter
  const handleSelectResult = (result: SearchResult) => {
    if (query.trim()) {
      saveRecentSearch(query)
    }
    onClose()
    if (result.type === 'kanji') {
      router.push(
        `/kanji?level=${result.item.level}&lesson=${result.item.lesson}&kanji=${encodeURIComponent(
          result.item.kanji
        )}`
      )
    } else {
      router.push(
        `/vocabulary?lesson=${result.item.lesson_number}&word=${encodeURIComponent(
          result.item.nihongo
        )}`
      )
    }
  }

  // Go to full search page
  const handleGoToFullSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query)
    }
    onClose()
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${activeTab}`)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex])
      } else if (query.trim()) {
        handleGoToFullSearch()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border/80 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 text-foreground"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/70 bg-muted/20">
          <Search className="w-5 h-5 text-primary shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vocab & kanji (e.g. watashi, বই, わたし, 日, 4 strokes)..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium outline-hidden placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border/70 bg-background text-[11px] font-mono text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-border/60 bg-background/50 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>সব ({searchOutput.totalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vocabulary')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vocabulary'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ভোকাবুলারি ({searchOutput.vocabResults.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kanji')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kanji'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>কাঞ্জি ({searchOutput.kanjiResults.length})</span>
          </button>

          {query.trim() && (
            <button
              type="button"
              onClick={handleGoToFullSearch}
              className="ml-auto flex items-center gap-1 text-[11px] text-primary hover:underline font-bold px-2 py-1 rounded-lg hover:bg-primary/5 transition cursor-pointer shrink-0"
            >
              <span>Full Page</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {/* Empty Query State: Show Recent Searches & Quick Suggestions */}
          {!query.trim() && (
            <div className="py-4 space-y-6">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-primary" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term)
                          inputRef.current?.focus()
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary text-xs font-medium cursor-pointer border border-border/50 transition"
                      >
                        <Search className="w-3 h-3 text-muted-foreground group-hover:text-primary transition" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Jump Suggestions */}
              <div className="space-y-2 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Try Searching
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'watashi (আমি)', term: 'watashi' },
                    { label: 'বই (hon)', term: 'বই' },
                    { label: 'খাবার / খাওয়া', term: 'খাবার' },
                    { label: '日 (সূর্য / দিন)', term: '日' },
                    { label: '4 strokes কাঞ্জি', term: '4 strokes' },
                    { label: 'Lesson 1', term: 'Lesson 1' },
                  ].map((sug) => (
                    <button
                      key={sug.term}
                      type="button"
                      onClick={() => {
                        setQuery(sug.term)
                        inputRef.current?.focus()
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-accent hover:border-primary/40 text-left text-xs transition cursor-pointer"
                    >
                      <span className="font-medium truncate">{sug.label}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() && results.length > 0 && (
            <div className="space-y-1.5">
              {results.map((res, index) => {
                const isSelected = index === selectedIndex
                const audioKey =
                  res.type === 'vocabulary' ? `vocab-${res.item.nihongo}` : `kanji-${res.item.kanji}`
                const isPlaying = playingAudioKey === audioKey

                if (res.type === 'vocabulary') {
                  const vocab = res.item
                  return (
                    <div
                      key={`v-${vocab.lesson_number}-${vocab.nihongo}-${index}`}
                      data-index={index}
                      onClick={() => handleSelectResult(res)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-card border-border/60 hover:bg-muted/50'
                      }`}
                    >
                      {/* Vocab Icon */}
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                        L{vocab.lesson_number}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-foreground">
                            {vocab.nihongo}
                          </span>
                          {vocab.kanji && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {vocab.kanji}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-mono">
                            {vocab.romaji}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ml-auto">
                            {res.matchedLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="text-foreground font-semibold">
                            {vocab.bangla}
                          </span>
                          <span>•</span>
                          <span className="text-muted-foreground/80 font-medium">
                            উচ্চারণ: {vocab.uchharon}
                          </span>
                          {vocab.english && (
                            <>
                              <span>•</span>
                              <span className="italic text-muted-foreground truncate hidden sm:inline">
                                {vocab.english}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Audio Button */}
                      <button
                        type="button"
                        onClick={(e) => playSpeech(vocab.nihongo, audioKey, e)}
                        className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                          isPlaying
                            ? 'bg-primary text-primary-foreground animate-bounce'
                            : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                        }`}
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                }

                // Kanji Result
                const kanji = res.item
                return (
                  <div
                    key={`k-${kanji.id}-${index}`}
                    data-index={index}
                    onClick={() => handleSelectResult(res)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-card border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    {/* Kanji Character Box */}
                    <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-2xl shadow-xs">
                      {kanji.kanji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">
                          {kanji.meaning_bn}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({kanji.meaning_en})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                          {kanji.level || 'N5'} • {kanji.stroke_count} strokes
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold ml-auto">
                          {res.matchedLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                        {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                          <span>
                            <strong className="text-foreground">Kun:</strong>{' '}
                            {kanji.kunyomi.join(', ')}
                          </span>
                        )}
                        {kanji.onyomi && kanji.onyomi.length > 0 && (
                          <span>
                            <strong className="text-foreground">On:</strong>{' '}
                            {kanji.onyomi.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Audio Button */}
                    <button
                      type="button"
                      onClick={(e) =>
                        playSpeech(
                          kanji.kunyomi?.[0] || kanji.onyomi?.[0] || kanji.kanji,
                          audioKey,
                          e
                        )
                      }
                      className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-primary text-primary-foreground animate-bounce'
                          : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                      }`}
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* No results state */}
          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                &ldquo;{query}&rdquo; এর সাথে কোনো শব্দ বা কাঞ্জি পাওয়া যায়নি
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                রোমাজি (যেমন: <code className="text-primary font-mono">watashi</code>,{' '}
                <code className="text-primary font-mono">hon</code>), বাংলা অর্থ (যেমন: &ldquo;বই&rdquo;),
                অথবা স্ট্রোক দিয়ে সার্চ করার চেষ্টা করুন।
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-border/60 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/70 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/70 font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/70 font-mono text-[10px]">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>

          {query.trim() && (
            <button
              type="button"
              onClick={handleGoToFullSearch}
              className="flex items-center gap-1 text-primary hover:underline font-bold transition cursor-pointer"
            >
              <span>View all results in search page</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

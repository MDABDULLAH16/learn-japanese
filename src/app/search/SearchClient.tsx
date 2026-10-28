'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  X,
  Volume2,
  BookOpen,
  Languages,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Check,
  ExternalLink,
  History,
  Trash2,
  RotateCcw,
  ArrowRight,
  GraduationCap,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react'
import {
  searchJapaneseData,
  SearchResult,
  SearchResultVocab,
  SearchResultKanji,
  splitHighlight,
} from '@/lib/searchEngine'
import { useRecapVocabularies } from '@/lib/recapStorage'
import { useRecapKanji } from '@/lib/kanjiRecapStorage'
import { VocabularyItem, WhitelistLevel } from '@/lib/vocabularyData'
import { KanjiItem } from '@/lib/kanjiData'
import { KanjiRecapItem } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RECENT_SEARCHES_KEY = 'learn_japanese_recent_searches'
const MAX_RECENT_SEARCHES = 8

export function SearchClient({
  userId,
  initialQuery = '',
  initialTab = 'all',
  initialLesson = 'all',
  initialLevel = 'all',
  initialStroke = 'all',
  initialVocabRecaps = [],
  initialKanjiRecaps = [],
}: {
  userId: string
  initialQuery?: string
  initialTab?: 'all' | 'vocabulary' | 'kanji'
  initialLesson?: string
  initialLevel?: string
  initialStroke?: string
  initialVocabRecaps?: VocabularyItem[]
  initialKanjiRecaps?: KanjiRecapItem[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'vocabulary' | 'kanji'>(initialTab)
  const [selectedLesson, setSelectedLesson] = useState<string>(initialLesson)
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel)
  const [selectedStroke, setSelectedStroke] = useState<string>(initialStroke)
  const [showFilters, setShowFilters] = useState(false)
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  // Recap hooks for bookmarks
  const {
    recapList: vocabRecapList,
    getItemLevel: getVocabLevel,
    setLevel: setVocabLevel,
  } = useRecapVocabularies(initialVocabRecaps, userId)

  const {
    recapList: kanjiRecapList,
    getItemLevel: getKanjiLevel,
    setLevel: setKanjiLevel,
  } = useRecapKanji(initialKanjiRecaps, userId)

  // Load recent searches
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

  // Save to recent searches
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

  // Remove single search item
  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  // Sync URL query without full reload
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (activeTab !== 'all') params.set('tab', activeTab)
    if (selectedLesson !== 'all') params.set('lesson', selectedLesson)
    if (selectedLevel !== 'all') params.set('level', selectedLevel)
    if (selectedStroke !== 'all') params.set('stroke', selectedStroke)

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    window.history.replaceState(null, '', newUrl)
  }, [query, activeTab, selectedLesson, selectedLevel, selectedStroke])

  // Parse filters
  const parsedLesson = selectedLesson === 'all' ? 'all' : parseInt(selectedLesson, 10)
  const parsedStroke = selectedStroke === 'all' ? 'all' : parseInt(selectedStroke, 10)

  // Run search engine
  const searchOutput = useMemo(() => {
    return searchJapaneseData(query, {
      category: activeTab,
      lesson: parsedLesson,
      jlptLevel: selectedLevel as any,
      strokeCount: parsedStroke,
      limit: 150,
    })
  }, [query, activeTab, parsedLesson, selectedLevel, parsedStroke])

  const results =
    activeTab === 'all'
      ? searchOutput.results
      : activeTab === 'vocabulary'
        ? searchOutput.vocabResults
        : searchOutput.kanjiResults

  const hasActiveFilters =
    selectedLesson !== 'all' || selectedLevel !== 'all' || selectedStroke !== 'all'

  const resetFilters = () => {
    setSelectedLesson('all')
    setSelectedLevel('all')
    setSelectedStroke('all')
  }

  // Audio Speech
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

  // Highlight component
  const Highlighted = ({ text }: { text: string }) => {
    if (!text) return null
    const parts = splitHighlight(text, query)
    return (
      <>
        {parts.map((p, idx) =>
          p.isMatch ? (
            <mark
              key={idx}
              className="bg-amber-300 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 px-0.5 rounded-xs font-semibold"
            >
              {p.text}
            </mark>
          ) : (
            <span key={idx}>{p.text}</span>
          )
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 pb-20">
      {/* Hero Search Header */}
      <div className="relative border-b border-border/60 bg-linear-to-b from-primary/5 via-card to-background pt-10 pb-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb / Title */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্মার্ট জাপানিজ সার্চ ইঞ্জিন</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Search Japanese Vocabulary & Kanji
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              বাংলা অর্থ, বাংলা উচ্চারণ, Romaji, হিরাগানা, কাতাকানা, কাঞ্জি ও স্ট্রোক কাউন্ট দিয়ে
              খুঁজুন।
            </p>
          </div>

          {/* Main Search Input Box */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative flex items-center bg-card rounded-2xl sm:rounded-3xl border-2 border-primary/20 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 shadow-xl transition-all duration-200">
              <div className="pl-4 sm:pl-6 text-muted-foreground">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    saveRecentSearch(query)
                  }
                }}
                placeholder="Search anything (e.g. watashi, বই, わたし, 日, 4 strokes)..."
                className="w-full py-4 sm:py-5 px-3 sm:px-4 bg-transparent text-sm sm:text-lg font-medium outline-hidden placeholder:text-muted-foreground/60 text-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  className="p-2 mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (query.trim()) saveRecentSearch(query)
                }}
                className="mr-2 sm:mr-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition shadow-sm cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            {/* Smart Detection Bar */}
            {searchOutput.detectedQueries.hiragana &&
              searchOutput.detectedQueries.hiragana !== query.trim().toLowerCase() && (
                <div className="flex items-center gap-2 mt-2 px-3 text-xs text-muted-foreground animate-in fade-in duration-200">
                  <span className="font-semibold text-primary">Romaji Detected:</span>
                  <span className="px-2 py-0.5 rounded bg-muted font-bold text-foreground">
                    Hiragana: {searchOutput.detectedQueries.hiragana}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-muted font-bold text-foreground">
                    Katakana: {searchOutput.detectedQueries.katakana}
                  </span>
                  {searchOutput.detectedQueries.extractedStroke !== null && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      Stroke: {searchOutput.detectedQueries.extractedStroke}
                    </span>
                  )}
                </div>
              )}
          </div>

          {/* Quick Search Ideas & Recent Searches */}
          <div className="max-w-3xl mx-auto space-y-3">
            {recentSearches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                  <History className="w-3.5 h-3.5 text-primary" />
                  Recent:
                </span>
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      inputRef.current?.focus()
                    }}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/60 hover:border-primary text-foreground text-xs cursor-pointer transition shadow-2xs hover:bg-muted/50"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="text-muted-foreground hover:text-destructive transition p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[11px] text-muted-foreground hover:text-destructive underline ml-auto transition cursor-pointer"
                >
                  Clear history
                </button>
              </div>
            )}

            {/* Suggested Search Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Popular:
              </span>
              {[
                { label: 'watashi (আমি)', val: 'watashi' },
                { label: 'বই (hon)', val: 'বই' },
                { label: 'খাবার (খাওয়া)', val: 'খাবার' },
                { label: '日 (সূর্য/দিন)', val: '日' },
                { label: '4 strokes', val: '4 strokes' },
                { label: 'Lesson 1', val: 'Lesson 1' },
                { label: 'sensei (শিক্ষক)', val: 'sensei' },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => {
                    setQuery(chip.val)
                    saveRecentSearch(chip.val)
                    inputRef.current?.focus()
                  }}
                  className="px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-muted-foreground font-medium border border-border/40 transition cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-6">
        {/* Navigation Tabs & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/60 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>সকল ফলাফল</span>
              <Badge variant="secondary" className="text-[11px] font-bold">
                {searchOutput.totalCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vocabulary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'vocabulary'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>ভোকাবুলারি</span>
              <Badge variant="secondary" className="text-[11px] font-bold">
                {searchOutput.vocabResults.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kanji')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'kanji'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Languages className="w-4 h-4 text-violet-500" />
              <span>কাঞ্জি</span>
              <Badge variant="secondary" className="text-[11px] font-bold">
                {searchOutput.kanjiResults.length}
              </Badge>
            </button>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                hasActiveFilters || showFilters
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Dropdowns */}
        {showFilters && (
          <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-150 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. JLPT Level Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                JLPT Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm font-medium outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="all">All Levels (N5 & N4)</option>
                <option value="N5">JLPT N5 (Beginner)</option>
                <option value="N4">JLPT N4 (Elementary)</option>
              </select>
            </div>

            {/* 2. Lesson Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Lesson (পাঠ)
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm font-medium outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="all">All Lessons (1–25)</option>
                {Array.from({ length: 25 }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>
                    Lesson {l}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Stroke Count Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stroke Count (স্ট্রোক সংখ্যা)
              </label>
              <select
                value={selectedStroke}
                onChange={(e) => setSelectedStroke(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border/70 bg-background text-sm font-medium outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="all">All Strokes</option>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    {s} Strokes
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Stats header */}
        {query.trim() && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              &ldquo;<strong className="text-foreground">{query}</strong>&rdquo; এর জন্য{' '}
              <strong className="text-foreground">{results.length}</strong> টি ফলাফল পাওয়া গেছে
            </div>
          </div>
        )}

        {/* Empty State when no results found */}
        {query.trim() && results.length === 0 && (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-card border border-border/60 p-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                কোনো মিল পাওয়া যায়নি
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                &ldquo;{query}&rdquo; শব্দটি কোনো ভোকাবুলারি বা কাঞ্জির সাথে মেলেনি। রোমাজি, বাংলা অর্থ
                অথবা অন্য কোনো শব্দ দিয়ে পুনরায় চেষ্টা করুন।
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  resetFilters()
                  inputRef.current?.focus()
                }}
                className="rounded-xl"
              >
                ফিল্টার রিসেট করুন
              </Button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((res, index) => {
              if (res.type === 'vocabulary') {
                const vocab = res.item
                const audioKey = `vocab-${vocab.nihongo}`
                const isPlaying = playingAudioKey === audioKey
                const currentLevel = getVocabLevel(vocab)

                return (
                  <Card
                    key={`vocab-${vocab.lesson_number}-${vocab.nihongo}-${index}`}
                    className="group border-border/70 hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden rounded-2xl flex flex-col justify-between bg-card"
                  >
                    <CardContent className="p-5 space-y-3.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/vocabulary?lesson=${vocab.lesson_number}&word=${encodeURIComponent(vocab.nihongo)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Lesson {vocab.lesson_number}</span>
                        </Link>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            {res.matchedLabel}
                          </span>

                          {/* Audio button */}
                          <button
                            type="button"
                            onClick={(e) => playSpeech(vocab.nihongo, audioKey, e)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isPlaying
                                ? 'bg-primary text-primary-foreground animate-bounce border-primary'
                                : 'border-border/70 hover:bg-primary/10 hover:text-primary text-muted-foreground'
                            }`}
                            title="উচ্চারণ শুনুন"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Main Japanese & Kanji */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-2xl font-bold tracking-tight text-foreground">
                            <Highlighted text={vocab.nihongo} />
                          </span>
                          {vocab.kanji && (
                            <span className="text-base font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              <Highlighted text={vocab.kanji} />
                            </span>
                          )}
                        </div>

                        {/* Romaji & Bangla Uchharon */}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-mono flex-wrap">
                          <span className="text-primary font-semibold">
                            <Highlighted text={vocab.romaji} />
                          </span>
                          <span>•</span>
                          <span className="font-sans text-muted-foreground">
                            উচ্চারণ: <Highlighted text={vocab.uchharon} />
                          </span>
                        </div>
                      </div>

                      {/* Bangla and English Meanings */}
                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <div className="text-sm font-bold text-foreground">
                          <Highlighted text={vocab.bangla} />
                        </div>
                        {vocab.english && (
                          <div className="text-xs text-muted-foreground italic">
                            <Highlighted text={vocab.english} />
                          </div>
                        )}
                      </div>
                    </CardContent>

                    {/* Bottom Action Footer */}
                    <div className="px-5 py-2.5 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs">
                      {/* Whitelist / Recap toggle */}
                      <div className="flex items-center gap-1">
                        {(['normal', 'medium', 'hard'] as WhitelistLevel[]).map((lvl) => {
                          const isActive = currentLevel === lvl
                          const label = lvl === 'normal' ? 'সহজ' : lvl === 'medium' ? 'মাঝারি' : 'কঠিন'
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setVocabLevel(vocab, lvl)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                isActive
                                  ? lvl === 'normal'
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : lvl === 'medium'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-rose-500 text-white shadow-xs'
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                              title={`রিভিসন লেভেল: ${label}`}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>

                      <Link
                        href={`/vocabulary?lesson=${vocab.lesson_number}&word=${encodeURIComponent(vocab.nihongo)}`}
                        className="text-primary hover:underline font-bold text-[11px] flex items-center gap-0.5"
                      >
                        <span>Lesson এ যান</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                )
              }

              // Kanji Card
              const kanji = res.item
              const audioKey = `kanji-${kanji.kanji}`
              const isPlaying = playingAudioKey === audioKey
              const currentLevel = getKanjiLevel(kanji.id)

              return (
                <Card
                  key={`kanji-${kanji.id}-${index}`}
                  className="group border-border/70 hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden rounded-2xl flex flex-col justify-between bg-card"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Kanji Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/kanji/${kanji.id}`}
                          className="w-14 h-14 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-3xl shadow-sm transition group-hover:scale-105 shrink-0"
                          title="বিস্তারিত কাঞ্জি পেজে যান"
                        >
                          {kanji.kanji}
                        </Link>
                        <div>
                          <Link
                            href={`/kanji/${kanji.id}`}
                            className="text-base font-bold text-foreground hover:text-primary transition line-clamp-1"
                          >
                            <Highlighted text={kanji.meaning_bn} />
                          </Link>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            <Highlighted text={kanji.meaning_en} />
                          </div>
                        </div>
                      </div>

                      {/* Audio button */}
                      <button
                        type="button"
                        onClick={(e) =>
                          playSpeech(
                            kanji.kunyomi?.[0] || kanji.onyomi?.[0] || kanji.kanji,
                            audioKey,
                            e
                          )
                        }
                        className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                          isPlaying
                            ? 'bg-primary text-primary-foreground animate-bounce border-primary'
                            : 'border-border/70 hover:bg-primary/10 hover:text-primary text-muted-foreground'
                        }`}
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
                        {res.matchedLabel}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {kanji.level || 'N5'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {kanji.stroke_count} strokes
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        Lesson {kanji.lesson}
                      </span>
                    </div>

                    {/* Readings (Kunyomi & Onyomi) */}
                    <div className="space-y-1.5 text-xs pt-1 border-t border-border/50">
                      {kanji.kunyomi && kanji.kunyomi.length > 0 && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 w-8">
                            Kun:
                          </span>
                          <span className="text-foreground font-medium flex-1">
                            <Highlighted text={kanji.kunyomi.join('、')} />
                          </span>
                        </div>
                      )}
                      {kanji.onyomi && kanji.onyomi.length > 0 && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 w-8">
                            On:
                          </span>
                          <span className="text-foreground font-medium flex-1">
                            <Highlighted text={kanji.onyomi.join('、')} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Compound Examples Preview if available */}
                    {kanji.examples && kanji.examples.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          উদাহরণ শব্দ (Compound words):
                        </div>
                        <div className="space-y-1">
                          {kanji.examples.slice(0, 2).map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="text-xs flex items-center justify-between text-muted-foreground bg-muted/30 px-2 py-1 rounded-md"
                            >
                              <span className="font-bold text-foreground">
                                <Highlighted text={ex.word} /> ({ex.reading})
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                <Highlighted text={ex.meaning_bn} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Bottom Action Footer */}
                  <div className="px-5 py-2.5 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs">
                    {/* Kanji Recap buttons */}
                    <div className="flex items-center gap-1">
                      {(['normal', 'medium', 'hard'] as WhitelistLevel[]).map((lvl) => {
                        const isActive = currentLevel === lvl
                        const label = lvl === 'normal' ? 'সহজ' : lvl === 'medium' ? 'মাঝারি' : 'কঠিন'
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setKanjiLevel(kanji, lvl)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                              isActive
                                ? lvl === 'normal'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : lvl === 'medium'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-rose-500 text-white shadow-xs'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={`কাঞ্জি রিভিসন লেভেল: ${label}`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/kanji?level=${kanji.level}&lesson=${kanji.lesson}&kanji=${encodeURIComponent(kanji.kanji)}`}
                        className="text-primary hover:underline font-bold text-[11px] flex items-center gap-0.5"
                        title="Lesson এ কাঞ্জি কার্ডটি দেখুন"
                      >
                        <span>Lesson এ দেখুন</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <span className="text-muted-foreground/40">•</span>
                      <Link
                        href={`/kanji/${kanji.id}`}
                        className="text-muted-foreground hover:text-foreground font-semibold text-[11px] flex items-center gap-0.5"
                        title="স্ট্রোক অ্যানিমেশন ও বিস্তারিত"
                      >
                        <span>স্ট্রোক অর্ডার</span>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

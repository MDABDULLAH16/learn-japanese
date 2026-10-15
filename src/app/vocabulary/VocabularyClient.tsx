'use client'

import { useState } from 'react'
import { VOCABULARY_DATA, Lesson, VocabularyItem } from '@/lib/vocabularyData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Volume2, 
  X, 
  Trophy, 
  Bookmark, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react'
import { useRecapVocabularies } from '@/lib/recapStorage'

export function VocabularyClient({ userId }: { userId: string }) {
  const [selectedLesson, setSelectedLesson] = useState<number | 'recap'>(VOCABULARY_DATA.lessons[0].lesson_number)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  const { recapList, isSaved, toggle, clear, isLoaded } = useRecapVocabularies()

  const currentLesson = typeof selectedLesson === 'number'
    ? VOCABULARY_DATA.lessons.find(l => l.lesson_number === selectedLesson) || VOCABULARY_DATA.lessons[0]
    : null
  
  const totalVocabularies = VOCABULARY_DATA.lessons.reduce((acc, lesson) => acc + lesson.vocabularies.length, 0);

  return (
    <div className="max-w-5xl mx-auto mt-6 md:mt-12 mb-28 md:mb-12 space-y-8 px-4 w-full overflow-x-hidden sm:overflow-x-visible">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">Vocabulary Practice</h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Total: {totalVocabularies}
            </Badge>
            <button
              onClick={() => setSelectedLesson('recap')}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
              title="Click to view Recap / Whitelist Lesson"
            >
              <Bookmark className="w-3 h-3 fill-current" />
              Recap: {recapList.length}
            </button>
          </div>
          <p className="text-muted-foreground mt-1">Learn new words and build your custom recap list.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {recapList.length >= 4 && (
            <Link href="/vocabulary-quiz?lesson=recap">
              <Button variant="outline" className="gap-2 shadow-sm font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                <Bookmark className="w-4 h-4 fill-current" /> Recap Quiz
              </Button>
            </Link>
          )}
          <Link href="/vocabulary-quiz">
            <Button className="gap-2 shadow-sm font-semibold">
              <Trophy className="w-4 h-4 text-amber-300" /> Vocabulary Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Lesson Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x w-full max-w-full px-1">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap pr-2">Select Lesson:</span>
        
        {/* Dedicated Recap / Whitelist Lesson Button */}
        <Button
          variant={selectedLesson === 'recap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLesson('recap')}
          className={`rounded-full snap-start whitespace-nowrap flex-shrink-0 gap-1.5 transition-all font-semibold ${
            selectedLesson === 'recap'
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-2 ring-amber-500/30'
              : 'border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${selectedLesson === 'recap' ? 'fill-current' : ''}`} />
          Recap Lesson
          <span 
            className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedLesson === 'recap' ? 'bg-black/20 text-white' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}
          >
            {recapList.length}
          </span>
        </Button>

        <div className="h-5 w-px bg-border/60 mx-1 flex-shrink-0" />

        {VOCABULARY_DATA.lessons.map(lesson => (
          <Button
            key={lesson.lesson_number}
            variant={selectedLesson === lesson.lesson_number ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLesson(lesson.lesson_number)}
            className="rounded-full snap-start whitespace-nowrap flex-shrink-0"
          >
            Lesson {lesson.lesson_number} ({lesson.vocabularies.length})
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {selectedLesson === 'recap' ? (
          <div className="space-y-6">
            {/* Recap Lesson Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-7 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Bookmark className="h-4 w-4 fill-current" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">Recap & Whitelist Lesson</h2>
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold px-2.5 py-0.5">
                      {recapList.length} {recapList.length === 1 ? 'Word' : 'Words'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Your personal recap collection. Click the bookmark icon beside the speaker on any vocabulary card to add or remove words anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {recapList.length >= 4 && (
                    <Link href="/vocabulary-quiz?lesson=recap">
                      <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold">
                        <Trophy className="w-3.5 h-3.5 text-amber-200" /> Quiz Recap Words
                      </Button>
                    </Link>
                  )}

                  {recapList.length > 0 && (
                    !showClearConfirm ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowClearConfirm(true)}
                        className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear List
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-1 rounded-lg animate-in zoom-in-95">
                        <span className="text-xs text-destructive font-medium px-1">Clear all {recapList.length} words?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2.5 text-xs font-semibold"
                          onClick={() => {
                            clear()
                            setShowClearConfirm(false)
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowClearConfirm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Empty State vs List */}
            {recapList.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed rounded-2xl bg-secondary/10 flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-xl font-bold">No words in Recap list yet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When browsing any lesson, click the bookmark icon next to the pronunciation speaker on any card to add it to your custom Recap Lesson!
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={() => setSelectedLesson(VOCABULARY_DATA.lessons[0].lesson_number)}
                  className="mt-2 font-semibold"
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Start with Lesson {VOCABULARY_DATA.lessons[0].lesson_number}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recapList.map((vocab, index) => (
                  <LearnCard
                    key={`${vocab.nihongo}_${vocab.bangla}_${index}`}
                    vocab={vocab}
                    index={index}
                    total={recapList.length}
                    isSaved={isSaved(vocab)}
                    onToggleRecap={toggle}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <LearnSection
            lesson={currentLesson!}
            isSaved={isSaved}
            onToggleRecap={toggle}
          />
        )}
      </div>
    </div>
  )
}

function LearnSection({
  lesson,
  isSaved,
  onToggleRecap,
}: {
  lesson: Lesson
  isSaved: (vocab: VocabularyItem) => boolean
  onToggleRecap: (vocab: VocabularyItem) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lesson.vocabularies.map((vocab, index) => (
        <LearnCard
          key={`${vocab.nihongo}_${vocab.bangla}_${index}`}
          vocab={vocab}
          index={index}
          total={lesson.vocabularies.length}
          isSaved={isSaved(vocab)}
          onToggleRecap={onToggleRecap}
        />
      ))}
    </div>
  )
}

function LearnCard({ 
  vocab, 
  index, 
  total,
  isSaved,
  onToggleRecap,
}: { 
  vocab: VocabularyItem
  index: number
  total: number
  isSaved: boolean
  onToggleRecap: (vocab: VocabularyItem) => void
}) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [showKanjiModal, setShowKanjiModal] = useState(false)
  const [showModalRomaji, setShowModalRomaji] = useState(true)

  const speakJapanese = (e: React.MouseEvent) => {
    e.stopPropagation()
    const utterance = new SpeechSynthesisUtterance(vocab.nihongo)
    utterance.lang = 'ja-JP'
    window.speechSynthesis.speak(utterance)
  }

  const handleToggleRecap = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleRecap(vocab)
  }

  return (
    <>
    <Card className="overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/50 group flex flex-col w-full relative">
      <CardContent className="p-0 flex-1 flex flex-col w-full">
        <div className="p-6 flex flex-col items-center justify-center min-h-[140px] bg-gradient-to-br from-secondary/30 to-secondary/10 relative border-b w-full pt-10">
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs font-bold text-muted-foreground shadow-sm px-2 py-0.5">
              {index + 1} / {total}
            </Badge>
          </div>

          {/* Right Action Icons: Bookmark (Recap/Whitelist) + Pronounce */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full transition-all duration-200 ${
                isSaved 
                  ? 'text-amber-500 bg-amber-500/15 hover:bg-amber-500/25 hover:text-amber-600 dark:text-amber-400' 
                  : 'text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-500/10'
              }`}
              onClick={handleToggleRecap}
              title={isSaved ? "Remove from Recap / Whitelist" : "Add to Recap / Whitelist"}
              aria-label={isSaved ? "Remove from Recap" : "Add to Recap"}
            >
              <Bookmark className={`w-4 h-4 transition-transform duration-200 ${isSaved ? 'fill-amber-500 scale-110' : 'hover:scale-110'}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-primary/70 hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8 transition-colors"
              onClick={speakJapanese}
              title="Listen to pronunciation"
              aria-label="Listen to pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
          
          <h3 className="text-5xl sm:text-6xl font-black text-primary mb-2 text-center drop-shadow-sm break-words whitespace-normal px-2 leading-tight">
            {vocab.nihongo}
          </h3>
          {vocab.kanji && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowKanjiModal(true); }} 
              className="absolute top-3 left-3 hover:scale-105 transition-transform"
              title="View Kanji Details"
            >
              <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-1 h-auto bg-background/90 backdrop-blur-md shadow-sm border-primary/20 font-bold cursor-pointer hover:bg-primary/10">
                {vocab.kanji}
              </Badge>
            </button>
          )}
        </div>
        
        <div className="p-5 flex-1 bg-card flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Pronunciation Section */}
            <div className="space-y-2">
              {!showPronunciation ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all" 
                  onClick={() => setShowPronunciation(true)}
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal Pronunciation
                </Button>
              ) : (
                <div className="space-y-2 p-3 bg-secondary/30 rounded-lg animate-in zoom-in-95 duration-200 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Romaji</span>
                    <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-foreground">{vocab.romaji}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Uchharon</span>
                    <span className="text-sm font-medium bg-background px-2 py-0.5 rounded text-primary">{vocab.uchharon}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 uppercase tracking-widest" 
                    onClick={() => setShowPronunciation(false)}
                  >
                    <EyeOff className="w-3 h-3 mr-1" /> Hide
                  </Button>
                </div>
              )}
            </div>
            
            {/* Meaning Section */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              {!showMeaning ? (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary transition-all font-medium" 
                  onClick={() => setShowMeaning(true)}
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal Meaning
                </Button>
              ) : (
                <div className="space-y-3 p-3 bg-primary/5 rounded-lg animate-in zoom-in-95 duration-200 border border-primary/10">
                  <div>
                    <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">Bangla</span>
                    <span className="text-base font-bold text-blue-700 dark:text-blue-400 leading-tight">{vocab.bangla}</span>
                  </div>
                  <div className="h-px w-full bg-primary/10 my-1"></div>
                  <div>
                    <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider block mb-1">English</span>
                    <span className="text-sm font-medium text-foreground/80 leading-tight">{vocab.english}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-6 mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-primary/10 uppercase tracking-widest" 
                    onClick={() => setShowMeaning(false)}
                  >
                    <EyeOff className="w-3 h-3 mr-1" /> Hide
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </CardContent>
    </Card>

    {showKanjiModal && vocab.kanji && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowKanjiModal(false)}>
        <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border-primary/20" onClick={e => e.stopPropagation()}>
          <div className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/10 border-b flex flex-col items-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowKanjiModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-7xl font-black text-primary mb-4 mt-2">{vocab.kanji}</h2>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-muted-foreground">{vocab.nihongo}</p>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full transition-all ${
                  isSaved
                    ? 'text-amber-500 bg-amber-500/15 hover:bg-amber-500/25'
                    : 'text-muted-foreground/70 hover:text-amber-500 hover:bg-amber-500/10'
                }`}
                onClick={handleToggleRecap}
                title={isSaved ? "Remove from Recap" : "Add to Recap"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary/70 hover:text-primary rounded-full bg-primary/5 hover:bg-primary/10"
                onClick={speakJapanese}
                title="Listen Pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Bangla</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">{vocab.bangla}</p>
              </div>

              <div 
                className="bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center group"
                onClick={() => setShowModalRomaji(!showModalRomaji)}
                title={showModalRomaji ? "Click to hide Romaji" : "Click to show Romaji"}
              >
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Romaji</p>
                  <div className="h-5 w-5 flex items-center justify-center text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                    {showModalRomaji ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </div>
                </div>
                {showModalRomaji ? (
                  <p className="font-bold text-foreground transition-all">{vocab.romaji}</p>
                ) : (
                  <p className="font-bold text-muted-foreground/20 select-none blur-[3px] transition-all">{vocab.romaji}</p>
                )}
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary/60 mb-1.5">English Meaning</p>
              <p className="font-semibold text-foreground/90">{vocab.english}</p>
            </div>
          </div>
        </Card>
      </div>
    )}
    </>
  )
}

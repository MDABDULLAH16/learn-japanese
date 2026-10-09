'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markItemLearned, markAllLearned } from '@/lib/actions'
import { ArrowLeft, CheckCircle2, Volume2, Lightbulb, CheckCheck, ChevronDown, Settings2, X } from 'lucide-react'
import Link from 'next/link'
import { HIRAGANA_DATA, KATAKANA_DATA, Character, AlphabetCategory } from '@/lib/alphabetData'
import confetti from 'canvas-confetti'

export function AlphabetClient({ userId, completedIds }: { userId: string, completedIds: string[] }) {
  const [activeScript, setActiveScript] = useState<'hiragana' | 'katakana'>('hiragana')
  const [activeCategory, setActiveCategory] = useState<'basic' | 'dakuten' | 'yoon'>('basic')
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [voiceType, setVoiceType] = useState<'female' | 'male'>('female')
  const [speechRate, setSpeechRate] = useState<number>(1)
  const [volume, setVolume] = useState<number>(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'))
      setVoices(availableVoices)
    }
    
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const scriptData = activeScript === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA
  const categoryData: AlphabetCategory = scriptData[activeCategory]

  const getSelectedVoice = (gender: 'female' | 'male') => {
    if (voices.length === 0) return null;
    
    if (selectedVoiceName) {
      const explicitVoice = voices.find(v => v.name === selectedVoiceName)
      if (explicitVoice) return explicitVoice
    }
    
    if (gender === 'male') {
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('ichiro') || 
        v.name.toLowerCase().includes('otoya') ||
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('keita') 
      )
      return maleVoice || voices[0]
    } else {
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('ayumi') || 
        v.name.toLowerCase().includes('haruka') || 
        v.name.toLowerCase().includes('kyoko') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('nanami')
      )
      return femaleVoice || voices[0]
    }
  }

  const playPronunciation = (char: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(char)
    utterance.lang = 'ja-JP'
    utterance.rate = speechRate
    utterance.volume = volume

    const selectedVoice = getSelectedVoice(voiceType)
    if (selectedVoice) {
      utterance.voice = selectedVoice
      if (!selectedVoiceName && voiceType === 'male' && !selectedVoice.name.toLowerCase().match(/(ichiro|otoya|male|keita)/)) {
        utterance.pitch = 0.5
      } else if (!selectedVoiceName && voiceType === 'female') {
        utterance.pitch = 1.2
      } else {
        utterance.pitch = 1
      }
    } else {
      utterance.pitch = voiceType === 'male' ? 0.5 : 1.2
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleCharClick = (charData: Character) => {
    if (!charData.char) return
    setSelectedChar(charData)
    setShowHint(false)
    
    playPronunciation(charData.char)
  }

  const markLearned = () => {
    if (!selectedChar) return
    const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}` 
    
    startTransition(async () => {
      await markItemLearned(userId, itemId, activeScript)
      
      const currentIndex = categoryData.items.findIndex(i => i.char === selectedChar.char)
      let nextIndex = currentIndex + 1
      while(nextIndex < categoryData.items.length && !categoryData.items[nextIndex].char) {
        nextIndex++;
      }
      
      if (nextIndex < categoryData.items.length) {
        const nextChar = categoryData.items[nextIndex]
        setSelectedChar(nextChar)
        setShowHint(false)
        playPronunciation(nextChar.char)
      } else {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        setSelectedChar(null)
      }
    })
  }

  const handleMarkAll = () => {
    const idsToMark = categoryData.items
      .filter(i => i.char !== '')
      .map(i => `${activeScript}-${i.romaji}-${i.char}`)
    
    startTransition(async () => {
      await markAllLearned(userId, idsToMark, activeScript)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } })
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-12 pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Button onClick={handleMarkAll} disabled={isPending} variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950">
          <CheckCheck className="mr-2 h-4 w-4" /> Mark All in {categoryData.title} as Learned
        </Button>
      </div>
      
      {/* Script Selection (Hiragana vs Katakana) */}
      <div className="flex gap-4 border-b pb-4">
        <Button 
          variant={activeScript === 'hiragana' ? 'default' : 'secondary'} 
          onClick={() => { setActiveScript('hiragana'); setSelectedChar(null); }}
          className="text-lg"
        >
          Hiragana (ひらがな)
        </Button>
        <Button 
          variant={activeScript === 'katakana' ? 'default' : 'secondary'} 
          onClick={() => { setActiveScript('katakana'); setSelectedChar(null); }}
          className="text-lg"
        >
          Katakana (カタカナ)
        </Button>
      </div>

      {/* Category Selection (Basic, Dakuten, Yoon) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'basic' ? 'default' : 'outline'} onClick={() => { setActiveCategory('basic'); setSelectedChar(null); }}>Basic</Button>
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'dakuten' ? 'default' : 'outline'} onClick={() => { setActiveCategory('dakuten'); setSelectedChar(null); }}>Dakuten ( ゛゜)</Button>
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'yoon' ? 'default' : 'outline'} onClick={() => { setActiveCategory('yoon'); setSelectedChar(null); }}>Yoon (ゃゅょ)</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative">
        <div className="flex-1">
          <div className={`grid gap-3 ${activeCategory === 'yoon' ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5' : 'grid-cols-5'}`}>
            {categoryData.items.map((item, idx) => {
              if (!item.char) return <div key={idx} className="aspect-square"></div>
              
              const itemId = `${activeScript}-${item.romaji}-${item.char}`
              const isLearned = completedIds.includes(itemId)
              const isSelected = selectedChar?.char === item.char

              return (
                <button
                  key={idx}
                  onClick={() => handleCharClick(item)}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center text-3xl font-medium transition-all
                    hover:scale-105 active:scale-95 border-2 shadow-sm relative overflow-hidden
                    ${isSelected ? 'border-primary ring-4 ring-primary/30 bg-primary/10 z-10 scale-110 shadow-lg' : 'border-border bg-card hover:border-primary/50'}
                    ${isLearned && !isSelected ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/50 text-green-700 dark:text-green-400' : ''}
                    ${activeCategory === 'yoon' ? 'aspect-auto py-4 text-2xl' : ''}
                  `}
                >
                  <span className="relative z-10">{item.char}</span>
                  {isLearned && <CheckCircle2 className={`absolute top-1.5 right-1.5 text-green-500/80 ${activeCategory === 'yoon' ? 'w-4 h-4' : 'w-4 h-4'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        {selectedChar && (
          <>
            {/* Mobile overlay backdrop to click and close */}
            <div 
              className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in duration-200 backdrop-blur-sm" 
              onClick={() => setSelectedChar(null)} 
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-80 md:z-auto animate-in slide-in-from-bottom-full md:animate-none duration-300">
              <Card className="rounded-b-none md:rounded-xl border-b-0 md:border shadow-[0_-20px_60px_rgba(0,0,0,0.2)] md:shadow-sm max-h-[85vh] overflow-y-auto md:max-h-none md:overflow-visible sticky top-6 bg-background/95 md:bg-card backdrop-blur-md md:backdrop-blur-none">
                <CardHeader className="text-center pb-2 relative">
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 md:hidden hover:bg-muted" onClick={() => setSelectedChar(null)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Character Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                  <div className="text-8xl sm:text-9xl font-bold py-2 sm:py-6 text-primary">
                    {selectedChar.char}
                  </div>
                  <div className="text-4xl font-light text-muted-foreground lowercase">
                    {selectedChar.romaji}
                  </div>
                  
                  {/* Hint System */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg p-4 relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-sm">Memorization Hint</span>
                    </div>
                    {showHint || !selectedChar.hint ? (
                      <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                        {selectedChar.hint || "No visual hint available for this combined character yet. Try breaking it down!"}
                      </p>
                    ) : (
                      <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => setShowHint(true)}>
                        Reveal Hint
                      </Button>
                    )}
                  </div>

                  <div className="w-full pt-4 md:pt-6 border-t space-y-4">
                    <details className="group border border-border/50 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3 w-full [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-muted-foreground outline-none uppercase tracking-wider hover:text-foreground transition-colors">
                        <span className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4" />
                          Voice Settings
                        </span>
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="pt-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Voice Type</label>
                          <div className="flex gap-2">
                            <Button size="sm" variant={voiceType === 'female' ? 'default' : 'outline'} className="flex-1" onClick={() => { setVoiceType('female'); setSelectedVoiceName(''); }}>Female</Button>
                            <Button size="sm" variant={voiceType === 'male' ? 'default' : 'outline'} className="flex-1" onClick={() => { setVoiceType('male'); setSelectedVoiceName(''); }}>Male</Button>
                          </div>
                        </div>

                        {voices.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Voices</label>
                            <select 
                              className="w-full text-sm border rounded-md p-2 bg-background text-foreground"
                              value={selectedVoiceName}
                              onChange={(e) => setSelectedVoiceName(e.target.value)}
                            >
                              <option value="">Auto-select (Based on Type)</option>
                              {voices.map(v => (
                                <option key={v.name} value={v.name}>{v.name} {v.localService ? '(Local)' : '(Online)'}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Speed</label>
                          <div className="flex gap-2">
                            <Button size="sm" variant={speechRate === 0.5 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(0.5)}>Slow</Button>
                            <Button size="sm" variant={speechRate === 1 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(1)}>Normal</Button>
                            <Button size="sm" variant={speechRate === 1.5 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(1.5)}>Fast</Button>
                          </div>
                        </div>

                        <div className="space-y-2 pb-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume</label>
                            <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={volume} 
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>
                      </div>
                    </details>

                    <Button 
                      variant="outline" 
                      className="w-full justify-center text-lg h-12 md:h-14"
                      onClick={() => playPronunciation(selectedChar.char)}
                    >
                      <Volume2 className="mr-2 h-5 w-5" /> Play Pronunciation
                    </Button>
                    
                    {(() => {
                      const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}`
                      const isLearned = completedIds.includes(itemId)
                      
                      return (
                        <Button 
                          variant={isLearned ? "secondary" : "default"}
                          className={`w-full justify-center h-14 md:h-16 text-lg font-bold transition-all duration-300 ${isLearned ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                          onClick={markLearned}
                          disabled={isPending || isLearned}
                        >
                          {isPending ? (
                             <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2" /> Saving...</>
                          ) : isLearned ? (
                            <><CheckCircle2 className="mr-2 h-6 w-6 text-green-600 dark:text-green-500" /> Learned!</>
                          ) : (
                            'Mark as Learned'
                          )}
                        </Button>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

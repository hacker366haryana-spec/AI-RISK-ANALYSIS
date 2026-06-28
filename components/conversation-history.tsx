'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, User, Search } from 'lucide-react'
import { INITIAL_CONVERSATION, type ConversationEntry } from '@/lib/mock-data'
import { RelativeTime } from '@/components/relative-time'

const LIVE_PAIRS: [string, string][] = [
  [
    'How do I learn programming?',
    'Start with Python — it has clean syntax and a huge community. Focus on fundamentals first: variables, loops, functions, then move to data structures and algorithms. Build small projects to practice.',
  ],
  [
    'Kal ka weather kaisa hoga?',
    'Kal ka forecast dekha maine — aapke area mein 28°C aur partly cloudy rahega. Shaam ko halki baarish ki possibility hai, toh umbrella rakh lena.',
  ],
  [
    'Open Spotify',
    'Launching Spotify now. Your last playlist "Lo-fi Beats" will resume from where you left off.',
  ],
  [
    'What is quantum computing?',
    'Quantum computing uses quantum mechanical phenomena like superposition and entanglement to process information in ways classical computers cannot. It can solve certain problems exponentially faster.',
  ],
]

export function ConversationHistory() {
  const [entries, setEntries] = useState<ConversationEntry[]>(INITIAL_CONVERSATION)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pairIdx = useRef(0)

  useEffect(() => {
    const addPair = () => {
      const [userText, hardikText] = LIVE_PAIRS[pairIdx.current % LIVE_PAIRS.length]
      pairIdx.current++

      const userEntry: ConversationEntry = {
        id: `u-${Date.now()}`,
        timestamp: new Date(),
        role: 'user',
        text: userText,
        language: 'en',
      }

      setEntries(prev => [...prev.slice(-20), userEntry])

      setTimeout(() => {
        const hardikEntry: ConversationEntry = {
          id: `h-${Date.now()}`,
          timestamp: new Date(),
          role: 'hardik',
          text: hardikText,
          language: 'en',
        }
        setEntries(prev => [...prev.slice(-20), hardikEntry])
      }, 1200)
    }

    const interval = setInterval(addPair, 10000 + Math.random() * 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  const filtered = search
    ? entries.filter(e => e.text.toLowerCase().includes(search.toLowerCase()))
    : entries

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversation..."
          className="w-full bg-surface border border-border rounded pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {filtered.map(entry => (
          <div
            key={entry.id}
            className={`flex gap-2.5 ${entry.role === 'hardik' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                entry.role === 'hardik' ? 'bg-cyan/15 border border-cyan/30' : 'bg-surface border border-border'
              }`}
            >
              {entry.role === 'hardik' ? (
                <Bot className="w-3.5 h-3.5 text-cyan" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${entry.role === 'hardik' ? 'items-start' : 'items-end'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-semibold ${entry.role === 'hardik' ? 'text-cyan' : 'text-muted-foreground'}`}>
                  {entry.role === 'hardik' ? 'HARDIK' : 'YOU'}
                </span>
                <RelativeTime
                  date={entry.timestamp}
                  className="text-xs font-mono text-muted-foreground"
                />
                {entry.language !== 'en' && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground uppercase">
                    {entry.language}
                  </span>
                )}
              </div>
              <div
                className={`rounded px-3 py-2 text-sm leading-relaxed ${
                  entry.role === 'hardik'
                    ? 'bg-surface border border-border text-foreground'
                    : 'bg-cyan/10 border border-cyan/20 text-foreground'
                }`}
              >
                {entry.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground border-t border-border pt-2">
        <span>{entries.length} messages</span>
        <span>&bull;</span>
        <span>{entries.filter(e => e.role === 'user').length} from you</span>
        <span>&bull;</span>
        <span>{entries.filter(e => e.role === 'hardik').length} from HARDIK</span>
      </div>
    </div>
  )
}

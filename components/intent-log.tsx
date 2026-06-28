'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Search, MessageSquare, Monitor, Camera, Globe, Music, FileText, HelpCircle } from 'lucide-react'
import { INITIAL_INTENTS, type IntentLog, type IntentType } from '@/lib/mock-data'
import { RelativeTime } from '@/components/relative-time'

const INTENT_CONFIG: Record<IntentType, { icon: React.ReactNode; color: string; bg: string }> = {
  CHAT: { icon: <MessageSquare className="w-3 h-3" />, color: 'text-cyan', bg: 'bg-cyan/10' },
  SEARCH: { icon: <Search className="w-3 h-3" />, color: 'text-amber', bg: 'bg-amber/10' },
  SYSTEM: { icon: <Monitor className="w-3 h-3" />, color: 'text-green', bg: 'bg-green/10' },
  CAMERA: { icon: <Camera className="w-3 h-3" />, color: 'text-red', bg: 'bg-red/10' },
  BROWSER: { icon: <Globe className="w-3 h-3" />, color: 'text-cyan', bg: 'bg-cyan/10' },
  MEDIA: { icon: <Music className="w-3 h-3" />, color: 'text-amber', bg: 'bg-amber/10' },
  FILE: { icon: <FileText className="w-3 h-3" />, color: 'text-muted-foreground', bg: 'bg-muted/20' },
  UNKNOWN: { icon: <HelpCircle className="w-3 h-3" />, color: 'text-muted-foreground', bg: 'bg-muted/20' },
}

const NEW_ENTRIES: Omit<IntentLog, 'id' | 'timestamp'>[] = [
  {
    transcript: 'Search Python tutorials on YouTube',
    intent: 'SEARCH',
    command: 'serp_search("python tutorials youtube")',
    result: 'Found 12 results, opening top result',
    latencyMs: 390,
    status: 'success',
    language: 'en',
  },
  {
    transcript: 'Set a timer for 10 minutes',
    intent: 'SYSTEM',
    command: 'set_timer(600)',
    result: 'Timer set for 10 minutes',
    latencyMs: 42,
    status: 'success',
    language: 'en',
  },
  {
    transcript: 'Open WhatsApp',
    intent: 'SYSTEM',
    command: 'open_whatsapp()',
    result: 'Launched WhatsApp Desktop',
    latencyMs: 95,
    status: 'success',
    language: 'en',
  },
  {
    transcript: 'Latest cricket news kya hai?',
    intent: 'SEARCH',
    command: 'serp_search("cricket news today")',
    result: 'India vs Australia Test Match update found',
    latencyMs: 456,
    status: 'success',
    language: 'hinglish',
  },
]

function StatusIcon({ status }: { status: IntentLog['status'] }) {
  if (status === 'success') return <CheckCircle className="w-3.5 h-3.5 text-green" />
  if (status === 'error') return <XCircle className="w-3.5 h-3.5 text-red" />
  return <Clock className="w-3.5 h-3.5 text-amber animate-pulse" />
}

export function IntentLog() {
  const [logs, setLogs] = useState<IntentLog[]>(INITIAL_INTENTS)
  const [filter, setFilter] = useState<IntentType | 'ALL'>('ALL')

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      const entry = NEW_ENTRIES[idx % NEW_ENTRIES.length]
      setLogs(prev => [
        {
          ...entry,
          id: `live-${Date.now()}`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ])
      idx++
    }, 6000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.intent === filter)
  const intentTypes: (IntentType | 'ALL')[] = ['ALL', 'CHAT', 'SEARCH', 'SYSTEM', 'CAMERA']

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {intentTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-colors border ${
              filter === type
                ? 'bg-cyan/15 border-cyan/40 text-cyan'
                : 'bg-surface border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {type}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-muted-foreground">{filtered.length} entries</span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {filtered.map((log, i) => {
          const cfg = INTENT_CONFIG[log.intent]
          return (
            <div
              key={log.id}
              className={`rounded border border-border bg-surface p-3 flex flex-col gap-2 transition-all ${i === 0 && log.id.startsWith('live') ? 'border-cyan/30 bg-cyan/5' : ''}`}
            >
              <div className="flex items-start gap-2">
                {/* Intent badge */}
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${cfg.color} ${cfg.bg} shrink-0`}>
                  {cfg.icon}
                  {log.intent}
                </span>
                {/* Language */}
                <span className="px-1.5 py-0.5 rounded bg-muted/30 text-xs font-mono text-muted-foreground uppercase shrink-0">
                  {log.language}
                </span>
                <RelativeTime
                  date={log.timestamp}
                  className="ml-auto text-xs font-mono text-muted-foreground shrink-0"
                />
              </div>

              {/* Transcript */}
              <p className="text-sm text-foreground leading-relaxed">&ldquo;{log.transcript}&rdquo;</p>

              {/* Command */}
              {log.command && (
                <div className="flex items-center gap-2 bg-background rounded px-2 py-1">
                  <span className="text-xs font-mono text-cyan-dim shrink-0">CMD</span>
                  <code className="text-xs font-mono text-muted-foreground truncate">{log.command}</code>
                </div>
              )}

              {/* Result + latency */}
              <div className="flex items-center gap-2">
                <StatusIcon status={log.status} />
                <p className="text-xs text-muted-foreground flex-1 truncate">{log.result}</p>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{log.latencyMs}ms</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

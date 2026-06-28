'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react'

type WakeState = 'idle' | 'listening' | 'processing' | 'speaking'

const TRANSCRIPTS = [
  'What is the current Bitcoin price?',
  'Open YouTube',
  'Bhai IPL ka score kya hai?',
  'Tell me about machine learning',
  'Latest AI news kya hai?',
  'Set a timer for 10 minutes',
  'Search Python tutorials on YouTube',
  'Kya weather aaj accha hai?',
]

const STATE_LABELS: Record<WakeState, string> = {
  idle: 'IDLE — MONITORING',
  listening: 'LISTENING...',
  processing: 'PROCESSING INTENT',
  speaking: 'SPEAKING RESPONSE',
}

const STATE_COLORS: Record<WakeState, string> = {
  idle: 'text-muted-foreground',
  listening: 'text-cyan',
  processing: 'text-amber',
  speaking: 'text-green',
}

const BAR_COUNT = 32

export function VoiceActivity() {
  const [state, setState] = useState<WakeState>('idle')
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(0.05))
  const animFrameRef = useRef<number | null>(null)
  const stateRef = useRef<WakeState>('idle')
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  stateRef.current = state

  // Animate waveform bars
  useEffect(() => {
    const animate = () => {
      setBarHeights(prev =>
        prev.map((h, i) => {
          const active = stateRef.current !== 'idle'
          if (!active) return Math.max(0.05, h * 0.9 + (Math.random() * 0.04 - 0.02))
          const center = BAR_COUNT / 2
          const dist = Math.abs(i - center) / center
          const base = active ? 0.3 + Math.random() * 0.65 : 0.05
          return Math.max(0.05, Math.min(1, base * (1 - dist * 0.5) + (Math.random() * 0.1 - 0.05)))
        })
      )
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Simulate interaction cycle
  useEffect(() => {
    const runCycle = () => {
      // idle → listening
      setState('listening')
      setTranscript('')
      setConfidence(0)

      const transcript = TRANSCRIPTS[Math.floor(Math.random() * TRANSCRIPTS.length)]
      let charIndex = 0

      const typeInterval = setInterval(() => {
        charIndex++
        setTranscript(transcript.slice(0, charIndex))
        setConfidence(prev => Math.min(97, prev + Math.random() * 8))
        if (charIndex >= transcript.length) {
          clearInterval(typeInterval)
          setState('processing')
          setTimeout(() => {
            setState('speaking')
            setTimeout(() => {
              setState('idle')
              setTranscript('')
              setConfidence(0)
              cycleTimerRef.current = setTimeout(runCycle, 4000 + Math.random() * 3000)
            }, 2500 + Math.random() * 1500)
          }, 900 + Math.random() * 600)
        }
      }, 40 + Math.random() * 20)
    }

    cycleTimerRef.current = setTimeout(runCycle, 2000)
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current)
    }
  }, [])

  const isActive = state !== 'idle'

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan pulse-glow' : 'bg-muted-foreground'}`} />
          <span className={`text-xs font-mono font-semibold tracking-widest uppercase ${STATE_COLORS[state]}`}>
            {STATE_LABELS[state]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Radio className="w-3 h-3" />
            <span>44.1 kHz</span>
          </div>
          {state === 'listening' ? (
            <Mic className="w-4 h-4 text-cyan" />
          ) : state === 'speaking' ? (
            <Volume2 className="w-4 h-4 text-green" />
          ) : (
            <MicOff className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Wake word indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded bg-surface border border-border">
        <span className="text-xs font-mono text-muted-foreground">WAKE WORD</span>
        <span className="text-xs font-mono font-semibold text-foreground tracking-wider">&quot;HEY HARDIK&quot;</span>
        <span className="ml-auto text-xs font-mono text-cyan">ARMED</span>
      </div>

      {/* Waveform */}
      <div className="flex-1 flex items-center justify-center bg-surface rounded border border-border overflow-hidden px-4 py-3 min-h-[80px]">
        <div className="flex items-center gap-[2px] w-full h-full">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-none"
              style={{
                height: `${Math.max(4, h * 100)}%`,
                background: isActive
                  ? `oklch(0.78 0.18 196 / ${0.4 + h * 0.6})`
                  : `oklch(1 0 0 / ${0.06 + h * 0.08})`,
                minHeight: '3px',
              }}
            />
          ))}
        </div>
      </div>

      {/* STT Transcript */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">STT Transcript</span>
          {state === 'listening' && confidence > 0 && (
            <span className="text-xs font-mono text-cyan">{confidence.toFixed(0)}% confidence</span>
          )}
        </div>
        <div className="bg-surface rounded border border-border px-3 py-2 min-h-[40px] flex items-center">
          {transcript ? (
            <p className="text-sm font-mono text-foreground leading-relaxed">
              {transcript}
              {state === 'listening' && (
                <span className="inline-block w-[2px] h-[14px] bg-cyan ml-[2px] align-middle animate-pulse" />
              )}
            </p>
          ) : (
            <p className="text-sm font-mono text-muted-foreground italic">Waiting for speech input...</p>
          )}
        </div>
      </div>

      {/* Language detection */}
      <div className="flex items-center gap-2">
        {(['en', 'hi', 'hinglish'] as const).map(lang => (
          <div
            key={lang}
            className={`flex-1 text-center py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border transition-colors ${
              (state === 'listening' || state === 'processing') && lang === 'en'
                ? 'bg-cyan/10 border-cyan/40 text-cyan'
                : 'bg-surface border-border text-muted-foreground'
            }`}
          >
            {lang}
          </div>
        ))}
      </div>
    </div>
  )
}

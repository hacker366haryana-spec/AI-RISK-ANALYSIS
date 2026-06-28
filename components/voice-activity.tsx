'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react'

type WakeState = 'idle' | 'listening' | 'processing' | 'speaking'

const EXCHANGES: { query: string; response: string }[] = [
  {
    query: 'What is the current Bitcoin price?',
    response: 'Bitcoin is currently trading at 67 thousand 4 hundred 20 dollars, up 2.4 percent in the last 24 hours.',
  },
  {
    query: 'Open YouTube',
    response: 'Sure, launching YouTube in your browser right now.',
  },
  {
    query: 'Bhai IPL ka score kya hai?',
    response: 'Bhai, CSK vs MI chal raha hai. CSK ka score hai 187 for 4 in 18 overs.',
  },
  {
    query: 'Tell me about machine learning',
    response: 'Machine learning is a branch of artificial intelligence that enables systems to learn from data without being explicitly programmed.',
  },
  {
    query: 'Latest AI news kya hai?',
    response: 'Aaj ki badi khabar: OpenAI ne GPT-5 announce kiya hai, aur Google ka Gemini Ultra 2.0 bhi launch hua.',
  },
  {
    query: 'Set a timer for 10 minutes',
    response: 'Timer set for 10 minutes. I will alert you when it is done.',
  },
  {
    query: 'Search Python tutorials on YouTube',
    response: 'Searching for Python tutorials on YouTube. Opening results now.',
  },
  {
    query: 'Kya weather aaj accha hai?',
    response: 'Aaj 32 degree Celsius aur sunny hai. Humidity 68 percent hai. Din bhar clear sky rahegi.',
  },
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
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(0.05))
  const animFrameRef = useRef<number | null>(null)
  const stateRef = useRef<WakeState>('idle')
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  stateRef.current = state

  // Detect speech synthesis support on client only
  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  // Speak response text when state becomes 'speaking'
  useEffect(() => {
    if (state !== 'speaking' || !speechSupported || !speechEnabled || !response) return

    // Cancel any in-progress speech first
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(response)
    utteranceRef.current = utterance

    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
    if (preferred) utterance.voice = preferred

    utterance.rate = 1.05
    utterance.pitch = 1
    utterance.volume = 1

    window.speechSynthesis.speak(utterance)

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [state, response, speechSupported, speechEnabled])

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
      setResponse('')
      setConfidence(0)

      const exchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)]
      let charIndex = 0

      const typeInterval = setInterval(() => {
        charIndex++
        setTranscript(exchange.query.slice(0, charIndex))
        setConfidence(prev => Math.min(97, prev + Math.random() * 8))
        if (charIndex >= exchange.query.length) {
          clearInterval(typeInterval)
          setState('processing')
          setTimeout(() => {
            // Set response before switching to speaking so the useEffect can read it
            setResponse(exchange.response)
            setState('speaking')

            // Duration: roughly match how long it takes to speak the response
            const speakDurationMs = Math.max(2500, exchange.response.split(' ').length * 350)
            setTimeout(() => {
              window.speechSynthesis?.cancel()
              setState('idle')
              setTranscript('')
              setResponse('')
              setConfidence(0)
              cycleTimerRef.current = setTimeout(runCycle, 4000 + Math.random() * 3000)
            }, speakDurationMs)
          }, 900 + Math.random() * 600)
        }
      }, 40 + Math.random() * 20)
    }

    cycleTimerRef.current = setTimeout(runCycle, 2000)
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  const isActive = state !== 'idle'

  const toggleSpeech = () => {
    setSpeechEnabled(prev => !prev)
    if (!speechEnabled) {
      window.speechSynthesis?.cancel()
    }
  }

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
          {speechSupported && (
            <button
              onClick={toggleSpeech}
              aria-label={speechEnabled ? 'Mute TTS' : 'Unmute TTS'}
              title={speechEnabled ? 'Mute TTS' : 'Unmute TTS'}
              className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                speechEnabled
                  ? 'bg-green/10 border-green/20 text-green hover:bg-green/20'
                  : 'bg-muted/10 border-muted text-muted-foreground hover:bg-muted/20'
              }`}
            >
              {speechEnabled ? 'TTS ON' : 'TTS OFF'}
            </button>
          )}
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
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {state === 'speaking' ? 'HARDIK Response' : 'STT Transcript'}
          </span>
          {state === 'listening' && confidence > 0 && (
            <span className="text-xs font-mono text-cyan">{confidence.toFixed(0)}% confidence</span>
          )}
          {state === 'speaking' && (
            <span className="text-xs font-mono text-green animate-pulse">SPEAKING</span>
          )}
        </div>
        <div className={`bg-surface rounded border px-3 py-2 min-h-[40px] flex items-center transition-colors ${
          state === 'speaking' ? 'border-green/30' : 'border-border'
        }`}>
          {state === 'speaking' && response ? (
            <p className="text-sm font-mono text-green leading-relaxed">
              {response}
              <span className="inline-block w-[2px] h-[14px] bg-green ml-[2px] align-middle animate-pulse" />
            </p>
          ) : transcript ? (
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

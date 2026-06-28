'use client'

import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, Tooltip } from 'recharts'
import { INITIAL_SERVICES, type ServiceHealth, type ServiceStatus } from '@/lib/mock-data'

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; dot: string }> = {
  online: { label: 'ONLINE', color: 'text-green', dot: 'bg-green' },
  degraded: { label: 'DEGRADED', color: 'text-amber', dot: 'bg-amber' },
  offline: { label: 'OFFLINE', color: 'text-red', dot: 'bg-red' },
}

function generateLatencyHistory(base: number) {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    v: Math.max(5, base + (Math.random() - 0.5) * base * 0.4),
  }))
}

interface ServiceCardProps {
  service: ServiceHealth
  history: { t: number; v: number }[]
}

function SparklineChart({
  serviceKey,
  history,
  status,
}: {
  serviceKey: string
  history: { t: number; v: number }[]
  status: ServiceStatus
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const el = containerRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const strokeColor = status === 'degraded' ? 'oklch(0.78 0.16 70)' : 'oklch(0.78 0.18 196)'

  return (
    <div ref={containerRef} className="flex-1 h-10">
      {mounted && width > 0 && (
        <AreaChart
          width={width}
          height={40}
          data={history}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`grad-${serviceKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#grad-${serviceKey})`}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="bg-popover border border-border rounded px-2 py-1 text-xs font-mono">
                  {payload[0].value?.toFixed(0)}ms
                </div>
              ) : null
            }
          />
        </AreaChart>
      )}
    </div>
  )
}

function ServiceCard({ service, history }: ServiceCardProps) {
  const cfg = STATUS_CONFIG[service.status]
  const isChart = ['openai', 'serpapi', 'elevenlabs', 'whisper'].includes(service.key)

  return (
    <div className="bg-surface rounded border border-border p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${service.status === 'online' ? 'pulse-glow' : ''}`} />
          <span className="text-sm font-semibold text-foreground truncate">{service.name}</span>
        </div>
        <span className={`text-xs font-mono font-semibold shrink-0 ${cfg.color}`}>{cfg.label}</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-mono">LATENCY</span>
          <span className={`text-sm font-mono font-semibold ${service.latencyMs > 500 ? 'text-amber' : 'text-foreground'}`}>
            {service.latencyMs}ms
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-mono">UPTIME</span>
          <span className="text-sm font-mono font-semibold text-foreground">{service.uptime}%</span>
        </div>
        {isChart && (
          <SparklineChart serviceKey={service.key} history={history} status={service.status} />
        )}
      </div>
    </div>
  )
}

export function SystemHealth() {
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES)
  const [histories] = useState(() =>
    Object.fromEntries(INITIAL_SERVICES.map(s => [s.key, generateLatencyHistory(s.latencyMs)]))
  )
  const [liveHistories, setLiveHistories] = useState(histories)

  // Jitter latency every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev =>
        prev.map(s => ({
          ...s,
          latencyMs: Math.max(5, Math.round(s.latencyMs + (Math.random() - 0.5) * s.latencyMs * 0.15)),
          lastChecked: new Date(),
        }))
      )
      setLiveHistories(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          const arr = [...next[key]]
          arr.shift()
          const last = arr[arr.length - 1]?.v ?? 100
          arr.push({ t: arr.length, v: Math.max(5, last + (Math.random() - 0.5) * last * 0.3) })
          next[key] = arr
        }
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const online = services.filter(s => s.status === 'online').length
  const degraded = services.filter(s => s.status === 'degraded').length
  const offline = services.filter(s => s.status === 'offline').length

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface rounded border border-border px-3 py-2 text-center">
          <div className="text-lg font-mono font-bold text-green">{online}</div>
          <div className="text-xs font-mono text-muted-foreground uppercase">Online</div>
        </div>
        <div className="bg-surface rounded border border-border px-3 py-2 text-center">
          <div className="text-lg font-mono font-bold text-amber">{degraded}</div>
          <div className="text-xs font-mono text-muted-foreground uppercase">Degraded</div>
        </div>
        <div className="bg-surface rounded border border-border px-3 py-2 text-center">
          <div className="text-lg font-mono font-bold text-red">{offline}</div>
          <div className="text-xs font-mono text-muted-foreground uppercase">Offline</div>
        </div>
      </div>

      {/* Service cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {services.map(service => (
          <ServiceCard
            key={service.key}
            service={service}
            history={liveHistories[service.key] ?? []}
          />
        ))}
      </div>
    </div>
  )
}

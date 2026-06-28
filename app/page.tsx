'use client'

import { useState, useEffect } from 'react'
import {
  Mic,
  ListOrdered,
  MessageSquare,
  Activity,
  Settings,
  Cpu,
  Radio,
  ChevronDown,
  Menu,
  X,
  Camera,
} from 'lucide-react'
import { DashboardPanel } from '@/components/dashboard-panel'
import { VoiceActivity } from '@/components/voice-activity'
import { IntentLog } from '@/components/intent-log'
import { SystemHealth } from '@/components/system-health'
import { ConversationHistory } from '@/components/conversation-history'
import { SettingsPermissions } from '@/components/settings-permissions'
import { CameraFeed } from '@/components/camera-feed'

type Tab = 'voice' | 'intents' | 'conversation' | 'health' | 'settings' | 'camera'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'voice', label: 'Voice', icon: <Mic className="w-4 h-4" /> },
  { key: 'intents', label: 'Intents', icon: <ListOrdered className="w-4 h-4" /> },
  { key: 'conversation', label: 'History', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'health', label: 'Health', icon: <Activity className="w-4 h-4" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { key: 'camera', label: 'Camera', icon: <Camera className="w-4 h-4" /> },
]

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono text-sm text-muted-foreground tabular-nums">{time}</span>
}

function Uptime() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return (
    <span className="font-mono text-xs text-muted-foreground tabular-nums hidden sm:block">
      UP {h}:{m}:{s}
    </span>
  )
}

export default function HardikDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('voice')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="h-12 border-b border-border bg-surface flex items-center px-4 gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan/15 border border-cyan/30 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-cyan" />
          </div>
          <span className="font-mono font-bold text-sm tracking-widest text-foreground">HARDIK</span>
          <span className="hidden sm:block text-xs font-mono text-muted-foreground">Digital OS</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green pulse-glow" />
          <span className="text-xs font-mono text-green hidden sm:block">OPERATIONAL</span>
        </div>

        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised border border-border">
          <Radio className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">v1.0.0-mvp</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Uptime />
          <LiveClock />
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}
        <nav
          className="hidden lg:flex flex-col w-48 border-r border-border bg-sidebar shrink-0 pt-4 pb-6 gap-1 px-2"
          aria-label="Dashboard navigation"
        >
          <div className="px-3 pb-3 mb-1 border-b border-border">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Navigation</span>
          </div>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? 'page' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-cyan/10 text-cyan border border-cyan/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <div className="mt-auto px-3 flex flex-col gap-1.5">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Backend</div>
            <div className="text-xs font-mono text-green">FastAPI Online</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">Wake Word</div>
            <div className="text-xs font-mono text-cyan">&quot;Hey Hardik&quot;</div>
          </div>
        </nav>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden absolute inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="w-56 bg-sidebar border-r border-border flex flex-col pt-4 pb-6 gap-1 px-2 z-50">
              <div className="px-3 pb-3 mb-1 border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Navigation</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setMobileOpen(false) }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-cyan/10 text-cyan border border-cyan/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              className="flex-1 bg-background/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden p-3 lg:p-4">
          {/* Desktop: multi-panel grid */}
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
            {/* Voice Activity */}
            <DashboardPanel
              title="Live Voice Activity"
              subtitle="Real-time audio pipeline"
              icon={<Mic className="w-4 h-4" />}
              badge={
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">
                  LIVE
                </span>
              }
            >
              <VoiceActivity />
            </DashboardPanel>

            {/* Intent Log */}
            <DashboardPanel
              title="Intent & Command Log"
              subtitle="Classified intents and dispatched commands"
              icon={<ListOrdered className="w-4 h-4" />}
            >
              <IntentLog />
            </DashboardPanel>

            {/* Conversation History — spans 2 rows on xl */}
            <DashboardPanel
              title="Conversation History"
              subtitle="Full interaction log"
              icon={<MessageSquare className="w-4 h-4" />}
              className="xl:row-span-2"
            >
              <ConversationHistory />
            </DashboardPanel>

            {/* System Health */}
            <DashboardPanel
              title="System Health"
              subtitle="Service status and latency"
              icon={<Activity className="w-4 h-4" />}
            >
              <SystemHealth />
            </DashboardPanel>

            {/* Settings */}
            <DashboardPanel
              title="Settings & Permissions"
              subtitle="Manage access and preferences"
              icon={<Settings className="w-4 h-4" />}
            >
              <SettingsPermissions />
            </DashboardPanel>

            {/* Camera */}
            <DashboardPanel
              title="Camera Feed"
              subtitle="Live device camera stream"
              icon={<Camera className="w-4 h-4" />}
              badge={
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-green/10 text-green border border-green/20">
                  CAM
                </span>
              }
            >
              <CameraFeed />
            </DashboardPanel>
          </div>

          {/* Mobile: tab-based single panel */}
          <div className="lg:hidden flex flex-col h-full gap-3">
            <div
              className="flex gap-1 bg-surface rounded border border-border p-1 shrink-0 overflow-x-auto"
              role="tablist"
              aria-label="Dashboard sections"
            >
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-cyan/15 text-cyan'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden" role="tabpanel">
              {activeTab === 'voice' && (
                <DashboardPanel
                  title="Live Voice Activity"
                  subtitle="Real-time audio pipeline"
                  icon={<Mic className="w-4 h-4" />}
                  className="h-full"
                  badge={
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">
                      LIVE
                    </span>
                  }
                >
                  <VoiceActivity />
                </DashboardPanel>
              )}
              {activeTab === 'intents' && (
                <DashboardPanel
                  title="Intent & Command Log"
                  subtitle="Classified intents and dispatched commands"
                  icon={<ListOrdered className="w-4 h-4" />}
                  className="h-full"
                >
                  <IntentLog />
                </DashboardPanel>
              )}
              {activeTab === 'conversation' && (
                <DashboardPanel
                  title="Conversation History"
                  subtitle="Full interaction log"
                  icon={<MessageSquare className="w-4 h-4" />}
                  className="h-full"
                >
                  <ConversationHistory />
                </DashboardPanel>
              )}
              {activeTab === 'health' && (
                <DashboardPanel
                  title="System Health"
                  subtitle="Service status and latency"
                  icon={<Activity className="w-4 h-4" />}
                  className="h-full"
                >
                  <SystemHealth />
                </DashboardPanel>
              )}
              {activeTab === 'settings' && (
                <DashboardPanel
                  title="Settings & Permissions"
                  subtitle="Manage access and preferences"
                  icon={<Settings className="w-4 h-4" />}
                  className="h-full"
                >
                  <SettingsPermissions />
                </DashboardPanel>
              )}
              {activeTab === 'camera' && (
                <DashboardPanel
                  title="Camera Feed"
                  subtitle="Live device camera stream"
                  icon={<Camera className="w-4 h-4" />}
                  className="h-full"
                  badge={
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-green/10 text-green border border-green/20">
                      CAM
                    </span>
                  }
                >
                  <CameraFeed />
                </DashboardPanel>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Shield, AlertTriangle, Check, X, Settings, Globe, HardDrive, Wifi } from 'lucide-react'
import { INITIAL_PERMISSIONS, type Permission } from '@/lib/mock-data'

const CATEGORY_CONFIG = {
  hardware: { label: 'Hardware', icon: <HardDrive className="w-3.5 h-3.5" /> },
  system: { label: 'System', icon: <Settings className="w-3.5 h-3.5" /> },
  network: { label: 'Network', icon: <Wifi className="w-3.5 h-3.5" /> },
  data: { label: 'Data & Memory', icon: <Globe className="w-3.5 h-3.5" /> },
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'hinglish', label: 'Hinglish (Auto-detect)' },
]

const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o-mini (Default)' },
  { value: 'gpt-4o', label: 'GPT-4o (High quality)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5-turbo (Fast)' },
]

const VOICE_OPTIONS = [
  { value: 'rachel', label: 'Rachel — Natural Female' },
  { value: 'adam', label: 'Adam — Natural Male' },
  { value: 'domi', label: 'Domi — Energetic Female' },
]

function PermissionToggle({ permission, onToggle }: { permission: Permission; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{permission.name}</span>
          {permission.sensitive && (
            <span className="flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded bg-amber/10 text-amber border border-amber/20">
              <AlertTriangle className="w-2.5 h-2.5" />
              SENSITIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{permission.description}</p>
      </div>
      <button
        onClick={() => onToggle(permission.id)}
        className={`relative w-10 h-5 rounded-full border transition-all shrink-0 mt-0.5 ${
          permission.granted
            ? 'bg-cyan/20 border-cyan/50'
            : 'bg-surface border-border'
        }`}
        aria-label={`${permission.granted ? 'Revoke' : 'Grant'} ${permission.name}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all flex items-center justify-center ${
            permission.granted
              ? 'left-[22px] bg-cyan'
              : 'left-0.5 bg-muted-foreground'
          }`}
        >
          {permission.granted ? (
            <Check className="w-2.5 h-2.5 text-background" />
          ) : (
            <X className="w-2.5 h-2.5 text-background" />
          )}
        </span>
      </button>
    </div>
  )
}

export function SettingsPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS)
  const [language, setLanguage] = useState('hinglish')
  const [model, setModel] = useState('gpt-4o-mini')
  const [voice, setVoice] = useState('rachel')
  const [activeCategory, setActiveCategory] = useState<Permission['category']>('hardware')
  const [activeTab, setActiveTab] = useState<'permissions' | 'preferences'>('permissions')

  const togglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, granted: !p.granted } : p))
    )
  }

  const categoryPerms = permissions.filter(p => p.category === activeCategory)
  const granted = permissions.filter(p => p.granted).length

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Tab bar */}
      <div className="flex gap-1 bg-surface rounded border border-border p-1">
        {(['permissions', 'preferences'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-cyan/15 text-cyan'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'permissions' ? (
        <>
          {/* Permission summary */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-surface border border-border">
            <Shield className="w-4 h-4 text-cyan" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold">{granted}</span> of {permissions.length} permissions granted
            </span>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {(Object.entries(CATEGORY_CONFIG) as [Permission['category'], typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                  activeCategory === key
                    ? 'bg-cyan/10 border-cyan/30 text-cyan'
                    : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Permission list */}
          <div className="flex-1 overflow-y-auto bg-surface rounded border border-border px-3 divide-y divide-border">
            {categoryPerms.map(p => (
              <PermissionToggle key={p.id} permission={p} onToggle={togglePermission} />
            ))}
            {categoryPerms.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center font-mono">No permissions in this category</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {/* Language */}
          <div className="bg-surface rounded border border-border p-3 flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Voice Input Language
            </label>
            <div className="flex flex-col gap-1">
              {LANGUAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors border ${
                    language === opt.value
                      ? 'bg-cyan/10 border-cyan/30 text-foreground'
                      : 'border-transparent hover:bg-surface-raised text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${language === opt.value ? 'border-cyan' : 'border-muted-foreground'}`}>
                    {language === opt.value && <span className="w-2 h-2 rounded-full bg-cyan" />}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model */}
          <div className="bg-surface rounded border border-border p-3 flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              AI Model
            </label>
            <div className="flex flex-col gap-1">
              {MODEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setModel(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors border ${
                    model === opt.value
                      ? 'bg-cyan/10 border-cyan/30 text-foreground'
                      : 'border-transparent hover:bg-surface-raised text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${model === opt.value ? 'border-cyan' : 'border-muted-foreground'}`}>
                    {model === opt.value && <span className="w-2 h-2 rounded-full bg-cyan" />}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div className="bg-surface rounded border border-border p-3 flex flex-col gap-2">
            <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              ElevenLabs Voice
            </label>
            <div className="flex flex-col gap-1">
              {VOICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVoice(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors border ${
                    voice === opt.value
                      ? 'bg-cyan/10 border-cyan/30 text-foreground'
                      : 'border-transparent hover:bg-surface-raised text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${voice === opt.value ? 'border-cyan' : 'border-muted-foreground'}`}>
                    {voice === opt.value && <span className="w-2 h-2 rounded-full bg-cyan" />}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

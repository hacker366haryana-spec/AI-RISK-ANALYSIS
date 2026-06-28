import { ReactNode } from 'react'

interface DashboardPanelProps {
  title: string
  subtitle?: string
  icon: ReactNode
  children: ReactNode
  className?: string
  badge?: ReactNode
}

export function DashboardPanel({ title, subtitle, icon, children, className = '', badge }: DashboardPanelProps) {
  return (
    <div className={`flex flex-col bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Panel header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="text-cyan">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-mono font-semibold text-foreground uppercase tracking-widest">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>
      {/* Panel body */}
      <div className="flex-1 p-4 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

'use client'

import { useRelativeTime } from '@/hooks/use-relative-time'

interface RelativeTimeProps {
  date: Date
  className?: string
}

/**
 * Renders a relative time string client-side only to prevent hydration
 * mismatches. Renders nothing on the server / before mount.
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const label = useRelativeTime(date)

  if (!label) return null

  return <span className={className}>{label}</span>
}

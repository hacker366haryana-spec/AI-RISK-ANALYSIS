'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

/**
 * Returns a relative time string (e.g. "2 minutes ago") only after the
 * component has mounted on the client, avoiding SSR/hydration mismatches
 * caused by Date.now() differing between server and client renders.
 */
export function useRelativeTime(date: Date): string {
  const [label, setLabel] = useState<string>('')

  useEffect(() => {
    // Set immediately on mount
    setLabel(formatDistanceToNow(date, { addSuffix: true }))

    // Refresh every 30 seconds so it stays accurate
    const id = setInterval(() => {
      setLabel(formatDistanceToNow(date, { addSuffix: true }))
    }, 30_000)

    return () => clearInterval(id)
  }, [date])

  return label
}

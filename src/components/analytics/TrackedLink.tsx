'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackEvent } from '@/lib/analytics/gtag'

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  eventName: string
  eventParams?: Record<string, string | number | boolean>
}

export default function TrackedLink({ eventName, eventParams, onClick, ...linkProps }: TrackedLinkProps) {
  return (
    <Link
      {...linkProps}
      onClick={e => {
        trackEvent(eventName, eventParams)
        onClick?.(e)
      }}
    />
  )
}

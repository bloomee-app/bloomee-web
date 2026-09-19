'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Kept in sync by hand with the pre-paint script in src/app/layout.tsx, which cannot import
// from here because it has to run as an inline <script> before React mounts.
const DISMISSED_KEY = 'bloome-migration-notice-dismissed'

type MigrationRow = {
  icon: string
  label: string
  href: string
  display: string
  formerly: string
  external: boolean
}

const ROWS: MigrationRow[] = [
  {
    icon: '🌐',
    label: 'Website',
    href: 'https://bloomee.faizath.com',
    display: 'bloomee.faizath.com',
    formerly: 'bloomee.earth',
    external: true,
  },
  {
    icon: '⚙️',
    label: 'AI Service',
    href: 'https://bloomee-ai.faizath.com',
    display: 'bloomee-ai.faizath.com',
    formerly: 'ai.bloomee.earth',
    external: true,
  },
  {
    icon: '📧',
    label: 'Email',
    href: 'mailto:contact@bloomee.faizath.com',
    display: 'contact@bloomee.faizath.com',
    formerly: 'contact@bloomee.earth',
    external: false,
  },
  {
    icon: '📈',
    label: 'Status Page',
    href: 'https://status.faizath.com/status/bloomee',
    display: 'status.faizath.com/status/bloomee',
    formerly: 'status.bloomee.earth',
    external: true,
  },
]

interface MigrationNoticeProps {
  className?: string
}

export default function MigrationNotice({ className }: MigrationNoticeProps) {
  // Start visible so the notice is present in the server-rendered HTML, which is what survives
  // in environments that never run our JS: Wayback captures, no-JS readers, or a build where a
  // chunk fails to load. Dismissed visitors are handled before first paint by the inline script
  // in src/app/layout.tsx, so flipping this to false below removes the node without a flash.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) === 'true') setVisible(false)
    } catch {
      // Private mode or blocked storage - leave the notice visible.
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch {
      // Dismissal just won't persist; nothing else to do.
    }
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Domain migration notice"
      data-migration-notice=""
      className={cn('w-[min(92vw,34rem)]', className)}
    >
      {/*
        Darker than the other panels (which use bg-white/10): this one floats over the lit side
        of the globe, and at white/10 the link rows became unreadable against bright terrain.
      */}
      <Card className="bg-black/60 backdrop-blur-md border-white/20 text-white relative shadow-lg">
        <Button
          size="icon"
          variant="ghost"
          onClick={dismiss}
          aria-label="Dismiss migration notice"
          className="absolute top-2 right-2 h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white !cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-4 md:p-5 pr-12">
          <h3 className="text-base md:text-lg font-semibold mb-1.5">
            📢 Domain &amp; Email Migration Notice
          </h3>

          <p className="text-sm text-blue-100 mb-3">
            From <strong className="font-semibold text-white">October 4th, 2026</strong>, Bloomee
            will transition to new domains as{' '}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs">bloomee.earth</code> will
            not be renewed:
          </p>

          <ul className="space-y-1.5 text-sm">
            {ROWS.map((row) => (
              <li key={row.label} className="leading-snug">
                <span aria-hidden="true">{row.icon}</span>{' '}
                <span className="font-semibold">{row.label}:</span>{' '}
                <a
                  href={row.href}
                  {...(row.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-blue-300 hover:text-blue-200 underline underline-offset-2 break-words"
                >
                  {row.display}
                </a>{' '}
                <span className="text-blue-200/80 text-xs">
                  (formerly <i>{row.formerly}</i>)
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

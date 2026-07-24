'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  label: string
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )
    items.forEach(item => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav className="sticky top-28 hidden xl:block">
      <p className="eyebrow mb-4">목차</p>
      <ul className="space-y-3 border-l border-[var(--border)]">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block pl-4 -ml-px text-[13px] leading-snug border-l transition-colors duration-200 ${
                activeId === item.id
                  ? 'border-[color:var(--ink)] text-[color:var(--ink)]'
                  : 'border-transparent text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)]'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

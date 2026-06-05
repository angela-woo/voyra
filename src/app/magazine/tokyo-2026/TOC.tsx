'use client'

import { useEffect, useState } from 'react'

interface TOCSection {
  id: string
  label: string
  number: string
}

interface TOCProps {
  sections: TOCSection[]
}

export default function TOC({ sections }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(section.id)
            }
          })
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top, behavior: 'smooth' })
      setActiveId(id)
    }
  }

  return (
    <nav className="sticky top-24 hidden lg:block">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">목차</p>
      <ul className="space-y-1">
        {sections.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-200 group"
                style={{
                  color: isActive ? '#E8B86D' : '#6B7280',
                  backgroundColor: isActive ? 'rgba(232,184,109,0.1)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <span
                  className="text-xs font-mono shrink-0"
                  style={{ color: isActive ? '#E8B86D' : '#D1D5DB' }}
                >
                  {section.number}
                </span>
                <span className="leading-snug">{section.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Loader2 } from 'lucide-react'

export default function Header({ siteName }: { siteName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [langLoading, setLangLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isEn = pathname.startsWith('/en')
  const base = isEn ? '/en' : ''

  const NAV_LINKS = [
    { href: `${base}/`, label: isEn ? 'Home' : '홈' },
    { href: `${base}/articles`, label: isEn ? 'Travel Guides' : '여행 가이드' },
    { href: `${base}/destinations`, label: isEn ? 'Itineraries' : '여행 일정' },
    { href: '/community', label: isEn ? 'Community' : '커뮤니티' },
  ]

  async function toggleLang() {
    if (langLoading) return
    setLangLoading(true)
    try {
      // Article detail pages
      const articleKoMatch = pathname.match(/^\/article\/([^/]+)$/)
      const articleEnMatch = pathname.match(/^\/en\/article\/([^/]+)$/)
      // Plan detail pages
      const planKoMatch = pathname.match(/^\/destinations\/([^/]+)\/([^/]+)\/([^/]+)$/)
      const planEnMatch = pathname.match(/^\/en\/destinations\/([^/]+)\/([^/]+)\/([^/]+)$/)

      if (articleKoMatch || articleEnMatch) {
        const slug = (articleKoMatch ?? articleEnMatch)![1]
        const targetLang = articleKoMatch ? 'en' : 'ko'
        const { data: current } = await supabase.from('articles').select('city').eq('slug', slug).maybeSingle()
        if (current?.city) {
          const { data: paired } = await supabase
            .from('articles').select('slug')
            .eq('city', current.city).eq('language', targetLang).eq('published', true)
            .limit(1).maybeSingle()
          if (paired?.slug) {
            router.push(targetLang === 'en' ? `/en/article/${paired.slug}` : `/article/${paired.slug}`)
            return
          }
        }
        router.push(targetLang === 'en' ? '/en/articles' : '/articles')
        return
      }

      if (planKoMatch || planEnMatch) {
        const match = planKoMatch ?? planEnMatch!
        const [, country, city, slug] = match
        const targetLang = planKoMatch ? 'en' : 'ko'
        const { data: current } = await supabase.from('travel_plans').select('city, country').eq('slug', slug).maybeSingle()
        if (current) {
          const { data: paired } = await supabase
            .from('travel_plans').select('slug')
            .eq('city', current.city).eq('country', current.country).eq('language', targetLang).eq('published', true)
            .limit(1).maybeSingle()
          if (paired?.slug) {
            const prefix = targetLang === 'en' ? '/en' : ''
            router.push(`${prefix}/destinations/${country}/${city}/${paired.slug}`)
            return
          }
        }
        const prefix = targetLang === 'en' ? '/en' : ''
        router.push(`${prefix}/destinations/${country}/${city}`)
        return
      }

      // Default: toggle /en prefix
      if (isEn) {
        router.push(pathname.slice(3) || '/')
      } else {
        router.push('/en' + (pathname === '/' ? '' : pathname))
      }
    } finally {
      setLangLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-[var(--measure-wide)] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl tracking-tight"
          style={{ color: 'var(--ink)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          {siteName}
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] tracking-wide text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Lang toggle */}
        <div className="hidden md:flex items-center flex-shrink-0">
          <button
            onClick={toggleLang}
            disabled={langLoading}
            className="text-[13px] tracking-wide text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50"
            title={isEn ? '한국어로 보기' : 'View in English'}
          >
            {langLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEn ? 'KO' : 'EN'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 -mr-2 text-[color:var(--ink)]" onClick={() => setMenuOpen(v => !v)} aria-label="메뉴">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)] px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[color:var(--ink)]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-[var(--border)]" />
          <button
            onClick={() => { toggleLang(); setMenuOpen(false) }}
            disabled={langLoading}
            className="flex items-center gap-2 text-sm text-[color:var(--ink)] text-left disabled:opacity-50"
          >
            {langLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEn ? '한국어로 보기' : 'View in English'}
          </button>
        </div>
      )}
    </header>
  )
}

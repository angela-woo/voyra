'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Globe, Home, BookOpen, MapPin, Users, LogIn, LogOut, UserCircle, UserPlus, Loader2, BookMarked } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Header({ siteName }: { siteName: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langLoading, setLangLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isEn = pathname.startsWith('/en')
  const base = isEn ? '/en' : ''

  const NAV_LINKS = [
    { href: `${base}/`, label: isEn ? 'Home' : '홈', icon: Home },
    { href: `${base}/articles`, label: isEn ? 'Travel Guides' : '여행 가이드', icon: BookOpen },
    { href: `${base}/destinations`, label: isEn ? 'Itineraries' : '여행 일정', icon: MapPin },
    { href: '/magazine', label: isEn ? 'Magazine' : '여행 매거진', icon: BookMarked },
    { href: '/community', label: isEn ? 'Community' : '커뮤니티', icon: Users },
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 text-2xl font-bold" style={{ color: '#FF5722', fontFamily: 'var(--font-heading)' }}>
          {siteName}
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors duration-200"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth + Lang toggle */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link href="/auth/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                <UserCircle className="w-4 h-4" />{isEn ? 'Profile' : '프로필'}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-[var(--radius)] border border-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />{isEn ? 'Log Out' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
                <LogIn className="w-4 h-4" />{isEn ? 'Log In' : '로그인'}
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: '#FF5722' }}
              >
                <UserPlus className="w-4 h-4" />{isEn ? 'Sign Up' : '회원가입'}
              </Link>
            </>
          )}
          <button
            onClick={toggleLang}
            disabled={langLoading}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[var(--primary)] transition-colors duration-200 flex items-center gap-1.5 font-medium text-gray-600 hover:text-[var(--primary)] disabled:opacity-50"
            title={isEn ? '한국어로 보기' : 'View in English'}
          >
            {langLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {isEn ? 'KO' : 'EN'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(v => !v)} aria-label="메뉴">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 shadow-md">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[var(--primary)]"
              onClick={() => setMenuOpen(false)}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href="/auth/profile" className="flex items-center gap-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                <UserCircle className="w-4 h-4" />{isEn ? 'Profile' : '프로필'}
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-left text-gray-700">
                <LogOut className="w-4 h-4" />{isEn ? 'Log Out' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="flex items-center gap-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                <LogIn className="w-4 h-4" />{isEn ? 'Log In' : '로그인'}
              </Link>
              <Link href="/auth/signup" className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]" onClick={() => setMenuOpen(false)}>
                <UserPlus className="w-4 h-4" />{isEn ? 'Sign Up' : '회원가입'}
              </Link>
            </>
          )}
          <button
            onClick={() => { toggleLang(); setMenuOpen(false) }}
            disabled={langLoading}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 text-left disabled:opacity-50"
          >
            {langLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {isEn ? '한국어로 보기' : 'View in English'}
          </button>
        </div>
      )}
    </header>
  )
}

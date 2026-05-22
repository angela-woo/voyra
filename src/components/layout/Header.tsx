'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Header({ siteName }: { siteName: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  function toggleLang() {
    if (isEn) {
      const ko = pathname.slice(3) || '/'
      router.push(ko)
    } else {
      router.push('/en' + (pathname === '/' ? '' : pathname))
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
              className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth + Lang toggle */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link href="/auth/profile" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">{isEn ? 'Profile' : '프로필'}</Link>
              <button
                onClick={handleSignOut}
                className="text-sm px-4 py-1.5 rounded-[var(--radius)] border border-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors duration-200"
              >
                {isEn ? 'Log Out' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">{isEn ? 'Log In' : '로그인'}</Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: '#FF5722' }}
              >
                {isEn ? 'Sign Up' : '회원가입'}
              </Link>
            </>
          )}
          <button
            onClick={toggleLang}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[var(--primary)] transition-colors duration-200 flex items-center gap-1.5 font-medium text-gray-600 hover:text-[var(--primary)]"
            title={isEn ? '한국어로 보기' : 'View in English'}
          >
            {isEn ? '🇰🇷 KO' : '🇺🇸 EN'}
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
              className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href="/auth/profile" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>{isEn ? 'Profile' : '프로필'}</Link>
              <button onClick={handleSignOut} className="text-sm text-left text-gray-700">{isEn ? 'Log Out' : '로그아웃'}</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>{isEn ? 'Log In' : '로그인'}</Link>
              <Link href="/auth/signup" className="text-sm font-medium text-[var(--primary)]" onClick={() => setMenuOpen(false)}>{isEn ? 'Sign Up' : '회원가입'}</Link>
            </>
          )}
          <button
            onClick={() => { toggleLang(); setMenuOpen(false) }}
            className="text-sm font-medium text-gray-700 text-left"
          >
            {isEn ? '🇰🇷 한국어로 보기' : '🇺🇸 View in English'}
          </button>
        </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Globe } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Header({ siteName }: { siteName: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/destinations', label: '여행 일정' },
    { href: '/community', label: '커뮤니티' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--primary)]">
          <Globe className="w-6 h-6" />
          <span style={{ fontFamily: 'var(--font-heading)' }}>{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/auth/profile" className="text-sm text-gray-600 hover:text-[var(--primary)]">
                프로필
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm px-4 py-1.5 rounded-[var(--radius)] border border-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[var(--primary)]">
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-1.5 rounded-[var(--radius)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-[var(--bg)] px-4 py-3 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href="/auth/profile" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>프로필</Link>
              <button onClick={handleSignOut} className="text-sm text-left text-gray-700">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>로그인</Link>
              <Link href="/auth/signup" className="text-sm text-[var(--primary)]" onClick={() => setMenuOpen(false)}>회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Globe, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('로그인되었습니다.')
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">비밀번호</label>
          <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-[var(--primary)]">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        로그인
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-sm bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--primary)] font-bold text-xl mb-2">
            <Globe className="w-6 h-6" />
            <span style={{ fontFamily: 'var(--font-heading)' }}>Kiravoy</span>
          </Link>
          <p className="text-sm text-gray-500">로그인하고 여행을 시작하세요</p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-50 rounded-[var(--radius)]" />}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-gray-500 mt-6">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="text-[var(--primary)] font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

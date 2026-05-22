'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Globe, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)

  const canSubmit = agreeTerms && agreePrivacy

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms || !agreePrivacy) { toast.error('필수 약관에 동의해주세요.'); return }
    if (password.length < 8) { toast.error('비밀번호는 8자 이상이어야 합니다.'); return }
    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    })
    const result = await res.json()
    setLoading(false)

    if (!res.ok) { toast.error(result.error ?? '회원가입에 실패했습니다.'); return }

    // 계정 생성 완료 → 바로 로그인
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      toast.success('가입 완료! 로그인 페이지로 이동합니다.')
      router.push('/auth/login')
      return
    }
    toast.success('가입 완료! 환영합니다.')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-sm bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--primary)] font-bold text-xl mb-2">
            <Globe className="w-6 h-6" />
            <span style={{ fontFamily: 'var(--font-heading)' }}>Kiravoy</span>
          </Link>
          <p className="text-sm text-gray-500">여행 커뮤니티에 참여하세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">닉네임</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="여행자닉네임"
              className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
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
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="8자 이상"
              minLength={8}
              className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500 font-medium">[필수]</span>{' '}
                <Link href="/terms" target="_blank" className="text-[var(--primary)] underline">이용약관</Link>에 동의합니다
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={e => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">
                <span className="text-red-500 font-medium">[필수]</span>{' '}
                <Link href="/privacy" target="_blank" className="text-[var(--primary)] underline">개인정보 수집·이용</Link>에 동의합니다
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={e => setAgreeMarketing(e.target.checked)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span className="text-sm text-gray-700">
                <span className="text-gray-400 font-medium">[선택]</span>{' '}
                마케팅 정보 수신에 동의합니다
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            회원가입
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[var(--primary)] font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

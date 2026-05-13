'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    } else {
      setDone(true)
      toast.success('구독 완료!')
    }
  }

  if (done) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[var(--radius)] p-6 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-emerald-700">구독해주셔서 감사합니다!</p>
        <p className="text-sm text-emerald-600 mt-1">최신 여행 정보를 이메일로 보내드릴게요.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[var(--radius)] p-6 text-white">
      <Mail className="w-8 h-8 mb-3 opacity-90" />
      <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        여행 소식 받아보기
      </h3>
      <p className="text-sm text-blue-100 mb-4">
        새로운 여행지와 꿀팁을 이메일로 받아보세요.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          required
          className="flex-1 px-3 py-2 rounded-[var(--radius)] text-sm text-gray-800 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-white text-[var(--primary)] font-semibold text-sm rounded-[var(--radius)] hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '구독'}
        </button>
      </form>
    </div>
  )
}

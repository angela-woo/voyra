'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // In production, connect to an email service or Supabase function
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setDone(true)
    toast.success('문의가 접수되었습니다.')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Mail className="w-10 h-10 text-[var(--primary)] mx-auto mb-3" />
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>문의하기</h1>
        <p className="text-gray-500 mt-2">궁금한 점이나 제안 사항을 알려주세요.</p>
      </div>

      {done ? (
        <div className="bg-green-50 rounded-[var(--radius)] p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-green-700">문의가 접수되었습니다!</p>
          <p className="text-sm text-green-600 mt-1">빠른 시일 내에 답변 드리겠습니다.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-[var(--radius)] border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">문의 내용</label>
            <textarea
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              required
              rows={6}
              className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            보내기
          </button>
        </form>
      )}
    </div>
  )
}

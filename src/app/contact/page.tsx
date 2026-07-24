'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) { toast.error('전송에 실패했습니다. 다시 시도해주세요.'); return }
    setDone(true)
  }

  const inputCls = "w-full border border-[var(--border)] px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-[color:var(--ink)]"

  return (
    <div className="max-w-lg mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <Mail className="w-7 h-7 text-[color:var(--ink-faint)] mx-auto mb-4" />
        <h1 className="editorial-heading text-3xl">문의하기</h1>
        <p className="text-[color:var(--ink-soft)] mt-2">궁금한 점이나 제안 사항을 알려주세요.</p>
      </div>

      {done ? (
        <div className="border border-[var(--border)] p-8 text-center">
          <CheckCircle className="w-8 h-8 text-[color:var(--ink-faint)] mx-auto mb-3" />
          <p className="text-[color:var(--ink)]" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>문의가 접수되었습니다!</p>
          <p className="text-sm text-[color:var(--ink-soft)] mt-1">빠른 시일 내에 답변 드리겠습니다.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">이름 *</label>
              <input value={form.name} onChange={set('name')} required placeholder="홍길동" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">이메일 *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">제목 *</label>
            <input value={form.subject} onChange={set('subject')} required placeholder="문의 제목을 입력하세요" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">문의 내용 *</label>
            <textarea value={form.message} onChange={set('message')} required rows={6} placeholder="문의 내용을 자세히 작성해주세요." className={inputCls + ' resize-none'} />
          </div>
          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            문의 보내기
          </button>
        </form>
      )}
    </div>
  )
}

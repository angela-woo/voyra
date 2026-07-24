'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageUploader from '@/components/community/ImageUploader'

const CATEGORIES = [
  { value: 'free', label: '자유' },
  { value: 'tips', label: '꿀팁' },
  { value: 'question', label: '질문' },
  { value: 'review', label: '후기' },
  { value: 'meetup', label: '모임' },
]

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('free')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUserId(data.user.id)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, image_urls: imageUrls }),
    })
    setLoading(false)
    if (res.status === 401) { toast.error('로그인이 필요합니다.'); router.push('/auth/login'); return }
    if (!res.ok) { toast.error('게시글 작성에 실패했습니다.'); return }
    const { id } = await res.json()
    toast.success('게시글이 등록되었습니다.')
    router.push(`/community/${id}`)
  }

  return (
    <div className="max-w-[var(--measure)] mx-auto px-6 py-16">
      <Link href="/community" className="link-underline flex items-center gap-1 text-sm text-[color:var(--ink-soft)] mb-8 w-fit">
        <ArrowLeft className="w-4 h-4" /> 커뮤니티로 돌아가기
      </Link>
      <h1 className="editorial-heading text-3xl mb-8">새 글 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-2">카테고리</label>
          <div className="flex gap-5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-sm transition-colors ${
                  category === cat.value
                    ? 'text-[color:var(--ink)] underline underline-offset-4'
                    : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className="w-full border border-[var(--border)] px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[color:var(--ink)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={10}
            className="w-full border border-[var(--border)] px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[color:var(--ink)] resize-y"
          />
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-2">이미지 (최대 5장, 각 5MB)</label>
          {userId && (
            <ImageUploader urls={imageUrls} onChange={setImageUrls} userId={userId} />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            게시하기
          </button>
          <Link href="/community" className="btn" style={{ borderColor: 'var(--border)', color: 'var(--ink-soft)' }}>
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}

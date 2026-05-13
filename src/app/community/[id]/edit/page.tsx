'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'free', label: '자유' },
  { value: 'tips', label: '꿀팁' },
  { value: 'question', label: '질문' },
  { value: 'review', label: '후기' },
  { value: 'meetup', label: '모임' },
]

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('free')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('community_posts').select('title, content, category, user_id').eq('id', id).single(),
      supabase.auth.getUser(),
    ]).then(([{ data: post }, { data: { user } }]) => {
      if (!post) { router.push('/community'); return }
      if (!user || post.user_id !== user.id) { toast.error('권한이 없습니다.'); router.push(`/community/${id}`); return }
      setTitle(post.title)
      setContent(post.content)
      setCategory(post.category ?? 'free')
      setInitializing(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) { toast.error('제목과 내용을 입력해주세요.'); return }
    setLoading(true)
    const res = await fetch(`/api/community/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category }),
    })
    setLoading(false)
    if (!res.ok) { toast.error('수정에 실패했습니다.'); return }
    toast.success('게시글이 수정되었습니다.')
    router.push(`/community/${id}`)
  }

  if (initializing) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/community/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--primary)] mb-6">
        <ArrowLeft className="w-4 h-4" /> 돌아가기
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>게시글 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  category === cat.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={12}
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] resize-y"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            수정 완료
          </button>
          <Link
            href={`/community/${id}`}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium text-sm rounded-[var(--radius)] hover:bg-gray-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}

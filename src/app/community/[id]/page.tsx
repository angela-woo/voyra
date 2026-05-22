'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CommentSection from '@/components/community/CommentSection'
import { ArrowLeft, ThumbsUp, Loader2, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

const CATEGORY_LABELS: Record<string, string> = {
  free: '자유', tips: '꿀팁', question: '질문', review: '후기', meetup: '모임',
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('community_posts').select('*, user_profiles(username, avatar_url)').eq('id', id).single(),
      supabase.auth.getUser(),
    ]).then(([{ data: postData }, { data: { user: userData } }]) => {
      if (!postData) { router.push('/community'); return }
      setPost(postData)
      setLikesCount(postData.likes_count ?? 0)
      setUser(userData)
      if (userData) {
        supabase.from('community_likes').select('id').eq('post_id', id).eq('user_id', userData.id).single()
          .then(({ data }) => setLiked(!!data))
      }
      setLoading(false)
    })
  }, [id])

  const handleLike = async () => {
    if (!user) { toast.error('로그인이 필요합니다.'); return }
    if (liked) {
      await supabase.from('community_likes').delete().eq('post_id', id).eq('user_id', user.id)
      setLiked(false)
      setLikesCount(c => c - 1)
    } else {
      await supabase.from('community_likes').insert({ post_id: id, user_id: user.id })
      setLiked(true)
      setLikesCount(c => c + 1)
    }
  }

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    setDeleting(true)
    const res = await fetch(`/api/community/posts/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('삭제에 실패했습니다.'); setDeleting(false); return }
    toast.success('게시글이 삭제되었습니다.')
    router.push('/community')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (!post) return null

  const isOwner = user?.id === post.user_id
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/community" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--primary)] mb-6">
        <ArrowLeft className="w-4 h-4" /> 커뮤니티
      </Link>

      <article className="bg-white rounded-[var(--radius)] border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {CATEGORY_LABELS[post.category] ?? post.category ?? '일반'}
          </span>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/community/${id}/edit`}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[var(--primary)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> 수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> 삭제
              </button>
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{post.title}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
          <span className="font-medium text-gray-600">{post.user_profiles?.username ?? '익명'}</span>
          <span>{timeAgo}</span>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</div>

        {post.image_urls?.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {post.image_urls.map((url: string) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-[var(--radius)] overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                <Image src={url} alt="" fill className="object-cover" />
              </a>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-[var(--primary)]'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likesCount}
          </button>
        </div>
      </article>

      <CommentSection postId={id} currentUserId={user?.id ?? null} />
    </div>
  )
}

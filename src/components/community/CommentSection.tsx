'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Send, Loader2, Reply } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

interface Comment {
  id: string
  content: string
  created_at: string
  parent_id: string | null
  user_id: string
  user_profiles?: { username: string | null } | null
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchComments()
  }, [])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('community_comments')
      .select('*, user_profiles(username)')
      .eq('post_id', postId)
      .order('created_at')
    setComments(data ?? [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('로그인이 필요합니다.'); return }
    if (!content.trim()) return
    setLoading(true)
    const { error } = await supabase.from('community_comments').insert({
      post_id: postId,
      content: content.trim(),
      parent_id: replyTo,
      user_id: user.id,
    })
    setLoading(false)
    if (error) { toast.error('댓글 작성에 실패했습니다.'); return }
    setContent('')
    setReplyTo(null)
    fetchComments()
  }

  const topLevel = comments.filter(c => !c.parent_id)
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg mb-4">댓글 {comments.length}개</h3>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {topLevel.map(comment => (
          <div key={comment.id}>
            <CommentItem comment={comment} onReply={() => setReplyTo(comment.id)} />
            {replies(comment.id).map(reply => (
              <div key={reply.id} className="ml-8 mt-2">
                <CommentItem comment={reply} onReply={() => setReplyTo(comment.id)} />
              </div>
            ))}
            {replyTo === comment.id && (
              <div className="ml-8 mt-2">
                <CommentForm
                  value={content}
                  onChange={setContent}
                  onSubmit={handleSubmit}
                  onCancel={() => setReplyTo(null)}
                  loading={loading}
                  placeholder="답글 작성..."
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top-level comment form */}
      {!replyTo && (
        user ? (
          <CommentForm
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            loading={loading}
            placeholder="댓글을 작성하세요..."
          />
        ) : (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-[var(--radius)]">
            댓글을 작성하려면 <a href="/auth/login" className="text-[var(--primary)] underline">로그인</a>이 필요합니다.
          </p>
        )
      )}
    </div>
  )
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })
  return (
    <div className="bg-gray-50 rounded-[var(--radius)] p-3">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{comment.user_profiles?.username ?? '익명'}</span>
        <span>{timeAgo}</span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
      <button onClick={onReply} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[var(--primary)] transition-colors">
        <Reply className="w-3 h-3" /> 답글
      </button>
    </div>
  )
}

function CommentForm({
  value, onChange, onSubmit, onCancel, loading, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  loading: boolean
  placeholder: string
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="flex-1 border border-gray-200 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
      />
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-3 py-2 bg-[var(--primary)] text-white rounded-[var(--radius)] text-sm hover:bg-[var(--primary-hover)] disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 border border-gray-200 rounded-[var(--radius)] text-xs text-gray-500 hover:bg-gray-50">
            취소
          </button>
        )}
      </div>
    </form>
  )
}

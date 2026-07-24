import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ThumbsUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'

const CATEGORY_LABELS_KO: Record<string, string> = {
  all: '전체', free: '자유', tips: '꿀팁', question: '질문', review: '후기', meetup: '모임',
}
const CATEGORY_LABELS_EN: Record<string, string> = {
  all: 'All', free: 'General', tips: 'Tips', question: 'Questions', review: 'Reviews', meetup: 'Meetups',
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  likes_count: number
  comments_count: number
  image_urls?: string[] | null
  user_profiles?: { username: string | null; avatar_url: string | null } | null
}

export default function PostCard({ post, locale = 'ko' }: { post: Post; locale?: 'ko' | 'en' }) {
  const dateLocale = locale === 'en' ? enUS : ko
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })
  const categoryLabels = locale === 'en' ? CATEGORY_LABELS_EN : CATEGORY_LABELS_KO
  const href = locale === 'en' ? `/en/community/${post.id}` : `/community/${post.id}`

  const thumbnail = post.image_urls?.[0]

  return (
    <Link href={href} className="block border-t border-[var(--border)] pt-4 pb-1 hover:opacity-70 transition-opacity">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="eyebrow mb-1.5">{categoryLabels[post.category] ?? post.category}</p>
          <h3 className="text-[15px] leading-snug mb-1.5 line-clamp-1 text-[color:var(--ink)]" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{post.title}</h3>
          <p className="text-sm text-[color:var(--ink-soft)] line-clamp-2 mb-2">{post.content}</p>
          <div className="flex items-center gap-3 text-xs text-[color:var(--ink-faint)]">
            <span>{post.user_profiles?.username ?? '익명'}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {post.likes_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.comments_count ?? 0}
            </span>
          </div>
        </div>
        {thumbnail && (
          <div className="relative w-16 h-16 shrink-0 bg-[var(--bg-secondary)] overflow-hidden">
            <Image src={thumbnail} alt="" fill className="object-cover" />
          </div>
        )}
      </div>
    </Link>
  )
}

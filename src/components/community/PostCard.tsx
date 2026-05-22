import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ThumbsUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const CATEGORY_LABELS: Record<string, string> = {
  all: '전체', free: '자유', tips: '꿀팁', question: '질문', review: '후기', meetup: '모임',
}
const CATEGORY_COLORS: Record<string, string> = {
  free: 'bg-blue-100 text-blue-700', tips: 'bg-green-100 text-green-700',
  question: 'bg-yellow-100 text-yellow-700', review: 'bg-purple-100 text-purple-700',
  meetup: 'bg-pink-100 text-pink-700',
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

export default function PostCard({ post }: { post: Post }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })
  const categoryColor = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'

  const thumbnail = post.image_urls?.[0]

  return (
    <Link href={`/community/${post.id}`} className="block bg-white rounded-[var(--radius)] border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
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
          <div className="relative w-16 h-16 shrink-0 rounded-[var(--radius)] overflow-hidden border border-gray-100">
            <Image src={thumbnail} alt="" fill className="object-cover" />
          </div>
        )}
      </div>
    </Link>
  )
}

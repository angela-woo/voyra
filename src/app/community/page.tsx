import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/community/PostCard'
import Link from 'next/link'
import { PenSquare, MessageCircle, Lightbulb, HelpCircle, Star, Users } from 'lucide-react'

export const revalidate = 300

const CATEGORIES = [
  { value: 'all', label: '전체', icon: null },
  { value: 'free', label: '자유', icon: MessageCircle },
  { value: 'tips', label: '꿀팁', icon: Lightbulb },
  { value: 'question', label: '질문', icon: HelpCircle },
  { value: 'review', label: '후기', icon: Star },
  { value: 'meetup', label: '모임', icon: Users },
]

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const activeCategory = category && category !== 'all' ? category : null

  const supabase = await createClient()
  let query = supabase
    .from('community_posts')
    .select('id, title, content, category, created_at, likes_count, comments_count, image_urls, user_profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: posts } = await query

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          커뮤니티
        </h1>
        <Link
          href="/community/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          글쓰기
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => {
          const isActive = (cat.value === 'all' && !activeCategory) || cat.value === activeCategory
          return (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/community' : `/community?category=${cat.value}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>아직 게시글이 없습니다.</p>
            <Link href="/community/new" className="text-sm text-[var(--primary)] mt-2 inline-block">
              첫 번째 글을 작성해보세요 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

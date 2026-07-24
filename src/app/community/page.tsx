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
    <div className="max-w-[var(--measure)] mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <p className="eyebrow mb-3">Kiravoy</p>
          <h1 className="editorial-heading text-3xl">
            커뮤니티
          </h1>
        </div>
        <Link href="/community/new" className="btn shrink-0">
          <PenSquare className="w-3.5 h-3.5" />
          글쓰기
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-6 flex-wrap mb-10">
        {CATEGORIES.map(cat => {
          const isActive = (cat.value === 'all' && !activeCategory) || cat.value === activeCategory
          return (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/community' : `/community?category=${cat.value}`}
              className={`text-sm tracking-wide transition-colors ${
                isActive
                  ? 'text-[color:var(--ink)] underline underline-offset-4'
                  : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)]'
              }`}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Posts */}
      <div>
        {posts && posts.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-16 text-[color:var(--ink-faint)]">
            <p>아직 게시글이 없습니다.</p>
            <Link href="/community/new" className="link-underline text-sm text-[color:var(--primary)] mt-2 inline-block">
              첫 번째 글을 작성해보세요 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

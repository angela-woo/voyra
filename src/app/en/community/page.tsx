import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/community/PostCard'
import Link from 'next/link'
import { PenSquare, MessageCircle, Lightbulb, HelpCircle, Star, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community | Kiravoy',
  description: 'Share travel tips, reviews, and questions with fellow travelers.',
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: null },
  { value: 'free', label: 'General', icon: MessageCircle },
  { value: 'tips', label: 'Tips', icon: Lightbulb },
  { value: 'question', label: 'Questions', icon: HelpCircle },
  { value: 'review', label: 'Reviews', icon: Star },
  { value: 'meetup', label: 'Meetups', icon: Users },
]

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function EnCommunityPage({ searchParams }: PageProps) {
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
          Community
        </h1>
        <Link
          href="/en/community/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          Write a Post
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => {
          const isActive = (cat.value === 'all' && !activeCategory) || cat.value === activeCategory
          return (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/en/community' : `/en/community?category=${cat.value}`}
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
          posts.map((post: any) => <PostCard key={post.id} post={post} locale="en" />)
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>No posts yet. Be the first to write!</p>
            <Link href="/en/community/new" className="text-sm text-[var(--primary)] mt-2 inline-block">
              Write a post →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

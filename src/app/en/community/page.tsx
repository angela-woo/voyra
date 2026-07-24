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
    <div className="max-w-[var(--measure)] mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <p className="eyebrow mb-3">Kiravoy</p>
          <h1 className="editorial-heading text-3xl">
            Community
          </h1>
        </div>
        <Link href="/en/community/new" className="btn shrink-0">
          <PenSquare className="w-3.5 h-3.5" />
          Write a Post
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-6 flex-wrap mb-10">
        {CATEGORIES.map(cat => {
          const isActive = (cat.value === 'all' && !activeCategory) || cat.value === activeCategory
          return (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/en/community' : `/en/community?category=${cat.value}`}
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
          posts.map((post: any) => <PostCard key={post.id} post={post} locale="en" />)
        ) : (
          <div className="text-center py-16 text-[color:var(--ink-faint)]">
            <p>No posts yet. Be the first to write!</p>
            <Link href="/en/community/new" className="link-underline text-sm text-[color:var(--primary)] mt-2 inline-block">
              Write a post →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

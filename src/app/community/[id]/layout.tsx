import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('community_posts')
    .select('title, content, category')
    .eq('id', id)
    .single()

  if (!post) return { title: '커뮤니티 | Kiravoy' }

  const plain = (post.content ?? '').replace(/\n+/g, ' ').trim()
  const description = plain.length > 50
    ? plain.slice(0, 157) + '...'
    : `Kiravoy 여행 커뮤니티 - ${post.title}`

  return {
    title: `${post.title} | Kiravoy 커뮤니티`,
    description,
    openGraph: {
      title: `${post.title} | Kiravoy 커뮤니티`,
      description,
      url: `https://kiravoy.com/community/${id}`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${post.title} | Kiravoy 커뮤니티`,
      description,
    },
  }
}

export default function CommunityPostLayout({ children }: LayoutProps) {
  return children
}

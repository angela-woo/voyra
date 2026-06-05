import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ArticleCard from '@/components/article/ArticleCard'
import Link from 'next/link'
import { Rss } from 'lucide-react'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://kiravoy.com'
const PAGE_SIZE = 12

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '최신 여행 가이드',
    description: '전 세계 여행지의 최신 여행 가이드를 만나보세요. 도쿄, 파리, 발리, 방콕 등 인기 여행지의 완벽한 여행 정보를 제공합니다.',
    openGraph: {
      title: '최신 여행 가이드 | Kiravoy',
      description: '전 세계 여행지의 최신 여행 가이드를 만나보세요.',
      url: `${BASE_URL}/latest-guides`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
    },
    alternates: {
      canonical: `${BASE_URL}/latest-guides`,
      types: {
        'application/rss+xml': `${BASE_URL}/feed.xml`,
      },
    },
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

function getDateGroup(dateStr: string | null): string {
  if (!dateStr) return '이전'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 1) return '오늘'
  if (diffDays < 7) return '이번 주'
  if (diffDays < 30) return '이번 달'
  return '이전'
}

const GROUP_ORDER = ['오늘', '이번 주', '이번 달', '이전']

export default async function LatestGuidesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: articles, count } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, city, country, category, created_at, cover_image_url, cover_image_attribution', { count: 'exact' })
    .eq('published', true)
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Group articles by date period
  type ArticleRow = {
    id: string
    slug: string
    title: string
    meta_description: string | null
    city: string | null
    country: string | null
    category: string | null
    created_at: string | null
    cover_image_url: string | null
    cover_image_attribution: string | null
  }

  const grouped: Record<string, ArticleRow[]> = {}
  for (const article of (articles ?? []) as ArticleRow[]) {
    const group = getDateGroup(article.created_at)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(article)
  }

  const orderedGroups = GROUP_ORDER.filter((g) => grouped[g]?.length > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            최신 여행 가이드
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            전 세계 여행지의 최신 가이드를 만나보세요
            {count ? ` · 총 ${count.toLocaleString()}개` : ''}
          </p>
        </div>
        <Link
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF5722' }}
        >
          <Rss className="w-4 h-4" />
          RSS 구독
        </Link>
      </div>

      {/* Article groups */}
      {orderedGroups.length === 0 ? (
        <p className="text-gray-400 text-center py-20">아직 게시된 가이드가 없습니다.</p>
      ) : (
        orderedGroups.map((group) => (
          <section key={group} className="mb-12">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#FF5722' }} />
              {group}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {grouped[group].map((article) => (
                <ArticleCard key={article.slug} article={article} locale="ko" />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/latest-guides?page=${page - 1}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              이전
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <Link
                key={p}
                href={`/latest-guides?page=${p}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={
                  p === page
                    ? { backgroundColor: '#FF5722', color: 'white' }
                    : { border: '1px solid #e5e7eb', color: '#4b5563' }
                }
              >
                {p}
              </Link>
            ))}
          {page < totalPages && (
            <Link
              href={`/latest-guides?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

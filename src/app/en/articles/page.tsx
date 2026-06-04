import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import AdUnit from '@/components/ui/AdUnit'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Travel Guides | Kiravoy',
  description: 'Expert travel guides for top destinations worldwide. Find local tips, attractions, restaurants and transportation info.',
  keywords: ['travel guide', 'travel tips', 'destination guide', 'travel information'],
  alternates: {
    canonical: 'https://kiravoy.com/en/articles',
    languages: {
      ko: 'https://kiravoy.com/articles',
      en: 'https://kiravoy.com/en/articles',
      'x-default': 'https://kiravoy.com/articles',
    },
  },
  openGraph: {
    title: 'Travel Guides | Kiravoy',
    description: 'Expert travel guides for top destinations worldwide.',
    url: 'https://kiravoy.com/en/articles',
    siteName: 'Kiravoy',
    locale: 'en_US',
    type: 'website',
  },
}

const PER_PAGE = 12
const SELECT_COLS = 'id, slug, title, meta_description, city, country, category, created_at, cover_image_url'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function fetchArticles(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * PER_PAGE
  const { data, count } = await supabase
    .from('articles')
    .select(SELECT_COLS, { count: 'exact' })
    .eq('published', true)
    .eq('language', 'en')
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)
  return { articles: data ?? [], total: count ?? 0 }
}

export default async function EnArticlesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const { articles, total } = await fetchArticles(page)
  const totalPages = Math.ceil(total / PER_PAGE)
  const rangeStart = (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | 'dot')[]>((acc, p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('dot')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Travel Guides
          </h1>
          <p className="text-white/80 text-sm">
            {total > 0 ? `${total.toLocaleString()} curated travel guides` : 'Curated travel guides'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {articles.length > 0 ? (
          <>
            {total > 0 && (
              <p className="text-sm text-gray-400 mb-6">
                Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()} guides
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {articles.slice(0, 6).map((article: any) => (
                <ArticleCard key={article.id} article={article} locale="en" />
              ))}
              {articles.length > 6 && (
                <>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <AdUnit slot="6933794765" />
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {articles.slice(6).map((article: any) => (
                    <ArticleCard key={article.id} article={article} locale="en" />
                  ))}
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {page > 1 ? (
                  <Link href={`/en/articles?page=${page - 1}`} className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-[var(--radius)] text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                    <ChevronLeft className="w-4 h-4" />Prev
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-100 rounded-[var(--radius)] text-gray-300 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />Prev
                  </span>
                )}
                {pageNumbers.map((p, i) =>
                  p === 'dot' ? (
                    <span key={`dot-${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/en/articles?page=${p}`}
                      className={`w-9 h-9 flex items-center justify-center text-sm rounded-[var(--radius)] border transition-colors ${
                        page === p
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                )}
                {page < totalPages ? (
                  <Link href={`/en/articles?page=${page + 1}`} className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-[var(--radius)] text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                    Next<ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-100 rounded-[var(--radius)] text-gray-300 cursor-not-allowed">
                    Next<ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BookOpen className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">English guides coming soon!</p>
            <p className="text-sm mb-4">We&apos;re working on English-language travel guides.</p>
            <Link href="/articles" className="text-sm font-medium hover:underline" style={{ color: '#FF5722' }}>
              Browse Korean guides →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

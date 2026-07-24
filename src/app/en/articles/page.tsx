import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import AdUnit from '@/components/ui/AdUnit'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)
    .eq('language', 'en')
    .not('slug', 'in', `(${Array.from(NOINDEX_ARTICLE_SLUGS).join(',')})`)

  const total = count ?? 0
  const description = `Expert travel guides for ${total > 0 ? `${total}+ ` : ''}top destinations worldwide. Find local tips, attractions, restaurants and transportation info.`

  return {
    title: 'Travel Guides | Kiravoy',
    description,
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
      description,
      url: 'https://kiravoy.com/en/articles',
      siteName: 'Kiravoy',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Travel Guides | Kiravoy',
      description,
    },
  }
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
    .not('slug', 'in', `(${Array.from(NOINDEX_ARTICLE_SLUGS).join(',')})`)
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
      <div className="border-b border-[var(--border)] py-16 px-6">
        <div className="max-w-[var(--measure-wide)] mx-auto">
          <p className="eyebrow mb-3">Kiravoy</p>
          <h1 className="editorial-heading text-4xl mb-3">
            Travel Guides
          </h1>
          <p className="text-[color:var(--ink-soft)] text-sm">
            {total > 0 ? `${total.toLocaleString()} curated travel guides` : 'Curated travel guides'}
          </p>
        </div>
      </div>

      <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-14">
        {articles.length > 0 ? (
          <>
            {total > 0 && (
              <p className="text-sm text-[color:var(--ink-faint)] mb-8">
                Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()} guides
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-14">
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
              <div className="flex items-center justify-center gap-6 mt-4 pt-10 border-t border-[var(--border)] text-sm">
                {page > 1 ? (
                  <Link href={`/en/articles?page=${page - 1}`} className="flex items-center gap-1 text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors">
                    <ChevronLeft className="w-4 h-4" />Prev
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-[color:var(--ink-faint)] opacity-40 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />Prev
                  </span>
                )}
                <div className="flex items-center gap-4">
                  {pageNumbers.map((p, i) =>
                    p === 'dot' ? (
                      <span key={`dot-${i}`} className="text-[color:var(--ink-faint)]">…</span>
                    ) : (
                      <Link
                        key={p}
                        href={`/en/articles?page=${p}`}
                        className={
                          page === p
                            ? 'text-[color:var(--ink)] underline underline-offset-4'
                            : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)] transition-colors'
                        }
                      >
                        {p}
                      </Link>
                    ),
                  )}
                </div>
                {page < totalPages ? (
                  <Link href={`/en/articles?page=${page + 1}`} className="flex items-center gap-1 text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors">
                    Next<ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-[color:var(--ink-faint)] opacity-40 cursor-not-allowed">
                    Next<ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-[color:var(--ink-faint)]">
            <BookOpen className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg mb-1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>English guides coming soon!</p>
            <p className="text-sm mb-4">We&apos;re working on English-language travel guides.</p>
            <Link href="/articles" className="link-underline text-sm text-[color:var(--primary)]">
              Browse Korean guides →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

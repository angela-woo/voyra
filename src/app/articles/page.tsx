import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import FilterBar from '@/components/articles/FilterBar'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import AdUnit from '@/components/ui/AdUnit'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)
    .eq('language', 'ko')

  const total = count ?? 0
  const description = `도쿄, 파리, 발리 등 ${total > 0 ? `${total}개의 ` : ''}인기 여행지 가이드. 현지 맛집, 관광지, 교통, 숙소 정보까지 한번에.`

  return {
    title: '해외여행 가이드 모음 | Kiravoy',
    description,
    keywords: ['해외여행가이드', '여행정보', '여행가이드', '도쿄여행정보', '파리여행정보'],
    alternates: {
      canonical: 'https://kiravoy.com/articles',
      languages: {
        ko: 'https://kiravoy.com/articles',
        en: 'https://kiravoy.com/en/articles',
        'x-default': 'https://kiravoy.com/articles',
      },
    },
    openGraph: {
      title: '해외여행 가이드 모음 | Kiravoy',
      description,
      url: 'https://kiravoy.com/articles',
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '해외여행 가이드 모음 | Kiravoy',
      description,
    },
  }
}

const PER_PAGE = 12
const SELECT_COLS = 'id, slug, title, meta_description, city, country, category, created_at, cover_image_url'

interface PageProps {
  searchParams: Promise<{ page?: string; sort?: string; country?: string; category?: string }>
}

async function fetchArticles(page: number, sort: string, country: string, category: string) {
  const supabase = await createClient()
  const from = (page - 1) * PER_PAGE

  const buildBase = () => {
    let q = supabase
      .from('articles')
      .select(SELECT_COLS, { count: 'exact' })
      .eq('published', true)
      .eq('language', 'ko')
    if (country) q = q.eq('country', country)
    if (category) q = q.eq('category', category)
    return q
  }

  // 인기순: views_count 시도, 컬럼 없으면 최신순 fallback
  if (sort === 'popular') {
    const { data, count, error } = await buildBase()
      .order('views_count', { ascending: false, nullsFirst: false })
      .range(from, from + PER_PAGE - 1)
    if (!error) return { articles: data ?? [], total: count ?? 0 }
  }

  const { data, count } = await buildBase()
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)
  return { articles: data ?? [], total: count ?? 0 }
}

async function getFilters() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('country, category')
    .eq('published', true)
    .eq('language', 'ko')

  const countries = Array.from(
    new Set((data ?? []).map(r => r.country).filter((v): v is string => !!v)),
  ).sort()
  const categories = Array.from(
    new Set((data ?? []).map(r => r.category).filter((v): v is string => !!v)),
  ).sort()
  return { countries, categories }
}

function pageUrl(p: number, sort: string, country: string, category: string) {
  const params = new URLSearchParams()
  if (p > 1) params.set('page', String(p))
  if (sort && sort !== 'newest') params.set('sort', sort)
  if (country) params.set('country', country)
  if (category) params.set('category', category)
  const qs = params.toString()
  return `/articles${qs ? `?${qs}` : ''}`
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const sort = sp.sort ?? 'newest'
  const country = sp.country ?? ''
  const category = sp.category ?? ''

  const [{ articles, total }, { countries, categories }] = await Promise.all([
    fetchArticles(page, sort, country, category),
    getFilters(),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)
  const rangeStart = (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, total)

  // 페이지 번호 목록 (ellipsis 포함)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | 'dot')[]>((acc, p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('dot')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* 페이지 헤더 */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            여행 가이드
          </h1>
          <p className="text-blue-100 text-sm">
            엄선한{total > 0 ? ` ${total.toLocaleString()}개의` : ''} 여행 가이드
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* 필터 바 */}
        <FilterBar
          countries={countries}
          categories={categories}
          currentSort={sort}
          currentCountry={country}
          currentCategory={category}
        />

        {/* 결과 수 */}
        {total > 0 && (
          <p className="text-sm text-gray-400 mb-6">
            {total.toLocaleString()}개 중 {rangeStart}–{rangeEnd}번째
            {country && ` · ${country}`}
            {category && ` · ${category}`}
          </p>
        )}

        {/* 그리드 */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {articles.slice(0, 6).map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {articles.length > 6 && (
                <>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <AdUnit slot="6933794765" />
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {articles.slice(6).map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {/* 이전 버튼 */}
                {page > 1 ? (
                  <Link
                    href={pageUrl(page - 1, sort, country, category)}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-[var(--radius)] text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />이전
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-100 rounded-[var(--radius)] text-gray-300 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />이전
                  </span>
                )}

                {/* 페이지 번호 */}
                {pageNumbers.map((p, i) =>
                  p === 'dot' ? (
                    <span key={`dot-${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={pageUrl(p as number, sort, country, category)}
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

                {/* 다음 버튼 */}
                {page < totalPages ? (
                  <Link
                    href={pageUrl(page + 1, sort, country, category)}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-[var(--radius)] text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    다음<ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-100 rounded-[var(--radius)] text-gray-300 cursor-not-allowed">
                    다음<ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BookOpen className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">아티클이 없습니다</p>
            <p className="text-sm">
              {country || category ? '다른 필터로 검색해보세요.' : '아직 게시된 가이드가 없습니다.'}
            </p>
            {(country || category) && (
              <Link href="/articles" className="mt-4 text-sm text-[var(--primary)] hover:underline">
                전체 보기
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

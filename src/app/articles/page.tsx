import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '여행 가이드 | Voyra',
  description: '세계 각국의 AI 큐레이션 여행 가이드를 탐색해보세요.',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

interface PageProps {
  searchParams: Promise<{ sort?: string; country?: string; category?: string; page?: string }>
}

async function getArticles(sort: string, country: string, category: string, page: number) {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('articles')
    .select('id, slug, title, meta_description, city, country, category, created_at', { count: 'exact' })
    .eq('published', true)

  if (country) query = query.eq('country', country)
  if (category) query = query.eq('category', category)

  if (sort === 'popular') {
    query = query.order('views_count', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count } = await query
  return { articles: data ?? [], total: count ?? 0 }
}

async function getFilterOptions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('country, category')
    .eq('published', true)

  if (!data) return { countries: [], categories: [] }

  const countries = Array.from(new Set(data.map(r => r.country).filter(Boolean))).sort()
  const categories = Array.from(new Set(data.map(r => r.category).filter(Boolean))).sort()
  return { countries, categories }
}

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v) })
  const s = p.toString()
  return `/articles${s ? `?${s}` : ''}`
}

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
]

const CATEGORY_LABELS: Record<string, string> = {
  culture: '문화',
  food: '맛집',
  nature: '자연',
  adventure: '액티비티',
  city: '도시',
  beach: '해변',
  history: '역사',
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { sort = 'latest', country = '', category = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10) || 1)

  const [{ articles, total }, { countries, categories }] = await Promise.all([
    getArticles(sort, country, category, page),
    getFilterOptions(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const baseParams = { sort: sort !== 'latest' ? sort : undefined, country: country || undefined, category: category || undefined }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          여행 가이드
        </h1>
        <p className="text-gray-500">AI가 큐레이션한 세계 각국의 여행 가이드</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-100">
        {/* Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <Link
              key={opt.value}
              href={buildUrl({ ...baseParams, sort: opt.value !== 'latest' ? opt.value : undefined, page: undefined })}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                sort === opt.value
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Link
                href={buildUrl({ ...baseParams, category: undefined, page: undefined })}
                className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕ {CATEGORY_LABELS[category] ?? category}
              </Link>
            )}
            {categories.map(cat => (
              <Link
                key={cat}
                href={buildUrl({ ...baseParams, category: cat !== category ? cat : undefined, page: undefined })}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'border-gray-200 text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Country filter */}
      {countries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {country && (
            <Link
              href={buildUrl({ ...baseParams, country: undefined, page: undefined })}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--primary)] text-white"
            >
              ✕ {country}
            </Link>
          )}
          {countries.filter(c => c !== country).map(c => (
            <Link
              key={c}
              href={buildUrl({ ...baseParams, country: c, page: undefined })}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-gray-400 mb-6">
        총 {total}개 가이드
        {country && ` · ${country}`}
        {category && ` · ${CATEGORY_LABELS[category] ?? category}`}
      </p>

      {/* Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {articles.map((article: any) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>조건에 맞는 가이드가 없습니다.</p>
          <Link href="/articles" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
            전체 보기
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={buildUrl({ ...baseParams, page: page > 1 ? String(page - 1) : undefined })}
            className={`p-2 rounded-lg border transition-colors ${
              page <= 1 ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <Link
                  key={p}
                  href={buildUrl({ ...baseParams, page: p === 1 ? undefined : String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                  }`}
                >
                  {p}
                </Link>
              )
            )}

          <Link
            href={buildUrl({ ...baseParams, page: page < totalPages ? String(page + 1) : String(totalPages) })}
            className={`p-2 rounded-lg border transition-colors ${
              page >= totalPages ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface InternalLinksProps {
  city: string | null
  country: string | null
  currentSlug: string
  content: string
  language: 'ko' | 'en'
}

interface ArticleRow {
  slug: string
  title: string
  cover_image_url: string | null
  city: string | null
  country: string | null
}

// 제목에서 검색 키워드 추출 (2글자 이상 단어, 조사·불용어 제외)
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    // 한국어 불용어
    '여행', '가이드', '정보', '추천', '완벽', '완전', '총정리', '총편', '핵심',
    '베스트', '인기', '필수', '최고', '최신', '2024', '2025', '2026',
    '하는', '하기', '하면', '에서', '으로', '부터', '까지', '이란', '이란',
    '방법', '팁', '꿀팁', '모음', '리스트', '리뷰', '후기',
    // 영어 불용어
    'the', 'a', 'an', 'in', 'of', 'to', 'and', 'for', 'with', 'on', 'at',
    'is', 'are', 'was', 'guide', 'travel', 'best', 'top', 'tips',
  ])

  // 한국어: 괄호·특수문자 제거 후 2글자 이상 토큰
  const koTokens = title
    .replace(/[()[\]{}.,!?:;'"·★☆]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && /[가-힣]/.test(t) && !stopWords.has(t))

  // 영어: 대문자 시작 단어 또는 2글자 이상 단어 (고유명사 우선)
  const enTokens = title
    .replace(/[()[\]{}.,!?:;'"]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && /[a-zA-Z]/.test(t) && !stopWords.has(t.toLowerCase()))

  const seen = new Set<string>()
  return [...koTokens, ...enTokens].filter(t => seen.has(t) ? false : (seen.add(t), true))
}

// 키워드가 본문에 등장하는지 확인 (대소문자 무시)
function keywordsMatch(keywords: string[], content: string): boolean {
  const contentLower = content.toLowerCase()
  return keywords.some(kw => contentLower.includes(kw.toLowerCase()))
}

export default async function InternalLinks({
  city,
  country,
  currentSlug,
  content,
  language,
}: InternalLinksProps) {
  if (!city && !country) return null

  const supabase = await createClient()

  const { data } = await supabase
    .from('articles')
    .select('slug, title, cover_image_url, city, country')
    .eq('published', true)
    .eq('language', language)
    .neq('slug', currentSlug)
    .eq('city', city ?? '')
    .order('created_at', { ascending: false })
    .limit(10)

  const candidates = (data ?? []) as ArticleRow[]

  // 키워드 매칭으로 관련 아티클 필터링
  const matched = candidates.filter(article => {
    const keywords = extractKeywords(article.title)
    return keywords.length > 0 && keywordsMatch(keywords, content)
  })

  // 매칭 없으면 최신 3개 fallback
  const display = matched.length > 0 ? matched.slice(0, 5) : candidates.slice(0, 3)

  if (display.length === 0) return null

  const isKo = language === 'ko'
  const articlePath = isKo ? '/article' : '/en/article'
  const heading = isKo ? '이 글도 읽어보세요' : 'You Might Also Like'

  return (
    <div className="not-prose my-8 p-5 rounded-2xl border border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
        <h2 className="text-base font-bold text-gray-900">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map(article => (
          <Link
            key={article.slug}
            href={`${articlePath}/${article.slug}`}
            className="group flex gap-3 items-start rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow p-3"
          >
            {article.cover_image_url && (
              <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={article.cover_image_url}
                  alt={article.title}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">
                {[article.city, article.country].filter(Boolean).join(', ')}
              </p>
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#FF5722] transition-colors leading-snug">
                {article.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

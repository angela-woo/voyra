import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import { fetchUnsplashPhoto, fetchUnsplashPhotos } from '@/lib/unsplash'
import type { UnsplashPhoto } from '@/lib/unsplash'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Eye } from 'lucide-react'
import HeroSearch from '@/components/home/HeroSearch'
import CountryTabSection from '@/components/home/CountryTabSection'

export const dynamic = 'force-dynamic'

// ── 나라 카드 목록 ──────────────────────────────────────────────────────────
const COUNTRIES = [
  { name: '일본', flag: '🇯🇵', query: 'Japan Mount Fuji travel', dbName: '일본' },
  { name: '프랑스', flag: '🇫🇷', query: 'Paris France Eiffel Tower', dbName: '프랑스' },
  { name: '태국', flag: '🇹🇭', query: 'Bangkok Thailand golden temple', dbName: '태국' },
  { name: '인도네시아', flag: '🇮🇩', query: 'Bali Indonesia rice terraces', dbName: '인도네시아' },
  { name: '싱가포르', flag: '🇸🇬', query: 'Singapore Marina Bay Sands skyline', dbName: '싱가포르' },
  { name: '영국', flag: '🇬🇧', query: 'London UK Big Ben bridge', dbName: '영국' },
  { name: '스페인', flag: '🇪🇸', query: 'Barcelona Spain Sagrada Familia', dbName: '스페인' },
  { name: '호주', flag: '🇦🇺', query: 'Sydney Australia Opera House harbour', dbName: '호주' },
]

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  couple: '💑 커플',
  family: '👨‍👩‍👧‍👦 가족',
  friends: '👫 친구',
  solo: '🧳 혼자',
}

// ── 데이터 조회 ──────────────────────────────────────────────────────────────
async function getArticles(limit: number) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, meta_description, city, country, category, created_at, cover_image_url')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getTravelPlans(limit: number) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('travel_plans')
      .select('id, slug, city, country, days, travel_type, title, meta_description, views_count, cover_image_url')
      .eq('published', true)
      .order('views_count', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getCountryCounts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('travel_plans').select('country').eq('published', true)
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      if (row.country) counts[row.country] = (counts[row.country] ?? 0) + 1
    }
    return counts
  } catch { return {} as Record<string, number> }
}

async function getTabData() {
  try {
    const supabase = await createClient()
    const [{ data: articles }, { data: plans }] = await Promise.all([
      supabase
        .from('articles')
        .select('id, slug, title, meta_description, city, country, category, cover_image_url')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(60),
      supabase
        .from('travel_plans')
        .select('id, slug, city, country, days, travel_type, title, meta_description')
        .eq('published', true)
        .order('views_count', { ascending: false })
        .limit(40),
    ])
    return { articles: articles ?? [], plans: plans ?? [] }
  } catch { return { articles: [], plans: [] } }
}

// ── 페이지 ────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  // 모든 데이터 병렬 조회
  const [
    articles,
    travelPlans,
    countryCounts,
    tabData,
    heroPhoto,
    countryPhotoList,
  ] = await Promise.all([
    getArticles(9),
    getTravelPlans(6),
    getCountryCounts(),
    getTabData(),
    fetchUnsplashPhoto('luxury travel destination landscape adventure'),
    Promise.all(COUNTRIES.map(c => fetchUnsplashPhotos(c.query, 1).then(r => r[0] ?? null))),
  ])

  const countryPhotos = countryPhotoList as (UnsplashPhoto | null)[]
  // 플랜 이미지는 DB의 cover_image_url만 사용 (scripts/update-travel-plan-images.ts 로 저장)
  // Unsplash fallback 없음 → rate limit 절약

  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. 히어로 섹션 ─────────────────────────────────────────────────── */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          {heroPhoto ? (
            <Image
              src={heroPhoto.url}
              alt="여행"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* 히어로 콘텐츠 */}
        <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            어디로 떠나고 싶으세요?
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 font-light">
            전문가가 엄선한 맞춤 여행 가이드
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ── 2. 인기 여행지 카테고리 ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          인기 여행지
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">지금 가장 인기 있는 여행지를 만나보세요</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COUNTRIES.map((country, i) => {
            const photo = countryPhotos[i]
            const count = countryCounts[country.dbName] ?? 0
            return (
              <Link
                key={country.name}
                href={`/destinations/${encodeURIComponent(country.dbName)}`}
                className="group relative rounded-[var(--radius)] overflow-hidden block shadow-sm hover:shadow-xl transition-shadow duration-300"
                style={{ height: '200px' }}
              >
                {/* 이미지 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600">
                  {photo && (
                    <Image
                      src={photo.url}
                      alt={country.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                {/* 텍스트 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-bold text-base">{country.name}</span>
                  </div>
                  {count > 0 && (
                    <p className="text-xs text-white/70">여행 일정 {count}개</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── 3. 최신 여행 가이드 ──────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>최신 여행 가이드</h2>
              <p className="text-gray-500 text-sm mt-1">엄선한 최신 여행 정보</p>
            </div>
            <Link href="/articles" className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline transition-colors">
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">아직 게시된 가이드가 없습니다.</p>
          )}
        </div>
      </section>

      {/* ── 4. 인기 여행 일정 ────────────────────────────────────────────────── */}
      {travelPlans.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>인기 여행 일정</h2>
              <p className="text-gray-500 text-sm mt-1">여행자들이 가장 많이 찾는 일정</p>
            </div>
            <Link href="/destinations" className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline transition-colors">
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {travelPlans.map((plan: any) => {
              const photoUrl: string | null = plan.cover_image_url ?? null
              return (
                <Link
                  key={plan.id}
                  href={`/destinations/${encodeURIComponent(plan.country)}/${encodeURIComponent(plan.city)}/${plan.slug}`}
                  className="group bg-white rounded-[var(--radius)] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                >
                  {/* 이미지 */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                    {photoUrl && (
                      <Image
                        src={photoUrl}
                        alt={plan.city}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {plan.travel_type && (
                        <span className="text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}
                        </span>
                      )}
                      <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                        {plan.days}일
                      </span>
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1.5">{plan.city}, {plan.country}</p>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-snug">
                      {plan.title}
                    </h3>
                    {plan.meta_description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{plan.meta_description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{plan.days}일 일정
                      </span>
                      {plan.views_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />{plan.views_count.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 5. 나라별 여행 모아보기 ──────────────────────────────────────────── */}
      <div className="bg-[var(--bg-secondary)] border-t border-gray-100">
        <CountryTabSection
          articles={tabData.articles}
          plans={tabData.plans}
        />
      </div>

    </div>
  )
}

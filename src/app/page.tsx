import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import { fetchUnsplashPhoto, fetchUnsplashPhotos } from '@/lib/unsplash'
import type { UnsplashPhoto } from '@/lib/unsplash'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Eye, MapPin } from 'lucide-react'
import HeroSearch from '@/components/home/HeroSearch'
import CountryTabSection from '@/components/home/CountryTabSection'
import AdUnit from '@/components/ui/AdUnit'

export const dynamic = 'force-dynamic'

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
  couple: '💑 커플', family: '👨‍👩‍👧‍👦 가족', friends: '👫 친구', solo: '🧳 혼자',
}

// SectionTitle component (inline in this file)
function SectionTitle({ title, subtitle, viewAllHref }: { title: string; subtitle?: string; viewAllHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div className="flex items-start gap-3">
        <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: '#FF5722' }} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-medium hover:underline transition-colors" style={{ color: '#FF5722' }}>
          전체 보기 <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

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
      supabase.from('articles').select('id, slug, title, meta_description, city, country, category, cover_image_url').eq('published', true).order('created_at', { ascending: false }).limit(60),
      supabase.from('travel_plans').select('id, slug, city, country, days, travel_type, title, meta_description').eq('published', true).order('views_count', { ascending: false }).limit(40),
    ])
    return { articles: articles ?? [], plans: plans ?? [] }
  } catch { return { articles: [], plans: [] } }
}

async function getTopAttractions() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('places')
      .select('id, name, rating, article_id')
      .eq('category', 'attraction')
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(10)
    return data ?? []
  } catch { return [] }
}

export default async function HomePage() {
  const [articles, travelPlans, countryCounts, tabData, topAttractions, heroPhoto, countryPhotoList] = await Promise.all([
    getArticles(6),
    getTravelPlans(6),
    getCountryCounts(),
    getTabData(),
    getTopAttractions(),
    fetchUnsplashPhoto('luxury travel destination landscape adventure'),
    Promise.all(COUNTRIES.map(c => fetchUnsplashPhotos(c.query, 1).then(r => r[0] ?? null))),
  ])

  const countryPhotos = countryPhotoList as (UnsplashPhoto | null)[]

  return (
    <div className="min-h-screen bg-white">

      {/* ── 1. 히어로 ───────────────────────────────────────────── */}
      <section className="relative h-[580px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt="여행" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            어디로 떠나고 싶으세요?
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 font-light">
            엄선된 여행 가이드로 완벽한 여행을 계획하세요
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ── 2. 인기 여행지 ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="인기 여행지" subtitle="지금 가장 많이 찾는 여행지" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COUNTRIES.map((country, i) => {
            const photo = countryPhotos[i]
            const count = countryCounts[country.dbName] ?? 0
            return (
              <Link
                key={country.name}
                href={`/destinations/${encodeURIComponent(country.dbName)}`}
                className="group relative rounded-2xl overflow-hidden block card-hover"
                style={{ height: '240px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500">
                  {photo && (
                    <Image src={photo.url} alt={country.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-bold text-base">{country.name}</span>
                  </div>
                  {count > 0 && <p className="text-xs text-white/70">여행 일정 {count}개</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── 3. Trending ─────────────────────────────────────────── */}
      {travelPlans.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#FFF8F6' }}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle title="지금 뜨는 여행지" subtitle="가장 많이 조회된 여행 일정" viewAllHref="/destinations" />
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {travelPlans.map((plan: any) => (
                  <Link
                    key={plan.id}
                    href={`/destinations/${encodeURIComponent(plan.country)}/${encodeURIComponent(plan.city)}/${plan.slug}`}
                    className="group shrink-0 w-52 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                      {plan.cover_image_url && (
                        <Image src={plan.cover_image_url} alt={plan.city} fill sizes="208px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs text-white font-semibold bg-[#FF5722] px-2.5 py-1 rounded-full">
                          {plan.days}일
                        </span>
                      </div>
                      {plan.views_count > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
                          <Eye className="w-2.5 h-2.5" />{plan.views_count.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-gray-400 mb-1">{plan.city}, {plan.country}</p>
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-[#FF5722] transition-colors leading-snug">
                        {plan.title}
                      </h3>
                      {plan.travel_type && (
                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF3F0', color: '#FF5722' }}>
                          {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. 최신 여행 가이드 ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="최신 여행 가이드" subtitle="전문가가 엄선한 여행 정보" viewAllHref="/articles" />
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
      </section>

      {/* ── AdUnit ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4">
        <AdUnit slot="8261047593" />
      </div>

      {/* ── 5. 인기 여행 일정 ───────────────────────────────────── */}
      {travelPlans.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#F8F8F8' }}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle title="인기 여행 일정" subtitle="여행자들이 가장 많이 찾는 일정" viewAllHref="/destinations" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {travelPlans.map((plan: any) => (
                <Link
                  key={plan.id}
                  href={`/destinations/${encodeURIComponent(plan.country)}/${encodeURIComponent(plan.city)}/${plan.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
                    {plan.cover_image_url && (
                      <Image src={plan.cover_image_url} alt={plan.city} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {plan.travel_type && (
                        <span className="text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}
                        </span>
                      )}
                      <span className="text-xs text-white font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FF5722' }}>
                        {plan.days}일
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1.5">{plan.city}, {plan.country}</p>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#FF5722] transition-colors leading-snug">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.days}일 일정</span>
                      {plan.views_count > 0 && (
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{plan.views_count.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Top Attractions ──────────────────────────────────── */}
      {topAttractions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionTitle title="인기 관광 명소" subtitle="여행자들이 추천하는 관광 명소 TOP 10" />
          <div className="flex flex-wrap gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {topAttractions.map((place: any, i: number) => (
              <Link
                key={place.id}
                href="/articles"
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full border transition-all duration-200 hover:border-[#FF5722] hover:text-[#FF5722]"
                style={{ borderColor: '#E5E7EB', backgroundColor: 'white' }}
              >
                <span className="text-sm font-bold" style={{ color: '#FF5722' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 group-hover:text-[#FF5722]">
                  <MapPin className="w-3.5 h-3.5" />
                  {place.name}
                </span>
                {place.rating && (
                  <span className="text-xs text-gray-400">★ {place.rating.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. 나라별 여행 모아보기 ────────────────────────────── */}
      <div style={{ backgroundColor: '#F8F8F8', borderTop: '1px solid #F0F0F0' }}>
        <CountryTabSection articles={tabData.articles} plans={tabData.plans} />
      </div>

    </div>
  )
}

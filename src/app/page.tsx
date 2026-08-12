import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import { fetchUnsplashPhoto, fetchUnsplashPhotos, triggerUnsplashDownload } from '@/lib/unsplash'
import type { UnsplashPhoto } from '@/lib/unsplash'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Eye, MapPin } from 'lucide-react'
import HeroSearch from '@/components/home/HeroSearch'
import CountryTabSection from '@/components/home/CountryTabSection'
import AdUnit from '@/components/ui/AdUnit'
import { toPlanUrl, toCountryUrl } from '@/lib/location'
import type { Metadata } from 'next'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '해외여행 가이드 & 여행 일정 추천 | Kiravoy',
  description: '도쿄, 파리, 발리, 방콕 등 전 세계 여행지 가이드와 맞춤 여행 일정. 커플, 가족, 친구, 혼자 여행까지 Kiravoy에서 완벽한 여행을 계획하세요.',
  keywords: ['해외여행', '여행가이드', '여행일정', '도쿄여행', '파리여행', '발리여행', '방콕여행', '해외여행코스', '여행추천'],
  alternates: {
    canonical: 'https://kiravoy.com',
    languages: {
      ko: 'https://kiravoy.com',
      en: 'https://kiravoy.com/en',
      'x-default': 'https://kiravoy.com',
    },
  },
  openGraph: {
    title: '해외여행 가이드 & 여행 일정 추천 | Kiravoy',
    description: '전 세계 여행지 가이드와 맞춤 여행 일정',
    url: 'https://kiravoy.com',
    siteName: 'Kiravoy',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: 'https://kiravoy.com/og-image.jpg', width: 1200, height: 630, alt: 'Kiravoy 해외여행 가이드' }],
  },
}

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
  couple: '커플', family: '가족', friends: '친구', solo: '혼자',
}

// SectionTitle component (inline in this file)
function SectionTitle({ title, subtitle, viewAllHref }: { title: string; subtitle?: string; viewAllHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-10 border-b border-[var(--border)] pb-6">
      <div>
        {subtitle && <p className="eyebrow mb-2">{subtitle}</p>}
        <h2 className="editorial-heading text-2xl md:text-[28px]">{title}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="link-underline flex items-center gap-1.5 text-[13px] tracking-wide text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors shrink-0">
          전체 보기 <ArrowRight className="w-3.5 h-3.5" />
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
      .eq('language', 'ko')
      .not('slug', 'in', `(${Array.from(NOINDEX_ARTICLE_SLUGS).join(',')})`)
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
      .eq('language', 'ko')
      .order('views_count', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getCountryCounts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('travel_plans').select('country').eq('published', true).eq('language', 'ko')
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
      supabase.from('articles').select('id, slug, title, meta_description, city, country, category, cover_image_url').eq('published', true).eq('language', 'ko').not('slug', 'in', `(${Array.from(NOINDEX_ARTICLE_SLUGS).join(',')})`).order('created_at', { ascending: false }).limit(60),
      supabase.from('travel_plans').select('id, slug, city, country, days, travel_type, title, meta_description').eq('published', true).eq('language', 'ko').order('views_count', { ascending: false }).limit(40),
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
    Promise.all(COUNTRIES.map(c => fetchUnsplashPhotos(c.query, 1).then(r => {
      const photo = r[0] ?? null
      if (photo?.downloadLocation) triggerUnsplashDownload(photo.downloadLocation).catch(() => {})
      return photo
    }))),
  ])

  const countryPhotos = countryPhotoList as (UnsplashPhoto | null)[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kiravoy',
    url: 'https://kiravoy.com',
    description: '전 세계 여행지 가이드와 맞춤 여행 일정',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kiravoy.com/destinations?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 1. 히어로 ───────────────────────────────────────────── */}
      <section className="relative h-[64vh] min-h-[420px] max-h-[640px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt="여행" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[var(--ink)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        </div>
        <div className="relative z-10 px-6 md:px-12 pb-12 md:pb-16 w-full max-w-[var(--measure-wide)] mx-auto">
          <p className="eyebrow text-white/70 mb-3">Kiravoy Travel Guide</p>
          <h1
            className="text-white mb-6 leading-[1.1] max-w-2xl"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
          >
            빛나는 여행의 시작
          </h1>
          <HeroSearch />
        </div>
      </section>

      {/* ── 2. 인기 여행지 ──────────────────────────────────────── */}
      <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
        <SectionTitle title="인기 여행지" subtitle="지금 가장 많이 찾는 여행지" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {COUNTRIES.map((country, i) => {
            const photo = countryPhotos[i]
            const count = countryCounts[country.dbName] ?? 0
            return (
              <Link
                key={country.name}
                href={toCountryUrl(country.dbName)}
                className="group img-zoom relative block bg-[var(--bg-secondary)]"
                style={{ height: '260px' }}
              >
                {photo && (
                  <Image src={photo.url} alt={country.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <span className="text-[15px] tracking-wide">{country.name}</span>
                  {count > 0 && <p className="text-xs text-white/70 mt-1">여행 일정 {count}개</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── 2-b. 인기 도시 바로가기 ─────────────────────────────── */}
      <section className="max-w-[var(--measure-wide)] mx-auto px-6 pb-16">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {[
            { name: '도쿄', href: '/destinations/japan/tokyo' },
            { name: '오사카', href: '/destinations/japan/osaka' },
            { name: '교토', href: '/destinations/japan/kyoto' },
            { name: '파리', href: '/destinations/france/paris' },
            { name: '발리', href: '/destinations/indonesia/bali' },
            { name: '방콕', href: '/destinations/thailand/bangkok' },
            { name: '다낭', href: '/destinations/vietnam/da-nang' },
            { name: '싱가포르', href: '/destinations/singapore/singapore' },
            { name: '세부', href: '/destinations/philippines/cebu' },
            { name: '타이베이', href: '/destinations/taiwan/taipei' },
            { name: '런던', href: '/destinations/uk/london' },
            { name: '이스탄불', href: '/destinations/turkey/istanbul' },
          ].map(city => (
            <Link
              key={city.name}
              href={city.href}
              className="link-underline text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Trending ─────────────────────────────────────────── */}
      {travelPlans.length > 0 && (
        <section className="py-24 border-t border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-[var(--measure-wide)] mx-auto px-6">
            <SectionTitle title="지금 뜨는 여행지" subtitle="가장 많이 조회된 여행 일정" viewAllHref="/destinations" />
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {travelPlans.map((plan: any) => (
                  <Link
                    key={plan.id}
                    href={toPlanUrl(plan)}
                    className="group shrink-0 w-56"
                  >
                    <div className="img-zoom relative h-44 bg-[var(--bg)] overflow-hidden">
                      {plan.cover_image_url && (
                        <Image src={plan.cover_image_url} alt={plan.city} fill sizes="224px" className="object-cover" />
                      )}
                      {plan.views_count > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[10px] px-2 py-0.5">
                          <Eye className="w-2.5 h-2.5" />{plan.views_count.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="pt-3">
                      <p className="eyebrow mb-1.5">{plan.city}, {plan.country} · {plan.days}일</p>
                      <h3
                        className="text-[15px] text-[color:var(--ink)] line-clamp-2 group-hover:opacity-70 transition-opacity leading-snug"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                      >
                        {plan.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. 최신 여행 가이드 ─────────────────────────────────── */}
      <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
        <SectionTitle title="최신 여행 가이드" subtitle="전문가가 엄선한 여행 정보" viewAllHref="/articles" />
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[color:var(--ink-faint)] py-12">아직 게시된 가이드가 없습니다.</p>
        )}
      </section>

      {/* ── AdUnit ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6">
        <AdUnit slot="6933794765" />
      </div>

      {/* ── 5. 인기 여행 일정 ───────────────────────────────────── */}
      {travelPlans.length > 0 && (
        <section className="py-24 border-t border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-[var(--measure-wide)] mx-auto px-6">
            <SectionTitle title="인기 여행 일정" subtitle="여행자들이 가장 많이 찾는 일정" viewAllHref="/destinations" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {travelPlans.map((plan: any) => (
                <Link
                  key={plan.id}
                  href={toPlanUrl(plan)}
                  className="group block"
                >
                  <div className="img-zoom relative h-52 bg-[var(--bg)] overflow-hidden">
                    {plan.cover_image_url && (
                      <Image src={plan.cover_image_url} alt={plan.city} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                    )}
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="eyebrow">{plan.city}, {plan.country}</p>
                      {plan.travel_type && (
                        <span className="text-xs text-[color:var(--primary)]">
                          {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-[color:var(--ink)] mb-2 line-clamp-2 leading-snug text-lg group-hover:opacity-70 transition-opacity"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                    >
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[color:var(--ink-faint)]">
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
        <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
          <SectionTitle title="인기 관광 명소" subtitle="여행자들이 추천하는 관광 명소 TOP 10" />
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {topAttractions.map((place: any, i: number) => (
              <Link
                key={place.id}
                href="/articles"
                className="group flex items-center gap-2.5 text-sm"
              >
                <span className="text-[color:var(--ink-faint)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="link-underline flex items-center gap-1.5 text-[color:var(--ink)]">
                  <MapPin className="w-3.5 h-3.5 text-[color:var(--ink-faint)]" />
                  {place.name}
                </span>
                {place.rating && (
                  <span className="text-xs text-[color:var(--ink-faint)]">★ {place.rating.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. 나라별 여행 모아보기 ────────────────────────────── */}
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <CountryTabSection articles={tabData.articles} plans={tabData.plans} />
      </div>

    </div>
  )
}

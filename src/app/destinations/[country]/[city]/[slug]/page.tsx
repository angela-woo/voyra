import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import { MapPin, Clock, Thermometer, Info, Landmark, UtensilsCrossed, Coffee, Hotel, Map, Coins } from 'lucide-react'
import type { Metadata } from 'next'
import { generatePlanMetaDescription } from '@/lib/utils/metaGenerator'
import { buildOgImageUrl } from '@/lib/seo'
import { NOINDEX_PLAN_SLUGS } from '@/lib/seo/noindex-plans'
import AdUnit from '@/components/ui/AdUnit'
import ShareButtons from '@/components/ui/ShareButtons'
import Breadcrumb from '@/components/ui/Breadcrumb'
import RelatedContent from '@/components/article/RelatedContent'
import TagBasedInternalLinks from '@/components/InternalLinks'
import { Suspense } from 'react'
import DestinationSchema from '@/components/schema/DestinationSchema'
import BreadcrumbSchema from '@/components/schema/BreadcrumbSchema'
import { toPlanUrl } from '@/lib/location'
import { getCityCoordinates } from '@/lib/utils/cityCoordinates'

export const revalidate = 3600


interface PageProps {
  params: Promise<{ country: string; city: string; slug: string }>
}

interface DayPlace {
  time?: string
  name: string
  category: 'attraction' | 'restaurant' | 'cafe' | 'hotel'
  duration?: string
  cost?: string
  description?: string
  google_maps_url?: string
  klook_url?: string
  alternatives?: string[]
}

interface DayData {
  day: number
  title: string
  places: DayPlace[]
}

interface DaysDataObject {
  days: DayData[]
  prices_verified_at?: string
}

interface TravelPlan {
  id: string
  slug: string
  city: string
  country: string
  country_code: string | null
  days: number
  travel_type: string
  theme: string | null
  title: string
  meta_description: string | null
  overview: {
    weather?: string
    currency?: string
    transport?: string
    tips?: string[]
    best_season?: string
  } | null
  days_data: DayData[] | DaysDataObject | null
  cover_image_url: string | null
  views_count: number
  created_at: string
}

function extractDays(daysData: TravelPlan['days_data']): DayData[] {
  if (!daysData) return []
  if (Array.isArray(daysData)) return daysData
  return daysData.days ?? []
}

function extractPricesVerifiedAt(daysData: TravelPlan['days_data']): string | null {
  if (!daysData || Array.isArray(daysData)) return null
  return daysData.prices_verified_at ?? null
}

function isPriceStale(verifiedAt: string | null): boolean {
  if (!verifiedAt) return true
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return new Date(verifiedAt) < sixMonthsAgo
}

const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  attraction: Landmark,
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  hotel: Hotel,
}

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  couple: '커플',
  family: '가족',
  friends: '친구',
  solo: '혼자',
}

async function getPlan(slug: string): Promise<TravelPlan | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

async function getRelated(city: string, currentSlug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('id, slug, title, days, travel_type')
    .eq('city', city)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(3)
  return data ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const plan = await getPlan(slug)
  if (!plan) notFound()
  const planUrl = toPlanUrl(plan)

  const description = (plan.meta_description && plan.meta_description.length >= 50)
    ? plan.meta_description
    : generatePlanMetaDescription(
        { city: plan.city, country: plan.country, days: plan.days, travel_type: plan.travel_type, slug: plan.slug, days_data: plan.days_data },
        'ko',
      )

  const ogImage = buildOgImageUrl({
    title: plan.title,
    description: description.slice(0, 100),
    type: 'destination',
    fallbackImageUrl: plan.cover_image_url,
  })

  const keywords = [
    plan.city,
    plan.country,
    '여행일정',
    '여행코스',
    plan.city && plan.days ? `${plan.city}${plan.days}일` : null,
    plan.city ? `${plan.city}여행` : null,
    plan.city && plan.days ? `${plan.city}${plan.days}일코스` : null,
  ].filter(Boolean) as string[]

  return {
    title: `${plan.title} | Kiravoy`,
    description,
    keywords,
    ...(NOINDEX_PLAN_SLUGS.has(plan.slug) && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: `https://kiravoy.com${planUrl}`,
      languages: {
        ko: `https://kiravoy.com${planUrl}`,
        en: `https://kiravoy.com/en${planUrl}`,
        'x-default': `https://kiravoy.com${planUrl}`,
      },
    },
    openGraph: {
      title: `${plan.title} | Kiravoy`,
      description,
      url: `https://kiravoy.com${planUrl}`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: plan.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${plan.title} | Kiravoy`,
      description,
      images: [ogImage],
    },
    other: { 'pinterest-rich-pin': 'true' },
  }
}

export default async function TravelPlanPage({ params }: PageProps) {
  const { country, city, slug } = await params
  const decodedCountry = decodeURIComponent(country)
  const decodedCity = decodeURIComponent(city)

  const plan = await getPlan(slug)
  if (!plan) notFound()

  const related = await getRelated(plan.city, slug)

  // 조회수 증가 (fire-and-forget)
  adminSupabase
    .from('travel_plans')
    .update({ views_count: (plan.views_count ?? 0) + 1 })
    .eq('id', plan.id)
    .then(() => {})

  const cityEn = toEnglishCity(plan.city)

  const heroImage = plan.cover_image_url
    ? plan.cover_image_url
    : await fetchUnsplashPhoto(`${cityEn} travel`).then(p => p?.url ?? null)

  const planFullUrl = `https://kiravoy.com${toPlanUrl(plan)}`
  const planCoords = getCityCoordinates(plan.city)

  return (
    <div className="min-h-screen">
      <DestinationSchema
        name={plan.city}
        description={plan.meta_description}
        image={plan.cover_image_url}
        url={planFullUrl}
        touristType={plan.travel_type}
        geo={planCoords ? { latitude: planCoords.lat, longitude: planCoords.lng } : null}
      />
      <BreadcrumbSchema
        items={[
          { name: '홈', url: 'https://kiravoy.com' },
          { name: '여행 일정', url: 'https://kiravoy.com/destinations' },
          { name: plan.country, url: `https://kiravoy.com/destinations/${country}` },
          { name: plan.city, url: `https://kiravoy.com/destinations/${country}/${city}` },
          { name: plan.title, url: planFullUrl },
        ]}
      />

      {/* Hero */}
      <div className={`relative w-full h-[46vh] min-h-[320px] md:h-[56vh] md:min-h-[400px] ${heroImage ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--ink)]'}`}>
        {heroImage && (
          <Image src={heroImage} alt={plan.city} fill className="object-cover object-center" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12 px-6">
          <div className="max-w-[var(--measure)] mx-auto">
            <p className="eyebrow text-white/75 mb-3">
              {decodedCountry} · {decodedCity} · {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type} · {plan.days}일
            </p>
            <h1
              className="text-white leading-[1.15] max-w-2xl"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
            >
              {plan.title}
            </h1>
          </div>
        </div>
      </div>

      <Breadcrumb
        includeJsonLd={false}
        items={[
          { label: '홈', href: '/' },
          { label: '여행 일정', href: '/destinations' },
          { label: plan.country, href: `/destinations/${country}` },
          { label: plan.city, href: `/destinations/${country}/${city}` },
          { label: plan.title },
        ]}
      />

      <div className="max-w-[1360px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,var(--measure))_300px] gap-12 xl:gap-16 justify-center">
          {/* Main content */}
          <div className="w-full mx-auto max-w-[var(--measure)] xl:max-w-none space-y-12">

            {/* Overview */}
            {plan.overview && (
              <section className="pb-10 border-b border-[var(--border)]">
                <h2 className="editorial-heading text-xl mb-6">여행 개요</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {plan.overview.weather && (
                    <div className="flex gap-3">
                      <Thermometer className="w-4 h-4 text-[color:var(--ink-faint)] shrink-0 mt-0.5" />
                      <div>
                        <p className="eyebrow mb-1">날씨</p>
                        <p className="text-sm text-[color:var(--ink-soft)]">{plan.overview.weather}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.transport && (
                    <div className="flex gap-3">
                      <MapPin className="w-4 h-4 text-[color:var(--ink-faint)] shrink-0 mt-0.5" />
                      <div>
                        <p className="eyebrow mb-1">교통수단</p>
                        <p className="text-sm text-[color:var(--ink-soft)]">{plan.overview.transport}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.best_season && (
                    <div className="flex gap-3">
                      <Clock className="w-4 h-4 text-[color:var(--ink-faint)] shrink-0 mt-0.5" />
                      <div>
                        <p className="eyebrow mb-1">최적 여행 시기</p>
                        <p className="text-sm text-[color:var(--ink-soft)]">{plan.overview.best_season}</p>
                      </div>
                    </div>
                  )}
                </div>
                {plan.overview.tips && plan.overview.tips.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-[var(--border)]">
                    <div className="flex gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-[color:var(--ink-faint)] shrink-0 mt-0.5" />
                      <p className="eyebrow">주의사항</p>
                    </div>
                    <ul className="space-y-1">
                      {plan.overview.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-[color:var(--ink-soft)] flex gap-2">
                          <span className="text-[color:var(--ink-faint)]">·</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <AdUnit slot="1936618959" />

            {/* Day-by-day itinerary */}
            {extractDays(plan.days_data).length > 0 && (
              <section>
                <h2 className="editorial-heading text-xl mb-6">일별 일정</h2>
                {isPriceStale(extractPricesVerifiedAt(plan.days_data)) && (
                  <div className="flex items-start gap-2 border border-[var(--border)] px-4 py-3 mb-6 text-xs text-[color:var(--ink-soft)]">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[color:var(--ink-faint)]" />
                    <span>가격은 변동될 수 있으니 방문 전 공식 사이트 확인을 권장합니다.</span>
                  </div>
                )}
                <div className="space-y-12">
                  {extractDays(plan.days_data).map((day) => (
                    <div key={day.day}>
                      {day.day === 2 && <AdUnit slot="6933794765" />}

                      {/* Day header */}
                      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-[var(--border)]">
                        <span
                          className="text-3xl leading-none text-[color:var(--ink)]"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                        >
                          {String(day.day).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="eyebrow mb-1">Day {day.day}</p>
                          <h3 className="text-lg leading-tight text-[color:var(--ink)]" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{day.title}</h3>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        {day.places.map((place, pi) => (
                          <div key={pi} className="border border-[var(--border)] p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon + time */}
                              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                                {(() => {
                                  const Icon = CATEGORY_ICONS[place.category] ?? MapPin
                                  return <Icon className="w-4 h-4 text-[color:var(--ink-faint)]" />
                                })()}
                                {place.time && (
                                  <span className="text-[11px] font-mono text-[color:var(--ink-faint)]">{place.time}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-base mb-1.5 text-[color:var(--ink)]" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{place.name}</h4>

                                {place.description && (
                                  <p className="text-sm text-[color:var(--ink-soft)] mb-3 leading-relaxed">{place.description}</p>
                                )}

                                {/* Duration + cost */}
                                {(place.duration || place.cost) && (
                                  <div className="flex flex-wrap gap-3 mb-3 text-xs text-[color:var(--ink-faint)]">
                                    {place.duration && (
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{place.duration}
                                      </span>
                                    )}
                                    {place.cost && (
                                      <span className="inline-flex items-center gap-1">
                                        <Coins className="w-3 h-3" />{place.cost}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {place.alternatives && place.alternatives.length > 0 && (
                                  <div className="mb-3">
                                    <p className="eyebrow mb-1.5">대안 선택지</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ink-soft)]">
                                      {place.alternatives.map((alt, ai) => (
                                        <span key={ai}>{alt}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {place.google_maps_url && (
                                  <a
                                    href={place.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-underline inline-flex items-center gap-1.5 text-sm text-[color:var(--ink-soft)]"
                                  >
                                    <Map className="w-3.5 h-3.5" />구글맵
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <AdUnit slot="9176814723" />

            <Suspense fallback={null}>
              <TagBasedInternalLinks
                currentSlug={plan.slug}
                tags={[plan.travel_type, plan.city].filter(Boolean)}
                type="plan"
              />
            </Suspense>

            <ShareButtons
              url={planFullUrl}
              title={plan.title}
              description={plan.meta_description}
              locale="ko"
            />

            {/* Related plans */}
            {related.length > 0 && (
              <section className="pt-10 border-t border-[var(--border)]">
                <h2 className="editorial-heading text-xl mb-6">관련 일정 추천</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      href={toPlanUrl({ country: plan.country, city: plan.city, slug: r.slug })}
                      className="group block border-t border-[var(--border)] pt-4"
                    >
                      <p className="eyebrow mb-1.5 text-[color:var(--primary)]">
                        {TRAVEL_TYPE_LABELS[r.travel_type] ?? r.travel_type} · {r.days}일
                      </p>
                      <h3 className="text-[15px] line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{r.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <WeatherWidget
              city={plan.city}
              lat={getCityCoordinates(plan.city)?.lat ?? null}
              lng={getCityCoordinates(plan.city)?.lng ?? null}
            />

            <div className="border border-[var(--border)] p-4">
              <h3 className="eyebrow mb-3">일정 요약</h3>
              <div className="space-y-2 text-sm text-[color:var(--ink-soft)]">
                <div className="flex justify-between">
                  <span className="text-[color:var(--ink-faint)]">도시</span>
                  <span>{plan.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--ink-faint)]">기간</span>
                  <span>{plan.days}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--ink-faint)]">여행 스타일</span>
                  <span>{TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <RelatedContent
        city={plan.city}
        country={plan.country}
        currentSlug={plan.slug}
        language="ko"
        showPlans={false}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchUnsplashPhoto, fetchUnsplashPhotos, toEnglishCity } from '@/lib/unsplash'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import { MapPin, Clock, DollarSign, Thermometer, Info, ExternalLink, ChevronRight, Landmark, UtensilsCrossed, Coffee, Hotel, Map, Ticket, Plane, Building2, Coins } from 'lucide-react'
import type { Metadata } from 'next'
import AdUnit from '@/components/ui/AdUnit'
import { toPlanUrl } from '@/lib/location'
import { getCityCoordinates } from '@/lib/utils/cityCoordinates'

export const dynamic = 'force-dynamic'

const KLOOK_AFF_ID = '121117'
const AWIN_AID = '2892557'


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
  days_data: DayData[] | null
  cover_image_url: string | null
  views_count: number
  created_at: string
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
  if (!plan) return { title: 'Not Found' }
  const planUrl = toPlanUrl(plan)
  const keywords = [
    plan.city,
    plan.country,
    '여행일정',
    '여행코스',
    plan.city && plan.days ? `${plan.city}${plan.days}일` : null,
  ].filter(Boolean) as string[]
  return {
    title: `${plan.title} | Kiravoy`,
    description: plan.meta_description ?? undefined,
    keywords,
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
      description: plan.meta_description ?? undefined,
      url: `https://kiravoy.com${planUrl}`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
      images: plan.cover_image_url
        ? [{ url: plan.cover_image_url, width: 1200, height: 630, alt: plan.title }]
        : [{ url: 'https://kiravoy.com/og-image.jpg', width: 1200, height: 630 }],
    },
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

  const [heroImage, hotelImages, tourImages] = await Promise.all([
    plan.cover_image_url
      ? Promise.resolve(plan.cover_image_url)
      : fetchUnsplashPhoto(`${cityEn} travel`).then(p => p?.url ?? null),
    fetchUnsplashPhotos(`${cityEn} hotel`, 4),
    fetchUnsplashPhotos(`${cityEn} tour activity`, 4),
  ])

  const planFullUrl = `https://kiravoy.com${toPlanUrl(plan)}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: plan.city,
      description: plan.meta_description,
      touristType: plan.travel_type,
      url: planFullUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kiravoy.com' },
        { '@type': 'ListItem', position: 2, name: '여행 일정', item: 'https://kiravoy.com/destinations' },
        { '@type': 'ListItem', position: 3, name: plan.city, item: planFullUrl },
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-gradient-to-br from-blue-700 to-indigo-800 overflow-hidden">
        {heroImage && (
          <Image src={heroImage} alt={plan.city} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/destinations" className="text-white/70 text-sm hover:text-white">여행 일정</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <Link href={`/destinations/${country}`} className="text-white/70 text-sm hover:text-white">{decodedCountry}</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <Link href={`/destinations/${country}/${city}`} className="text-white/70 text-sm hover:text-white">{decodedCity}</Link>
          </div>
          <span className="inline-block bg-[var(--primary)] text-white text-xs px-3 py-1 rounded-full mb-3">
            {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type} · {plan.days}일
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {plan.title}
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Overview */}
            {plan.overview && (
              <section className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>여행 개요</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plan.overview.weather && (
                    <div className="flex gap-3">
                      <Thermometer className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">날씨</p>
                        <p className="text-sm text-gray-700">{plan.overview.weather}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.currency && (
                    <div className="flex gap-3">
                      <DollarSign className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">화폐 / 환율</p>
                        <p className="text-sm text-gray-700">{plan.overview.currency}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.transport && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">교통수단</p>
                        <p className="text-sm text-gray-700">{plan.overview.transport}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.best_season && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">최적 여행 시기</p>
                        <p className="text-sm text-gray-700">{plan.overview.best_season}</p>
                      </div>
                    </div>
                  )}
                </div>
                {plan.overview.tips && plan.overview.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2 mb-2">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-gray-500">주의사항</p>
                    </div>
                    <ul className="space-y-1">
                      {plan.overview.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-amber-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Booking.com Hotel Carousel */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>인기 숙소</h2>
                <a
                  href={`https://www.booking.com/searchresults.html?aid=${AWIN_AID}&ss=${encodeURIComponent(cityEn)}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  더보기 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-4 pb-3" style={{ width: 'max-content' }}>
                  {[
                    { name: `${plan.city} 인기 호텔`, tag: '가성비' },
                    { name: `${plan.city} 럭셔리 호텔`, tag: '럭셔리' },
                    { name: `${plan.city} 게스트하우스`, tag: '배낭여행' },
                    { name: `${plan.city} 부티크 호텔`, tag: '감성' },
                  ].map((hotel, i) => (
                    <a
                      key={i}
                      href={`https://www.booking.com/searchresults.html?aid=${AWIN_AID}&ss=${encodeURIComponent(cityEn)}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="w-48 shrink-0 bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="h-28 relative bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                        {hotelImages[i] ? (
                          <Image src={hotelImages[i].url} alt={hotel.name} fill className="object-cover" sizes="192px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-blue-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1 line-clamp-2">{hotel.name}</p>
                        <span className="inline-block bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded mb-2">{hotel.tag}</span>
                        <div
                          className="w-full text-center text-[10px] py-1.5 rounded text-white font-medium"
                          style={{ backgroundColor: '#003580' }}
                        >
                          Booking.com 예약
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <AdUnit slot="3920184756" />

            {/* Day-by-day itinerary */}
            {plan.days_data && plan.days_data.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>일별 일정</h2>
                <div className="space-y-8">
                  {plan.days_data.map((day) => (
                    <div key={day.day}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {day.day}
                        </span>
                        <h3 className="font-bold text-lg">{day.title}</h3>
                      </div>

                      <div className="space-y-3 ml-4 border-l-2 border-gray-100 pl-6">
                        {day.places.map((place, pi) => (
                          <div key={pi} className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                {(() => { const Icon = CATEGORY_ICONS[place.category] ?? MapPin; return <Icon className="w-5 h-5 text-gray-400" /> })()}
                                {place.time && (
                                  <span className="text-[10px] text-gray-400 font-mono">{place.time}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-0.5">{place.name}</h4>
                                {place.description && (
                                  <p className="text-xs text-gray-500 mb-2">{place.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-400">
                                  {place.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />{place.duration}
                                    </span>
                                  )}
                                  {place.cost && (
                                    <span className="flex items-center gap-1">
                                      <Coins className="w-3 h-3" />{place.cost}
                                    </span>
                                  )}
                                </div>

                                {place.alternatives && place.alternatives.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-[10px] text-gray-400 mb-1">대안 선택지</p>
                                    <div className="flex flex-wrap gap-1">
                                      {place.alternatives.map((alt, ai) => (
                                        <span key={ai} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                                          {alt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                  {place.google_maps_url && (
                                    <a
                                      href={place.google_maps_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 border border-gray-200 rounded hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                                    >
                                      <Map className="w-3 h-3" />구글맵
                                    </a>
                                  )}
                                  {place.category === 'attraction' && (
                                    <a
                                      href={place.klook_url ?? `https://www.klook.com/search/?query=${encodeURIComponent(place.name)}&aff_id=${KLOOK_AFF_ID}`}
                                      target="_blank"
                                      rel="noopener noreferrer sponsored"
                                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded text-white font-medium"
                                      style={{ backgroundColor: '#FF5722' }}
                                    >
                                      <Ticket className="w-3 h-3" />Klook 예약
                                    </a>
                                  )}
                                </div>
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

            {/* Klook Tour Carousel */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>인기 투어 & 액티비티</h2>
                <a
                  href={`https://www.klook.com/search/?query=${encodeURIComponent(cityEn + ' tour')}&aff_id=${KLOOK_AFF_ID}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  더보기 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-4 pb-3" style={{ width: 'max-content' }}>
                  {[
                    { name: `${plan.city} 대표 투어`, tag: '베스트' },
                    { name: `${plan.city} 야경 투어`, tag: '야경' },
                    { name: `${plan.city} 음식 투어`, tag: '미식' },
                    { name: `${plan.city} 문화 체험`, tag: '문화' },
                  ].map((tour, i) => (
                    <a
                      key={i}
                      href={`https://www.klook.com/search/?query=${encodeURIComponent(cityEn + ' tour')}&aff_id=${KLOOK_AFF_ID}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="w-48 shrink-0 bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="h-28 relative bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                        {tourImages[i] ? (
                          <Image src={tourImages[i].url} alt={tour.name} fill className="object-cover" sizes="192px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-orange-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1 line-clamp-2">{tour.name}</p>
                        <span className="inline-block bg-orange-50 text-orange-600 text-[10px] px-1.5 py-0.5 rounded mb-2">{tour.tag}</span>
                        <div
                          className="w-full text-center text-[10px] py-1.5 rounded text-white font-medium"
                          style={{ backgroundColor: '#FF5722' }}
                        >
                          Klook에서 예약
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <AdUnit slot="6174829350" />

            {/* Flight search */}
            <section className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-[var(--radius)] p-6 border border-sky-100">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><Plane className="w-5 h-5 text-sky-500" />항공권 검색</h2>
              <p className="text-sm text-gray-600 mb-4">Skyscanner에서 최저가 항공권을 찾아보세요.</p>
              <a
                href={`https://www.skyscanner.co.kr/flights/sel/${(plan.country_code ?? 'TYO').toLowerCase()}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-[var(--radius)] hover:opacity-90 transition-opacity"
              >
                Skyscanner에서 검색 <ExternalLink className="w-4 h-4" />
              </a>
            </section>

            {/* Related plans */}
            {related.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>관련 일정 추천</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      href={toPlanUrl({ country: plan.country, city: plan.city, slug: r.slug })}
                      className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-4 hover:border-[var(--primary)] hover:shadow-md transition-all"
                    >
                      <p className="text-xs text-[var(--primary)] mb-1">
                        {TRAVEL_TYPE_LABELS[r.travel_type] ?? r.travel_type} · {r.days}일
                      </p>
                      <h3 className="font-semibold text-sm line-clamp-2">{r.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WeatherWidget
              city={plan.city}
              lat={getCityCoordinates(plan.city)?.lat ?? null}
              lng={getCityCoordinates(plan.city)?.lng ?? null}
            />

            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-sm mb-3">일정 요약</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">도시</span>
                  <span className="font-medium">{plan.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">기간</span>
                  <span className="font-medium">{plan.days}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">여행 스타일</span>
                  <span className="font-medium">{TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}</span>
                </div>
              </div>
            </div>

            <a
              href={`https://www.booking.com/searchresults.html?aid=${AWIN_AID}&ss=${encodeURIComponent(cityEn)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#003580' }}
            >
              <Building2 className="w-4 h-4" />숙소 예약하기
            </a>

            <a
              href={`https://www.klook.com/search/?query=${encodeURIComponent(cityEn + ' tour')}&aff_id=${KLOOK_AFF_ID}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FF5722' }}
            >
              <Ticket className="w-4 h-4" />투어 예약하기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

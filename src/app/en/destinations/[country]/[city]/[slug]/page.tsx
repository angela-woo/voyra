import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'
import { toPlanUrl } from '@/lib/location'
import { getCityCoordinates } from '@/lib/utils/cityCoordinates'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import { MapPin, Clock, Thermometer, Info, ExternalLink, ChevronRight, Landmark, UtensilsCrossed, Coffee, Hotel, Map, Ticket, Building2, Coins } from 'lucide-react'
import type { Metadata } from 'next'
import { generatePlanMetaDescription, getOgImageUrl } from '@/lib/utils/metaGenerator'
import { NOINDEX_PLAN_SLUGS } from '@/lib/seo/noindex-plans'
import AdUnit from '@/components/ui/AdUnit'
import ESimBanner from '@/components/widgets/ESimBanner'
import ShareButtons from '@/components/ui/ShareButtons'
import Breadcrumb from '@/components/ui/Breadcrumb'
import RelatedContent from '@/components/article/RelatedContent'
import FlightSearchWidget from '@/components/widgets/FlightSearchWidget'
import { getKlookUrl } from '@/lib/utils/klookUrl'
import { getBookingUrl } from '@/lib/utils/bookingUrl'

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
  couple: 'Couple',
  family: 'Family',
  friends: 'Friends',
  solo: 'Solo',
}

async function getPlan(slug: string) {
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
  const koPlanUrl = toPlanUrl(plan)
  const enPlanUrl = `/en${koPlanUrl}`

  const description = (plan.meta_description && plan.meta_description.length >= 50)
    ? plan.meta_description
    : generatePlanMetaDescription(
        { city: plan.city, country: plan.country, days: plan.days, travel_type: plan.travel_type, slug: plan.slug, days_data: plan.days_data },
        'en',
      )

  const ogImage = getOgImageUrl(plan.cover_image_url)

  const keywords = [
    plan.city,
    plan.country,
    'travel itinerary',
    'trip plan',
    plan.city ? `${plan.city} travel` : null,
    plan.city ? `${plan.city} itinerary` : null,
    plan.city && plan.days ? `${plan.days} days in ${plan.city}` : null,
  ].filter(Boolean) as string[]

  return {
    title: `${plan.title} | Kiravoy`,
    description,
    keywords,
    ...(NOINDEX_PLAN_SLUGS.has(plan.slug) && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: `https://kiravoy.com${enPlanUrl}`,
      languages: {
        ko: `https://kiravoy.com${koPlanUrl}`,
        en: `https://kiravoy.com${enPlanUrl}`,
        'x-default': `https://kiravoy.com${koPlanUrl}`,
      },
    },
    openGraph: {
      title: `${plan.title} | Kiravoy`,
      description,
      url: `https://kiravoy.com${enPlanUrl}`,
      siteName: 'Kiravoy',
      locale: 'en_US',
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

export default async function EnTravelPlanPage({ params }: PageProps) {
  const { country, city, slug } = await params
  const decodedCountry = decodeURIComponent(country)
  const decodedCity = decodeURIComponent(city)

  const [plan, related] = await Promise.all([
    getPlan(slug),
    getRelated(decodedCity, slug),
  ])

  if (!plan) notFound()

  adminSupabase
    .from('travel_plans')
    .update({ views_count: (plan.views_count ?? 0) + 1 })
    .eq('id', plan.id)
    .then(() => {})

  const cityEn = toEnglishCity(plan.city)

  const heroImage = plan.cover_image_url
    ? plan.cover_image_url
    : await fetchUnsplashPhoto(`${cityEn} travel`).then(p => p?.url ?? null)

  const rawDaysData = plan.days_data
  const days_data: DayData[] = Array.isArray(rawDaysData)
    ? rawDaysData
    : (rawDaysData as { days?: DayData[] } | null)?.days ?? []
  const pricesVerifiedAt: string | null = (!rawDaysData || Array.isArray(rawDaysData))
    ? null
    : (rawDaysData as { prices_verified_at?: string }).prices_verified_at ?? null
  const isPriceStale = !pricesVerifiedAt || (() => {
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return new Date(pricesVerifiedAt) < sixMonthsAgo
  })()

  const koPlanUrl = toPlanUrl(plan)
  const enPlanFullUrl = `https://kiravoy.com/en${koPlanUrl}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: plan.city,
      description: plan.meta_description,
      touristType: plan.travel_type,
      url: enPlanFullUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kiravoy.com/en' },
        { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://kiravoy.com/en/destinations' },
        { '@type': 'ListItem', position: 3, name: plan.city, item: enPlanFullUrl },
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
            <Link href="/en/destinations" className="text-white/70 text-sm hover:text-white">Itineraries</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <Link href={`/destinations/${country}`} className="text-white/70 text-sm hover:text-white">{decodedCountry}</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <Link href={`/destinations/${country}/${city}`} className="text-white/70 text-sm hover:text-white">{decodedCity}</Link>
          </div>
          <span className="inline-block bg-[var(--primary)] text-white text-xs px-3 py-1 rounded-full mb-3">
            {TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type} · {plan.days} days
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {plan.title}
          </h1>
        </div>
      </section>

      <Breadcrumb
        includeJsonLd={false}
        items={[
          { label: 'Home', href: '/en' },
          { label: 'Itineraries', href: '/en/destinations' },
          { label: plan.country, href: `/destinations/${country}` },
          { label: plan.city, href: `/destinations/${country}/${city}` },
          { label: plan.title },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">

            {/* Overview */}
            {plan.overview && (
              <section className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Trip Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plan.overview.weather && (
                    <div className="flex gap-3">
                      <Thermometer className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Weather</p>
                        <p className="text-sm text-gray-700">{plan.overview.weather}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.transport && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Getting Around</p>
                        <p className="text-sm text-gray-700">{plan.overview.transport}</p>
                      </div>
                    </div>
                  )}
                  {plan.overview.best_season && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Best Time to Visit</p>
                        <p className="text-sm text-gray-700">{plan.overview.best_season}</p>
                      </div>
                    </div>
                  )}
                </div>
                {plan.overview.tips && plan.overview.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2 mb-2">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-gray-500">Travel Tips</p>
                    </div>
                    <ul className="space-y-1">
                      {plan.overview.tips.map((tip: string, i: number) => (
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

            <AdUnit slot="1936618959" />

            {/* Booking.com CTA */}
            <a
              href={getBookingUrl(cityEn, 'en')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between gap-3 bg-[#003580] text-white rounded-[var(--radius)] px-5 py-4 hover:opacity-90 transition-opacity"
            >
              <div>
                <p className="font-semibold text-sm">Compare Hotels in {cityEn}</p>
                <p className="text-xs text-white/70 mt-0.5">Find the best rates on Booking.com</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium bg-white/20 px-3 py-1.5 rounded">
                <Building2 className="w-3.5 h-3.5" />Book
              </div>
            </a>

            {/* Day-by-day */}
            {days_data.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Day-by-Day Itinerary</h2>
                {isPriceStale && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-xs text-amber-800">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>Prices may vary. We recommend checking the official website before your visit.</span>
                  </div>
                )}
                <div className="space-y-10">
                  {days_data.map((day) => (
                    <div key={day.day}>
                      {day.day === 2 && <AdUnit slot="6933794765" />}

                      {/* Day header */}
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-10 rounded-full text-white text-base font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: '#FF5722' }}>
                          {day.day}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF5722' }}>Day {day.day}</p>
                          <h3 className="font-bold text-xl leading-tight text-gray-900">{day.title}</h3>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        {day.places.map((place, pi) => (
                          <div key={pi} className="relative bg-white rounded-[var(--radius)] shadow-sm p-4" style={{ border: '1px solid #FF5722' }}>

                            <div className="flex items-start gap-3">
                              {/* Icon + time */}
                              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                                {(() => {
                                  const Icon = CATEGORY_ICONS[place.category] ?? MapPin
                                  return <Icon className="w-5 h-5" style={{ color: '#FF5722' }} />
                                })()}
                                {place.time && (
                                  <span className="text-[11px] font-mono font-semibold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{place.time}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base mb-1.5 text-gray-900">{place.name}</h4>

                                {place.description && (
                                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{place.description}</p>
                                )}

                                {/* Badges: duration + cost */}
                                {(place.duration || place.cost) && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {place.duration && (
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        <Clock className="w-3 h-3" />{place.duration}
                                      </span>
                                    )}
                                    {place.cost && (
                                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#fff0ec', color: '#c0390a' }}>
                                        <Coins className="w-3 h-3" />{place.cost}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {place.alternatives && place.alternatives.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Alternatives</p>
                                    <div className="flex flex-wrap gap-1">
                                      {place.alternatives.map((alt, ai) => (
                                        <span key={ai} className="text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                                          {alt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {place.google_maps_url && (
                                  <a
                                    href={place.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full text-white font-medium"
                                    style={{ backgroundColor: '#4285F4' }}
                                  >
                                    <Map className="w-4 h-4" />Google Maps
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

            {/* Klook CTA */}
            <a
              href={getKlookUrl(cityEn + ' tour', 'en')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between gap-3 bg-[#FF5722] text-white rounded-[var(--radius)] px-5 py-4 hover:opacity-90 transition-opacity"
            >
              <div>
                <p className="font-semibold text-sm">{cityEn} Tours &amp; Tickets</p>
                <p className="text-xs text-white/70 mt-0.5">Book local experiences on Klook</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium bg-white/20 px-3 py-1.5 rounded">
                <Ticket className="w-3.5 h-3.5" />Book
              </div>
            </a>

            <AdUnit slot="9176814723" />

            <ShareButtons
              url={enPlanFullUrl}
              title={plan.title}
              description={plan.meta_description}
              locale="en"
            />
            <ESimBanner locale="en" city={plan.city} />
            <FlightSearchWidget city={plan.city} cityEn={cityEn} locale="en" />

            {/* Related */}
            {related.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Related Itineraries</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      href={`/en/destinations/${country}/${city}/${r.slug}`}
                      className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-4 hover:border-[var(--primary)] hover:shadow-md transition-all"
                    >
                      <p className="text-xs text-[var(--primary)] mb-1">
                        {TRAVEL_TYPE_LABELS[r.travel_type] ?? r.travel_type} · {r.days} days
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
              <h3 className="font-bold text-sm mb-3">Trip Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">City</span>
                  <span className="font-medium">{plan.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium">{plan.days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Travel Style</span>
                  <span className="font-medium">{TRAVEL_TYPE_LABELS[plan.travel_type] ?? plan.travel_type}</span>
                </div>
              </div>
            </div>

            <a
              href={getBookingUrl(cityEn, 'en')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#003580' }}
            >
              <Building2 className="w-4 h-4" />Book Accommodation
            </a>

            <a
              href={getKlookUrl(cityEn + ' tour', 'en')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FF5722' }}
            >
              <Ticket className="w-4 h-4" />Book Tours
            </a>
          </div>
        </div>
      </div>
      <RelatedContent
        city={plan.city}
        country={plan.country}
        currentSlug={plan.slug}
        language="en"
        showPlans={false}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import { fetchUnsplashPhoto, fetchUnsplashPhotos, triggerUnsplashDownload } from '@/lib/unsplash'
import type { UnsplashPhoto } from '@/lib/unsplash'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Eye, MapPin } from 'lucide-react'
import AdUnit from '@/components/ui/AdUnit'
import type { Metadata } from 'next'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Travel Guides & Itineraries for Every Destination | Kiravoy',
  description: 'Discover travel guides and custom itineraries for Tokyo, Paris, Bali, Bangkok and more. Plan your perfect trip with Kiravoy.',
  keywords: ['travel guide', 'travel itinerary', 'tokyo travel', 'paris travel', 'bali travel', 'travel tips', 'trip planner'],
  alternates: {
    canonical: 'https://kiravoy.com/en',
    languages: {
      ko: 'https://kiravoy.com',
      en: 'https://kiravoy.com/en',
      'x-default': 'https://kiravoy.com',
    },
  },
  openGraph: {
    title: 'Travel Guides & Itineraries for Every Destination | Kiravoy',
    description: 'Discover travel guides and custom itineraries for top destinations worldwide.',
    url: 'https://kiravoy.com/en',
    siteName: 'Kiravoy',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://kiravoy.com/og-image.jpg', width: 1200, height: 630, alt: 'Kiravoy Travel Guides' }],
  },
}

const COUNTRIES = [
  { name: 'Japan', flag: '🇯🇵', query: 'Japan Mount Fuji travel', dbName: 'Japan' },
  { name: 'France', flag: '🇫🇷', query: 'Paris France Eiffel Tower', dbName: 'France' },
  { name: 'Thailand', flag: '🇹🇭', query: 'Bangkok Thailand golden temple', dbName: 'Thailand' },
  { name: 'Indonesia', flag: '🇮🇩', query: 'Bali Indonesia rice terraces', dbName: 'Indonesia' },
  { name: 'Singapore', flag: '🇸🇬', query: 'Singapore Marina Bay Sands skyline', dbName: 'Singapore' },
  { name: 'UK', flag: '🇬🇧', query: 'London UK Big Ben bridge', dbName: 'UK' },
  { name: 'Spain', flag: '🇪🇸', query: 'Barcelona Spain Sagrada Familia', dbName: 'Spain' },
  { name: 'Italy', flag: '🇮🇹', query: 'Rome Italy Colosseum travel', dbName: 'Italy' },
]

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  couple: 'Couple', family: 'Family', friends: 'Friends', solo: 'Solo',
}

function SectionTitle({ title, subtitle, viewAllHref }: { title: string; subtitle?: string; viewAllHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-10 border-b border-[var(--border)] pb-6">
      <div>
        {subtitle && <p className="eyebrow mb-2">{subtitle}</p>}
        <h2 className="editorial-heading text-2xl md:text-[28px]">{title}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="link-underline flex items-center gap-1.5 text-[13px] tracking-wide text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors shrink-0">
          See All <ArrowRight className="w-3.5 h-3.5" />
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
      .eq('language', 'en')
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
      .select('id, slug, city, country, country_en, city_en, days, travel_type, title, meta_description, views_count, cover_image_url')
      .eq('published', true)
      .eq('language', 'en')
      .order('views_count', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch { return [] }
}

async function getCountryCounts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('travel_plans').select('country').eq('published', true).eq('language', 'en')
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      if (row.country) counts[row.country] = (counts[row.country] ?? 0) + 1
    }
    return counts
  } catch { return {} as Record<string, number> }
}

export default async function EnHomePage() {
  const [articles, travelPlans, countryCounts, heroPhoto, countryPhotoList] = await Promise.all([
    getArticles(6),
    getTravelPlans(6),
    getCountryCounts(),
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
    description: 'Travel guides and custom itineraries for destinations worldwide',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kiravoy.com/en/destinations?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-[64vh] min-h-[420px] max-h-[640px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt="Travel" fill priority sizes="100vw" className="object-cover" />
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
            Travel Guides &amp; Itineraries for Every Destination
          </h1>
          <p className="text-white/70 text-base max-w-lg">
            Discover curated travel guides for every destination
          </p>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
        <SectionTitle title="Popular Destinations" subtitle="Most visited destinations right now" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {COUNTRIES.map((country, i) => {
            const photo = countryPhotos[i]
            const count = countryCounts[country.dbName] ?? 0
            return (
              <Link
                key={country.name}
                href={`/en/destinations/${country.dbName.toLowerCase()}`}
                className="group img-zoom relative block bg-[var(--bg-secondary)]"
                style={{ height: '260px' }}
              >
                {photo && (
                  <Image src={photo.url} alt={country.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <span className="text-[15px] tracking-wide">{country.name}</span>
                  {count > 0 && <p className="text-xs text-white/70 mt-1">{count} itineraries</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trending */}
      {travelPlans.length > 0 && (
        <section className="py-24 border-t border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-[var(--measure-wide)] mx-auto px-6">
            <SectionTitle title="Trending Now" subtitle="Most viewed travel itineraries" viewAllHref="/en/destinations" />
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {travelPlans.map((plan: any) => (
                  <Link
                    key={plan.id}
                    href={`/en/destinations/${plan.country_en ?? plan.country.toLowerCase()}/${plan.city_en ?? plan.city.toLowerCase().replace(/\s+/g, '-')}/${plan.slug}`}
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
                      <p className="eyebrow mb-1.5">{plan.city}, {plan.country} · {plan.days}d</p>
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

      {/* Latest Travel Guides */}
      <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
        <SectionTitle title="Latest Travel Guides" subtitle="Expertly curated travel information" viewAllHref="/en/articles" />
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} locale="en" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[color:var(--ink-faint)] mb-4">English articles coming soon!</p>
            <Link href="/en/articles" className="link-underline text-sm text-[color:var(--primary)]">
              Browse Korean guides →
            </Link>
          </div>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <AdUnit slot="8261047593" />
      </div>

      {/* Popular Itineraries */}
      {travelPlans.length > 0 && (
        <section className="py-24 border-t border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-[var(--measure-wide)] mx-auto px-6">
            <SectionTitle title="Popular Itineraries" subtitle="Top-rated itineraries from travelers" viewAllHref="/en/destinations" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {travelPlans.map((plan: any) => (
                <Link
                  key={plan.id}
                  href={`/en/destinations/${plan.country_en ?? plan.country.toLowerCase()}/${plan.city_en ?? plan.city.toLowerCase().replace(/\s+/g, '-')}/${plan.slug}`}
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
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.days}-day itinerary</span>
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

    </div>
  )
}

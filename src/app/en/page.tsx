import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import { fetchUnsplashPhoto, fetchUnsplashPhotos } from '@/lib/unsplash'
import type { UnsplashPhoto } from '@/lib/unsplash'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Eye, MapPin } from 'lucide-react'
import AdUnit from '@/components/ui/AdUnit'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kiravoy - Your Shining Travel Guide',
  description: 'Discover curated travel guides, itineraries, and tips for destinations around the world.',
  alternates: {
    languages: { ko: 'https://kiravoy.com/', en: 'https://kiravoy.com/en/' },
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
  couple: '💑 Couple', family: '👨‍👩‍👧‍👦 Family', friends: '👫 Friends', solo: '🧳 Solo',
}

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
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: '#FF5722' }}>
          See All <ArrowRight className="w-4 h-4" />
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
    Promise.all(COUNTRIES.map(c => fetchUnsplashPhotos(c.query, 1).then(r => r[0] ?? null))),
  ])

  const countryPhotos = countryPhotoList as (UnsplashPhoto | null)[]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative h-[580px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt="Travel" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Where do you want to go?
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 font-light">
            Discover curated travel guides for every destination
          </p>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="Popular Destinations" subtitle="Most visited destinations right now" />
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
                  {count > 0 && <p className="text-xs text-white/70">{count} itineraries</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trending */}
      {travelPlans.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#FFF8F6' }}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle title="Trending Now" subtitle="Most viewed travel itineraries" viewAllHref="/destinations" />
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
                          {plan.days} days
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

      {/* Latest Travel Guides */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="Latest Travel Guides" subtitle="Expertly curated travel information" viewAllHref="/en/articles" />
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} locale="en" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">English articles coming soon!</p>
            <Link href="/articles" className="text-sm font-medium hover:underline" style={{ color: '#FF5722' }}>
              Browse Korean guides →
            </Link>
          </div>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-4">
        <AdUnit slot="8261047593" />
      </div>

      {/* Popular Itineraries */}
      {travelPlans.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#F8F8F8' }}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle title="Popular Itineraries" subtitle="Top-rated itineraries from travelers" viewAllHref="/destinations" />
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
                        {plan.days} days
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1.5">{plan.city}, {plan.country}</p>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#FF5722] transition-colors leading-snug">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
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

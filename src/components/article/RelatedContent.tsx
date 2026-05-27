import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { toPlanUrl } from '@/lib/location'

interface RelatedContentProps {
  city: string | null
  country: string | null
  currentSlug: string
  language: 'ko' | 'en'
  showPlans?: boolean
}

interface ArticleRow {
  slug: string
  title: string
  cover_image_url: string | null
  city: string | null
  country: string | null
}

interface PlanRow {
  slug: string
  title: string
  cover_image_url: string | null
  city: string
  country: string
  days: number
  travel_type: string
}

const TYPE_KO: Record<string, string> = { couple: '커플', family: '가족', friends: '친구', solo: '혼자' }
const TYPE_EN: Record<string, string> = { couple: 'Couple', family: 'Family', friends: 'Friends', solo: 'Solo' }

export default async function RelatedContent({
  city, country, currentSlug, language, showPlans = true,
}: RelatedContentProps) {
  const supabase = await createClient()
  const isKo = language === 'ko'

  const orFilter = city && country
    ? `city.eq.${city},country.eq.${country}`
    : country ? `country.eq.${country}` : null

  const [relArticlesResult, relPlansResult] = await Promise.all([
    orFilter
      ? supabase.from('articles')
          .select('slug, title, cover_image_url, city, country')
          .eq('published', true)
          .eq('language', language)
          .neq('slug', currentSlug)
          .or(orFilter)
          .order('created_at', { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    showPlans && city
      ? supabase.from('travel_plans')
          .select('slug, title, cover_image_url, city, country, days, travel_type')
          .eq('published', true)
          .eq('language', language)
          .eq('city', city)
          .neq('slug', currentSlug)
          .limit(3)
      : Promise.resolve({ data: [] }),
  ])

  const articles = (relArticlesResult.data ?? []) as ArticleRow[]
  const plans = (relPlansResult.data ?? []) as PlanRow[]

  if (articles.length === 0 && plans.length === 0) return null

  const typeLabels = isKo ? TYPE_KO : TYPE_EN
  const articlePath = isKo ? '/article' : '/en/article'
  const planPrefix = isKo ? '' : '/en'

  return (
    <div className="border-t border-gray-100 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">

        {articles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
              <h2 className="text-xl font-bold text-gray-900">
                {isKo ? '관련 여행 가이드' : 'Related Travel Guides'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(a => (
                <Link
                  key={a.slug}
                  href={`${articlePath}/${a.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {a.cover_image_url && (
                      <Image
                        src={a.cover_image_url}
                        alt={a.title}
                        fill
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {[a.city, a.country].filter(Boolean).join(', ')}
                    </p>
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-[#FF5722] transition-colors">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {plans.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
              <h2 className="text-xl font-bold text-gray-900">
                {isKo ? `${city} 여행 일정도 확인해보세요` : `${city} Itineraries`}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map(p => (
                <Link
                  key={p.slug}
                  href={`${planPrefix}${toPlanUrl(p)}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                    {p.cover_image_url && (
                      <Image
                        src={p.cover_image_url}
                        alt={p.city}
                        fill
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs text-white font-semibold bg-[#FF5722] px-2.5 py-1 rounded-full">
                        {p.days}{isKo ? '일' : 'd'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {typeLabels[p.travel_type] ?? p.travel_type}
                    </p>
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-[#FF5722] transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

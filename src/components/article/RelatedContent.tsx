import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { toPlanUrl } from '@/lib/location'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'
import TrackedLink from '@/components/analytics/TrackedLink'

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
          .not('slug', 'in', `(${Array.from(NOINDEX_ARTICLE_SLUGS).join(',')})`)
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
    <div className="border-t border-[var(--border)] mt-8">
      <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-20 space-y-16">

        {articles.length > 0 && (
          <section>
            <h2 className="editorial-heading text-xl mb-8">
              {isKo ? '관련 여행 가이드' : 'Related Travel Guides'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(a => (
                <TrackedLink
                  key={a.slug}
                  href={`${articlePath}/${a.slug}`}
                  className="group block"
                  eventName="related_content_click"
                  eventParams={{
                    source_content: currentSlug,
                    target_content: a.slug,
                    content_type: 'article',
                    destination: [a.city, a.country].filter(Boolean).join(', '),
                  }}
                >
                  <div className="img-zoom relative h-44 bg-[var(--bg-secondary)] overflow-hidden">
                    {a.cover_image_url && (
                      <Image
                        src={a.cover_image_url}
                        alt={a.title}
                        fill
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    <p className="eyebrow mb-1.5">
                      {[a.city, a.country].filter(Boolean).join(', ')}
                    </p>
                    <h3 className="text-[15px] text-[color:var(--ink)] line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {a.title}
                    </h3>
                  </div>
                </TrackedLink>
              ))}
            </div>
          </section>
        )}

        {plans.length > 0 && (
          <section>
            <h2 className="editorial-heading text-xl mb-8">
              {isKo ? `${city} 여행 일정도 확인해보세요` : `${city} Itineraries`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map(p => (
                <TrackedLink
                  key={p.slug}
                  href={`${planPrefix}${toPlanUrl(p)}`}
                  className="group block"
                  eventName="itinerary_start"
                  eventParams={{
                    source_content: currentSlug,
                    target_content: p.slug,
                    destination: [p.city, p.country].filter(Boolean).join(', '),
                    days: p.days,
                    travel_type: p.travel_type,
                  }}
                >
                  <div className="img-zoom relative h-44 bg-[var(--bg-secondary)] overflow-hidden">
                    {p.cover_image_url && (
                      <Image
                        src={p.cover_image_url}
                        alt={p.city}
                        fill
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    <p className="eyebrow mb-1.5">
                      {p.days}{isKo ? '일' : 'd'} · {typeLabels[p.travel_type] ?? p.travel_type}
                    </p>
                    <h3 className="text-[15px] text-[color:var(--ink)] line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {p.title}
                    </h3>
                  </div>
                </TrackedLink>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import Image from 'next/image'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'
import PlaceCard from '@/components/article/PlaceCard'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import BudgetCalculator from '@/components/widgets/BudgetCalculator'
import NewsletterSignup from '@/components/widgets/NewsletterSignup'
import { Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

async function getPlaces(articleId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('article_id', articleId)
  return data ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not Found' }
  return {
    title: `${article.title} – Voyra`,
    description: article.meta_description,
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const places = await getPlaces(article.id)
  const htmlContent = await marked(article.content ?? '')

  const timeAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: ko })
    : null

  const destination = [article.city, article.country].filter(Boolean).join(', ')
  const mainPlace = places.find((p: { lat: number | null; lng: number | null }) => p.lat && p.lng)

  // DB 컬럼 없으면 Unsplash에서 직접 fetch (Next.js 24h 캐시)
  const heroImageUrl = article.cover_image_url
    ?? (await fetchUnsplashPhoto(`${toEnglishCity(article.city ?? '')} travel`))?.url ?? null
  const heroAttribution = article.cover_image_attribution ?? null

  return (
    <div>
      {/* 히어로 이미지 */}
      {heroImageUrl && (
        <div className="relative w-full h-64 md:h-96 bg-gray-200">
          <Image
            src={heroImageUrl}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 max-w-6xl mx-auto">
            {destination && (
              <span className="inline-flex items-center gap-1 text-sm text-white/90 font-medium mb-2">
                <MapPin className="w-4 h-4" />
                {destination}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {article.title}
            </h1>
          </div>
          {heroAttribution && (
            <span className="absolute bottom-2 right-3 text-[10px] text-white/50">
              {heroAttribution}
            </span>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Main content */}
          <article>
            <div className="mb-8">
              {!heroImageUrl && destination && (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--primary)] font-medium mb-3">
                  <MapPin className="w-4 h-4" />
                  {destination}
                </span>
              )}
              {!heroImageUrl && (
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {article.title}
                </h1>
              )}
              {article.meta_description && (
                <p className="text-lg text-gray-500 mb-4">{article.meta_description}</p>
              )}
              {timeAgo && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  {timeAgo}
                </div>
              )}
              {article.category && (
                <span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {article.category}
                </span>
              )}
            </div>

          {/* Markdown content */}
          <div
            className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-[var(--primary)]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Places */}
          {places.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                추천 장소
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {places.map((place: { id: string }) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <PlaceCard key={place.id} place={place as any} city={article.city} />
                ))}
              </div>
            </div>
          )}
        </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {mainPlace && mainPlace.lat && mainPlace.lng && (
              <WeatherWidget
                lat={mainPlace.lat}
                lng={mainPlace.lng}
                city={article.city ?? '현지'}
              />
            )}
            <BudgetCalculator />
            <NewsletterSignup />
          </aside>
        </div>
      </div>
    </div>
  )
}

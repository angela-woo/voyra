import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'

interface Article {
  id: string
  slug: string
  title: string
  meta_description: string | null
  city: string | null
  country: string | null
  category: string | null
  created_at: string | null
  cover_image_url?: string | null
  cover_image_attribution?: string | null
}

export default async function ArticleCard({ article, locale = 'ko' }: { article: Article; locale?: 'ko' | 'en' }) {
  const timeAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: locale === 'en' ? enUS : ko })
    : null

  const destination = [article.city, article.country].filter(Boolean).join(', ')

  // DB에 저장된 URL 우선, 없으면 Unsplash에서 fetch (Next.js 24h 캐시)
  const imageUrl = article.cover_image_url
  const imageAttribution = article.cover_image_attribution
  let photo = imageUrl ? { url: imageUrl, authorName: imageAttribution ?? '', authorUrl: '' } : null
  if (!photo && article.city) {
    const fetched = await fetchUnsplashPhoto(`${toEnglishCity(article.city)} travel`)
    if (fetched) photo = fetched
  }

  const href = locale === 'en' ? `/en/article/${article.slug}` : `/article/${article.slug}`

  return (
    <div className="group relative">
      {/* Cover image */}
      <div className="h-56 bg-[var(--bg-secondary)] relative overflow-hidden">
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={`${article.city ?? ''} ${article.title} 여행 가이드`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {photo.url.includes('unsplash.com') && (
              <span className="absolute z-10 bottom-1.5 right-2 text-[10px] text-white/70">
                {photo.authorName ? (
                  <>Photo by{' '}
                    {photo.authorUrl
                      ? <a href={photo.authorUrl} target="_blank" rel="noopener noreferrer" className="underline">{photo.authorName}</a>
                      : photo.authorName
                    }{' '}on{' '}
                  </>
                ) : 'Photo on '}
                <a href="https://unsplash.com/?utm_source=kiravoy&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-[color:var(--ink-faint)]" />
          </div>
        )}
      </div>

      <div className="pt-4">
        {destination && <p className="eyebrow mb-2">{destination}</p>}
        <h3
          className="text-lg leading-snug mb-2 line-clamp-2 text-[color:var(--ink)] group-hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          {article.title}
        </h3>
        {article.meta_description && (
          <p className="text-sm text-[color:var(--ink-soft)] line-clamp-2 mb-3 leading-relaxed">{article.meta_description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-[color:var(--ink-faint)]">
          {timeAgo && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {timeAgo}
            </span>
          )}
          {article.category && <span>{article.category}</span>}
        </div>
      </div>

      {/* Stretched link — makes the whole card clickable without nesting an <a> inside the attribution link above */}
      <Link href={href} className="absolute inset-0" aria-label={article.title}>
        <span className="sr-only">{article.title}</span>
      </Link>
    </div>
  )
}

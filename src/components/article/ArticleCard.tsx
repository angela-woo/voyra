import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
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

export default async function ArticleCard({ article }: { article: Article }) {
  const timeAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: ko })
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

  return (
    <Link href={`/article/${article.slug}`} className="group block bg-white rounded-[var(--radius)] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {photo.authorName && (
              <span className="absolute bottom-1.5 right-2 text-[10px] text-white/60">
                Photo by {photo.authorName} on Unsplash
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-blue-300" />
          </div>
        )}
        {destination && (
          <span className="absolute top-3 left-3 bg-[var(--primary)] text-white text-xs px-2 py-1 rounded-full z-10">
            {destination}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
          {article.title}
        </h3>
        {article.meta_description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.meta_description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {timeAgo && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {timeAgo}
            </span>
          )}
          {article.category && (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {article.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

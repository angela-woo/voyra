import Image from 'next/image'
import { MapPin, Star, Map } from 'lucide-react'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'

const CATEGORY_QUERIES: Record<string, string> = {
  hotel: 'luxury hotel lobby room',
  restaurant: 'restaurant food dining',
  attraction: 'tourist landmark attraction',
  cafe: 'cafe coffee shop interior',
}

interface Place {
  id: string
  name: string
  address: string | null
  google_maps_url: string | null
  booking_url: string | null
  reservation_url: string | null
  klook_url: string | null
  rating: number | null
  category: string | null
  lat: number | null
  lng: number | null
  image_url?: string | null
  image_attribution?: string | null
}

export default async function PlaceCard({ place, city, locale = 'ko' }: { place: Place; city?: string | null; locale?: 'ko' | 'en' }) {
  const cat = place.category?.toLowerCase() ?? ''

  let imageUrl = place.image_url ?? null
  if (!imageUrl) {
    const cityEn = city ? toEnglishCity(city) : ''
    const catKeyword = CATEGORY_QUERIES[cat] ?? 'travel destination'
    const query = [place.name, cityEn, catKeyword].filter(Boolean).join(' ')
    const photo = await fetchUnsplashPhoto(query)
    imageUrl = photo?.url ?? null
  }

  return (
    <div className="border border-[var(--border)] overflow-hidden flex">
      {/* Image - left side */}
      <div className="img-zoom w-28 h-28 relative shrink-0 bg-[var(--bg-secondary)]">
        {imageUrl ? (
          <Image src={imageUrl} alt={`${place.name} ${place.category ?? ''}`.trim()} fill sizes="112px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[color:var(--ink-faint)]" />
          </div>
        )}
      </div>

      {/* Info - right side */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="text-sm text-[color:var(--ink)] leading-snug truncate" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{place.name}</h4>
            {place.rating && (
              <span className="flex items-center gap-0.5 text-amber-600 text-xs shrink-0">
                <Star className="w-3 h-3 fill-current" />
                {place.rating.toFixed(1)}
              </span>
            )}
          </div>
          {place.category && (
            <span className="eyebrow inline-block mb-1 text-[color:var(--ink-faint)]">
              {place.category}
            </span>
          )}
          {place.address && (
            <p className="text-[11px] text-[color:var(--ink-faint)] flex items-start gap-0.5 line-clamp-1">
              <MapPin className="w-2.5 h-2.5 shrink-0 mt-0.5" />
              {place.address}
            </p>
          )}
        </div>

        {place.google_maps_url && (
          <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
            <a
              href={place.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline flex items-center gap-1 text-[color:var(--ink-soft)]"
            >
              <Map className="w-3 h-3" />지도
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'
import { MapPin, Star, Map } from 'lucide-react'
import { fetchUnsplashPhotos, toEnglishCity } from '@/lib/unsplash'

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

/**
 * Resolves a unique image per place for a single article page in one batch.
 * Places already carrying a stored image_url are trusted as-is. For the rest,
 * candidates are fetched and the first one NOT already used elsewhere on this
 * page is picked — this is what prevents different places (especially ones
 * with sparse Unsplash coverage, e.g. small local night markets) from
 * collapsing onto the same single top search result. A place that truly has
 * no unique candidate left gets `null` (renders as a placeholder icon)
 * rather than reusing another place's photo.
 */
export async function resolvePlaceImages(
  places: Place[],
  city?: string | null,
): Promise<Record<string, string | null>> {
  const usedUrls = new Set<string>()
  const result: Record<string, string | null> = {}
  const cityEn = city ? toEnglishCity(city) : ''

  for (const place of places) {
    if (place.image_url) {
      result[place.id] = place.image_url
      usedUrls.add(place.image_url)
    }
  }

  await Promise.all(
    places.filter(p => !p.image_url).map(async place => {
      const cat = place.category?.toLowerCase() ?? ''
      const catKeyword = CATEGORY_QUERIES[cat] ?? 'travel destination'
      const query = [place.name, cityEn, catKeyword].filter(Boolean).join(' ')
      const photos = await fetchUnsplashPhotos(query, 5)
      const unique = photos.find(p => !usedUrls.has(p.url))
      if (unique) {
        usedUrls.add(unique.url)
        result[place.id] = unique.url
      } else {
        result[place.id] = null
      }
    }),
  )

  return result
}

export default function PlaceCard({ place, imageUrl }: { place: Place; imageUrl?: string | null }) {
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

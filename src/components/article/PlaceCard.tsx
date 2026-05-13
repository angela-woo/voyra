import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { fetchUnsplashPhoto, categoryFallbackQuery } from '@/lib/unsplash'

const AWIN_AID = '2892557'

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

function isHotel(category: string | null): boolean {
  return category?.toLowerCase() === 'hotel'
}

function isAttractionOrRestaurant(category: string | null): boolean {
  const c = category?.toLowerCase()
  return c === 'attraction' || c === 'restaurant' || c === 'cafe'
}

function buildBookingUrl(place: Place, city: string | null | undefined): string {
  if (place.booking_url) return place.booking_url
  const ss = encodeURIComponent(city || place.name)
  return `https://www.booking.com/searchresults.html?aid=${AWIN_AID}&ss=${ss}`
}

export default async function PlaceCard({ place, city }: { place: Place; city?: string | null }) {
  const hotel = isHotel(place.category)
  const attractionOrRestaurant = isAttractionOrRestaurant(place.category)

  // DB 이미지 우선, 없으면 장소명으로 fetch (Next.js 24h 캐시)
  let imageUrl = place.image_url ?? null
  let imageAttribution = place.image_attribution ?? null
  if (!imageUrl) {
    const query = place.name || categoryFallbackQuery(place.category)
    const photo = await fetchUnsplashPhoto(query)
    if (photo) {
      imageUrl = photo.url
      imageAttribution = `Photo by ${photo.authorName} on Unsplash`
    }
  }

  return (
    <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm overflow-hidden">
      {/* 장소 이미지 */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={place.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            {imageAttribution && (
              <span className="absolute bottom-1 right-1.5 text-[9px] text-white/60 bg-black/20 px-1 rounded">
                {imageAttribution}
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-semibold text-sm">{place.name}</h4>
            {place.category && <span className="text-xs text-gray-400">{place.category}</span>}
          </div>
          {place.rating && (
            <span className="flex items-center gap-1 text-amber-500 text-sm font-medium shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              {place.rating.toFixed(1)}
            </span>
          )}
        </div>
        {place.address && (
          <p className="text-xs text-gray-400 flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
            {place.address}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {place.google_maps_url && (
            <a
              href={place.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-[var(--radius)] border border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              🗺 구글맵에서 보기
            </a>
          )}
          {hotel && (
            <a
              href={buildBookingUrl(place, city)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-[var(--radius)] text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#003580' }}
            >
              🏨 Booking.com에서 예약
            </a>
          )}
          {attractionOrRestaurant && place.klook_url && (
            <a
              href={place.klook_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-[var(--radius)] text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF5722' }}
            >
              🎟 Klook에서 예약
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

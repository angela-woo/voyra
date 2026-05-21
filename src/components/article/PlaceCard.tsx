import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'

const AWIN_AID = '2892557'
const KLOOK_AFF_ID = '121117'

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

export default function PlaceCard({ place, city }: { place: Place; city?: string | null }) {
  const hotel = isHotel(place.category)
  const attractionOrRestaurant = isAttractionOrRestaurant(place.category)
  const imageUrl = place.image_url ?? null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex hover:shadow-md transition-shadow duration-200">
      {/* Image - left side */}
      <div className="w-28 h-28 relative shrink-0 bg-gradient-to-br from-orange-50 to-red-50">
        {imageUrl ? (
          <Image src={imageUrl} alt={place.name} fill sizes="112px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-orange-200" />
          </div>
        )}
      </div>

      {/* Info - right side */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 leading-snug truncate">{place.name}</h4>
            {place.rating && (
              <span className="flex items-center gap-0.5 text-amber-500 text-xs font-medium shrink-0">
                <Star className="w-3 h-3 fill-current" />
                {place.rating.toFixed(1)}
              </span>
            )}
          </div>
          {place.category && (
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mb-1" style={{ backgroundColor: '#FFF3F0', color: '#FF5722' }}>
              {place.category}
            </span>
          )}
          {place.address && (
            <p className="text-[11px] text-gray-400 flex items-start gap-0.5 line-clamp-1">
              <MapPin className="w-2.5 h-2.5 shrink-0 mt-0.5" />
              {place.address}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {place.google_maps_url && (
            <a
              href={place.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors text-gray-600"
            >
              🗺 지도
            </a>
          )}
          {hotel && (
            <a
              href={buildBookingUrl(place, city)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="text-[10px] px-2.5 py-1 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#003580' }}
            >
              🏨 Booking
            </a>
          )}
          {attractionOrRestaurant && (
            <a
              href={place.klook_url ?? `https://www.klook.com/search/?query=${encodeURIComponent(place.name)}&aff_id=${KLOOK_AFF_ID}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="text-[10px] px-2.5 py-1 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF5722' }}
            >
              🎯 Klook
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

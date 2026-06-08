import JsonLd from '@/components/JsonLd'

/**
 * 컬럼 매핑:
 *   name        ← travel_plans.city
 *   description ← travel_plans.meta_description
 *   image       ← travel_plans.cover_image_url
 *   url         ← toPlanUrl(plan) 결과
 *   touristType ← travel_plans.travel_type (couple/family/friends/solo)
 *   geo         ← getCityCoordinates(city) → { latitude, longitude }
 */
interface DestinationSchemaProps {
  name: string
  description: string | null | undefined
  image: string | null | undefined
  url: string
  touristType: string
  geo?: { latitude: number; longitude: number } | null
}

export default function DestinationSchema({
  name,
  description,
  image,
  url,
  touristType,
  geo,
}: DestinationSchemaProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description: description ?? undefined,
    image: image ?? undefined,
    url,
    touristType,
  }

  if (geo) {
    data['geo'] = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    }
  }

  return <JsonLd data={data} />
}

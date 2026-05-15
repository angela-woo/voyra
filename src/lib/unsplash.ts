const CITY_NAME_MAP: Record<string, string> = {
  // 동아시아
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 서울: 'Seoul',
  // 동남아시아
  발리: 'Bali', 싱가포르: 'Singapore', 방콕: 'Bangkok', 하노이: 'Hanoi',
  // 중국·홍콩
  홍콩: 'Hong Kong', 상하이: 'Shanghai', 베이징: 'Beijing',
  // 중동
  두바이: 'Dubai', 이스탄불: 'Istanbul',
  // 유럽
  런던: 'London', 파리: 'Paris', 로마: 'Rome', 암스테르담: 'Amsterdam',
  프라하: 'Prague', 비엔나: 'Vienna', 베를린: 'Berlin', 취리히: 'Zurich',
  코펜하겐: 'Copenhagen', 헬싱키: 'Helsinki', 바르셀로나: 'Barcelona',
  마드리드: 'Madrid', 리스본: 'Lisbon',
  // 오세아니아
  시드니: 'Sydney', 멜버른: 'Melbourne',
  // 북미
  뉴욕: 'New York', 로스앤젤레스: 'Los Angeles', 샌프란시스코: 'San Francisco',
}

export function toEnglishCity(city: string): string {
  return CITY_NAME_MAP[city] ?? city
}

export interface UnsplashPhoto {
  url: string
  authorName: string
  authorUrl: string
}

const CATEGORY_FALLBACK: Record<string, string> = {
  hotel: 'luxury hotel room',
  restaurant: 'restaurant food dining',
  attraction: 'landmark travel tourism',
  cafe: 'coffee cafe interior',
}

export async function fetchUnsplashPhotos(query: string, count: number): Promise<UnsplashPhoto[]> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 86400 },
      },
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((photo: { urls: { regular: string }; user: { name: string; links: { html: string } } }) => ({
      url: photo.urls.regular,
      authorName: photo.user.name,
      authorUrl: `${photo.user.links.html}?utm_source=voyra&utm_medium=referral`,
    }))
  } catch {
    return []
  }
}

export async function fetchUnsplashPhoto(query: string): Promise<UnsplashPhoto | null> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 86400 }, // 24시간 Next.js 캐시
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    const photo = data.results?.[0]
    if (!photo) return null
    return {
      url: photo.urls.regular,
      authorName: photo.user.name,
      authorUrl: `${photo.user.links.html}?utm_source=voyra&utm_medium=referral`,
    }
  } catch {
    return null
  }
}

export function categoryFallbackQuery(category: string | null): string {
  return CATEGORY_FALLBACK[category?.toLowerCase() ?? ''] ?? 'travel destination'
}

export function sectionToSearchQuery(heading: string, cityEnglish: string): string {
  const h = heading.toLowerCase()
  if (/attraction|landmark|sightseeing|명소|관광|볼거리|여행지/.test(h)) return `${cityEnglish} attractions`
  if (/food|restaurant|dining|맛집|음식|먹거리|레스토랑|맛/.test(h)) return `${cityEnglish} food`
  if (/transport|getting around|교통|이동|지하철/.test(h)) return `${cityEnglish} transportation`
  if (/shopping|market|쇼핑|시장/.test(h)) return `${cityEnglish} shopping`
  if (/tip|advice|guide|팁|여행 정보|주의사항/.test(h)) return `${cityEnglish} travel`
  if (/hotel|accommodation|숙박|호텔/.test(h)) return `${cityEnglish} hotel`
  if (/cafe|coffee|카페|커피/.test(h)) return `${cityEnglish} cafe`
  if (/nature|park|자연|공원|hiking/.test(h)) return `${cityEnglish} nature landscape`
  if (/night|nightlife|bar|밤|야경|클럽/.test(h)) return `${cityEnglish} nightlife`
  if (/culture|history|art|문화|역사|예술/.test(h)) return `${cityEnglish} culture`
  return `${cityEnglish} travel`
}

export async function fetchSectionImages(
  sections: { heading: string; query: string }[],
): Promise<Record<string, UnsplashPhoto | null>> {
  // 고유 쿼리만 병렬로 fetch (쿼리당 8장)
  const uniqueQueries = Array.from(new Set(sections.map(s => s.query)))
  const photosByQuery = Object.fromEntries(
    await Promise.all(
      uniqueQueries.map(async q => [q, await fetchUnsplashPhotos(q, 8)]),
    ),
  ) as Record<string, UnsplashPhoto[]>

  // 사용된 URL 추적하며 순서대로 할당 → 중복 방지
  const usedUrls = new Set<string>()
  const result: Record<string, UnsplashPhoto | null> = {}

  for (const { heading, query } of sections) {
    const photos = photosByQuery[query] ?? []
    const photo = photos.find(p => !usedUrls.has(p.url)) ?? null
    if (photo) usedUrls.add(photo.url)
    result[heading] = photo
  }

  return result
}

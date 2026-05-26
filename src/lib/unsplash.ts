const CITY_NAME_MAP: Record<string, string> = {
  // 동아시아 - 일본
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 서울: 'Seoul', 나라: 'Nara',
  나고야: 'Nagoya', 후쿠오카: 'Fukuoka', 삿포로: 'Sapporo', 오키나와: 'Okinawa',
  // 동남아시아
  발리: 'Bali', 싱가포르: 'Singapore', 방콕: 'Bangkok', 하노이: 'Hanoi',
  치앙마이: 'Chiang Mai', 푸켓: 'Phuket', 다낭: 'Da Nang', 호치민: 'Ho Chi Minh City',
  나트랑: 'Nha Trang', 코타키나발루: 'Kota Kinabalu', 쿠알라룸푸르: 'Kuala Lumpur',
  세부: 'Cebu', 보라카이: 'Boracay', 마닐라: 'Manila',
  괌: 'Guam', 사이판: 'Saipan',
  // 중국·홍콩·대만
  홍콩: 'Hong Kong', 상하이: 'Shanghai', 베이징: 'Beijing', 타이베이: 'Taipei',
  타이중: 'Taichung',
  // 중동
  두바이: 'Dubai', 이스탄불: 'Istanbul', 아부다비: 'Abu Dhabi',
  // 유럽
  런던: 'London', 파리: 'Paris', 로마: 'Rome', 암스테르담: 'Amsterdam',
  프라하: 'Prague', 비엔나: 'Vienna', 베를린: 'Berlin', 취리히: 'Zurich',
  코펜하겐: 'Copenhagen', 헬싱키: 'Helsinki', 바르셀로나: 'Barcelona',
  마드리드: 'Madrid', 리스본: 'Lisbon', 부다페스트: 'Budapest',
  뮌헨: 'Munich', 밀라노: 'Milan', 피렌체: 'Florence', 베네치아: 'Venice',
  더블린: 'Dublin', 에든버러: 'Edinburgh', 브뤼셀: 'Brussels',
  아테네: 'Athens', 스톡홀름: 'Stockholm', 오슬로: 'Oslo',
  바르샤바: 'Warsaw',
  // 오세아니아
  시드니: 'Sydney', 멜버른: 'Melbourne', 오클랜드: 'Auckland',
  // 북미
  뉴욕: 'New York', 로스앤젤레스: 'Los Angeles', 샌프란시스코: 'San Francisco',
  라스베이거스: 'Las Vegas', 시카고: 'Chicago', 밴쿠버: 'Vancouver', 토론토: 'Toronto',
  // 중남미
  멕시코시티: 'Mexico City', 칸쿤: 'Cancun', 리우데자네이루: 'Rio de Janeiro',
  // 남아시아
  뭄바이: 'Mumbai', 델리: 'New Delhi',
}

export function toEnglishCity(city: string): string {
  return CITY_NAME_MAP[city] ?? city
}

// slug에서 위치 키워드 추출 → "nagoya-japan-travel-guide" → "nagoya japan travel"
const SLUG_STOP_WORDS = new Set([
  'travel', 'guide', 'tips', 'ultimate', 'best', 'things', 'what', 'how',
  'for', 'korean', 'travelers', 'to', 'in', 'the', 'a', 'an', 'top',
  'complete', 'perfect', 'must', 'see', 'do', 'visit',
])
export function slugToSearchQuery(slug: string): string {
  const words = slug.split('-')
  const locationWords: string[] = []
  for (const word of words) {
    if (SLUG_STOP_WORDS.has(word)) break
    locationWords.push(word)
  }
  if (locationWords.length === 0) return slug.split('-').slice(0, 2).join(' ') + ' travel'
  return locationWords.join(' ') + ' travel'
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
      authorUrl: `${photo.user.links.html}?utm_source=kiravoy&utm_medium=referral`,
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
      authorUrl: `${photo.user.links.html}?utm_source=kiravoy&utm_medium=referral`,
    }
  } catch {
    return null
  }
}

export function categoryFallbackQuery(category: string | null): string {
  return CATEGORY_FALLBACK[category?.toLowerCase() ?? ''] ?? 'travel destination'
}

export function itemToSearchQuery(heading: string, cityEnglish: string): string {
  const city = cityEnglish || 'travel'
  const h = heading.toLowerCase()

  // Korean semantic patterns (same as sectionToSearchQuery)
  if (/visa|비자|입국|immigration|passport/.test(h)) return 'passport visa airport travel document'
  if (/weather|climate|날씨|기후|계절|여행 시기|best time/.test(h)) return `${city} travel season weather`
  if (/currency|money|exchange|화폐|환전|물가|cost/.test(h)) return `${city} local market currency`
  if (/safety|safe|안전/.test(h)) return `${city} travel safety`
  if (/beach|ocean|sea|해변|바다|해수욕/.test(h)) return `${city} beach ocean`
  if (/attraction|landmark|sightseeing|명소|관광|볼거리|여행지/.test(h)) return `${city} tourist landmark`
  if (/food|restaurant|dining|맛집|음식|먹거리|레스토랑/.test(h)) return `${city} food cuisine`
  if (/transport|getting around|교통|이동|지하철|버스/.test(h)) return `${city} transportation`
  if (/shopping|market|쇼핑|시장/.test(h)) return `${city} shopping market`
  if (/tip|advice|주의사항|여행 정보|준비/.test(h)) return `${city} travel guide`
  if (/hotel|accommodation|숙박|호텔|숙소/.test(h)) return `${city} hotel accommodation`
  if (/cafe|coffee|카페|커피/.test(h)) return `${city} cafe coffee`
  if (/nature|park|자연|공원|hiking|등산/.test(h)) return `${city} nature landscape`
  if (/night|nightlife|bar|밤|야경|클럽/.test(h)) return `${city} night city lights`
  if (/culture|history|art|temple|shrine|문화|역사|예술|사원|성당|사찰/.test(h)) return `${city} culture history`

  // 괄호 안 영어명 우선 사용: "센소지 사원 (Senso-ji Temple)" → "Senso-ji Temple Tokyo"
  const englishMatch = heading.match(/\(([A-Za-z][^)]*)\)/)
  if (englishMatch) return `${englishMatch[1].trim()} ${cityEnglish}`
  // 대시 이후 영어: "우붓 - Ubud" → "Ubud Tokyo"
  const dashMatch = heading.match(/-\s*([A-Za-z][A-Za-z\s]+)/)
  if (dashMatch) return `${dashMatch[1].trim()} ${cityEnglish}`
  // 이모지·특수문자 제거 후 남은 텍스트
  const cleaned = heading.replace(/[^\w\sㄱ-힣]/g, '').trim()
  return `${cleaned} ${cityEnglish}`.trim()
}

export async function fetchItemImages(
  items: { heading: string; query: string }[],
): Promise<Record<string, UnsplashPhoto[]>> {
  const results = await Promise.all(
    items.map(async ({ heading, query }) => [heading, await fetchUnsplashPhotos(query, 3)] as [string, UnsplashPhoto[]]),
  )
  return Object.fromEntries(results)
}

export function sectionToSearchQuery(heading: string, cityEnglish: string): string {
  const h = heading.toLowerCase()
  const city = cityEnglish || 'travel'

  // 비자/입국 — 도시명 없이 범용 키워드
  if (/visa|비자|입국|immigration|passport/.test(h)) return 'passport visa airport travel document'
  // 날씨/기후
  if (/weather|climate|날씨|기후|계절|여행 시기|best time/.test(h)) return `${city} travel season weather`
  // 화폐/환전/물가
  if (/currency|money|exchange|화폐|환전|물가|cost/.test(h)) return `${city} local market currency`
  // 안전
  if (/safety|safe|안전/.test(h)) return `${city} travel safety`
  // 해변/바다
  if (/beach|ocean|sea|해변|바다|해수욕/.test(h)) return `${city} beach ocean`
  // 관광/명소
  if (/attraction|landmark|sightseeing|명소|관광|볼거리|여행지/.test(h)) return `${city} tourist landmark`
  // 음식/맛집
  if (/food|restaurant|dining|맛집|음식|먹거리|레스토랑|맛/.test(h)) return `${city} food cuisine`
  // 교통
  if (/transport|getting around|교통|이동|지하철|버스/.test(h)) return `${city} transportation`
  // 쇼핑
  if (/shopping|market|쇼핑|시장/.test(h)) return `${city} shopping market`
  // 팁/가이드/주의사항
  if (/tip|advice|guide|팁|여행 정보|주의사항|준비/.test(h)) return `${city} travel guide`
  // 숙소/호텔
  if (/hotel|accommodation|숙박|호텔|숙소/.test(h)) return `${city} hotel accommodation`
  // 카페
  if (/cafe|coffee|카페|커피/.test(h)) return `${city} cafe coffee`
  // 자연/공원
  if (/nature|park|자연|공원|hiking|등산/.test(h)) return `${city} nature landscape`
  // 야경/밤
  if (/night|nightlife|bar|밤|야경|클럽/.test(h)) return `${city} night city lights`
  // 문화/역사/예술/사원
  if (/culture|history|art|temple|shrine|문화|역사|예술|사원|성당|사찰/.test(h)) return `${city} culture history`
  // 영문이 포함된 제목 — 도시 + 그대로 활용
  if (/[a-zA-Z]{3,}/.test(heading)) return `${city} ${heading}`
  // 기본값
  return `${city} travel`
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

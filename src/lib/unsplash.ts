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

export async function fetchUnsplashPhotos(query: string, count: number, page = 1): Promise<UnsplashPhoto[]> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.min(count, 30)}&page=${page}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 3600 },
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
        next: { revalidate: 3600 }, // 1시간 캐시 (rate limit 리셋 주기 맞춤)
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

  // 괄호 안 영어명 최우선: "센소지 사원 (Senso-ji Temple)" → "Senso-ji Temple Tokyo"
  const parenMatch = heading.match(/\(([A-Za-z][^)]*)\)/)
  if (parenMatch) return `${parenMatch[1].trim()} ${city}`
  // 대시 이후 영어: "우붓 - Ubud" → "Ubud Tokyo"
  const dashMatch = heading.match(/-\s*([A-Za-z][A-Za-z\s]{2,})/)
  if (dashMatch) return `${dashMatch[1].trim()} ${city}`

  // Korean semantic patterns
  if (/비자|입국|immigration|passport|무비자|visa/.test(h)) return 'passport visa airport travel'
  if (/날씨|기후|계절|여행 시기|weather|climate|best time/.test(h)) return `${city} weather season`
  if (/화폐|환전|물가|cost|budget|currency|money|exchange/.test(h)) return `${city} local market`
  if (/안전|safety|safe/.test(h)) return `${city} city street`
  if (/해변|바다|해수욕|서핑|beach|ocean|sea|surf/.test(h)) return `${city} beach ocean`
  if (/길거리 음식|street food/.test(h)) return `${city} street food`
  if (/맛집|레스토랑|restaurant|dining/.test(h)) return `${city} restaurant`
  if (/음식|먹거리|food|cuisine|요리/.test(h)) return `${city} food cuisine`
  if (/카페|커피|cafe|coffee/.test(h)) return `${city} cafe coffee`
  if (/공항|airport/.test(h)) return `${city} airport`
  if (/지하철|버스|metro|subway/.test(h)) return `${city} metro subway`
  if (/교통|이동|transport|getting around/.test(h)) return `${city} transportation`
  if (/리조트|resort/.test(h)) return `${city} resort pool`
  if (/호텔|숙박|숙소|hotel|accommodation/.test(h)) return `${city} hotel`
  if (/쇼핑|시장|shopping|market/.test(h)) return `${city} shopping market`
  if (/등산|하이킹|hiking|trail/.test(h)) return `${city} hiking nature`
  if (/자연|공원|park|nature|outdoor|산/.test(h)) return `${city} nature park`
  if (/야경|night view/.test(h)) return `${city} night skyline`
  if (/밤|nightlife|bar|클럽/.test(h)) return `${city} nightlife`
  if (/사원|사찰|절|temple|shrine|신사/.test(h)) return `${city} temple shrine`
  if (/성당|교회|cathedral|church/.test(h)) return `${city} cathedral`
  if (/박물관|museum/.test(h)) return `${city} museum`
  if (/역사|유적|historical|heritage/.test(h)) return `${city} historical architecture`
  if (/문화|culture|tradition|전통/.test(h)) return `${city} culture tradition`
  if (/예술|갤러리|art|gallery/.test(h)) return `${city} art gallery`
  if (/랜드마크|landmark|명소|관광|sightseeing/.test(h)) return `${city} landmark`
  if (/액티비티|체험|activity|experience|adventure/.test(h)) return `${city} adventure`
  if (/팁|tip|advice|guide|준비/.test(h)) return `${city} travel`

  // 영문 단어가 포함된 제목 → 직접 활용
  const englishPart = heading.match(/[A-Za-z][A-Za-z\s-]{2,}/g)?.find(w => w.trim().length > 3)
  if (englishPart) return `${englishPart.trim()} ${city}`

  // 이모지·특수문자 제거 후 핵심 단어 + 도시
  const cleaned = heading.replace(/[^\w\sㄱ-힣]/g, '').trim().slice(0, 20)
  return `${city} ${cleaned || 'scenic place'}`.trim()
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

  // 비자/입국
  if (/비자|입국|immigration|passport|무비자|visa/.test(h)) return 'passport visa airport international travel'
  // 날씨/계절
  if (/날씨|기후|우기|건기|계절|여행 시기|weather|climate|best time/.test(h)) return `${city} weather season sky`
  // 화폐/환전/물가
  if (/화폐|환전|물가|비용|cost|budget|currency|money|exchange/.test(h)) return `${city} local market economy`
  // 안전
  if (/안전|주의사항|safety|safe|emergency/.test(h)) return `${city} city street travel`
  // 해변/바다
  if (/해변|바다|해수욕|서핑|beach|ocean|sea|surf/.test(h)) return `${city} beach ocean waves`
  // 쇼핑/시장 — 음식보다 먼저 체크 (시장이 야시장/음식시장과 구분)
  if (/쇼핑|아울렛|outlet|shopping/.test(h)) return `${city} shopping mall street`
  if (/시장|야시장|night market|market/.test(h)) return `${city} street market bazaar`
  // 음식/맛집 — 세분화
  if (/길거리 음식|street food/.test(h)) return `${city} street food vendor`
  if (/맛집|레스토랑|restaurant|dining/.test(h)) return `${city} restaurant dining table`
  if (/음식|먹거리|food|cuisine|요리|local food/.test(h)) return `${city} food cuisine dish`
  if (/카페|커피|브런치|cafe|coffee|brunch/.test(h)) return `${city} cafe coffee interior`
  // 교통 — 세분화
  if (/공항|airport|출입국/.test(h)) return `${city} airport terminal aviation`
  if (/지하철|버스|metro|subway|public transit/.test(h)) return `${city} metro subway public transport`
  if (/교통|이동|transport|getting around/.test(h)) return `${city} transportation street`
  // 숙소/호텔 — 세분화
  if (/리조트|resort/.test(h)) return `${city} resort pool luxury`
  if (/호텔|숙박|숙소|hotel|accommodation/.test(h)) return `${city} hotel lobby room`
  // 자연/공원
  if (/등산|하이킹|hiking|trail/.test(h)) return `${city} hiking trail nature`
  if (/자연|공원|garden|park|outdoor|산/.test(h)) return `${city} nature park landscape`
  // 야경/밤문화
  if (/야경|night view|nightscape/.test(h)) return `${city} night skyline cityscape`
  if (/밤|나이트|nightlife|bar|클럽|pub/.test(h)) return `${city} nightlife entertainment`
  // 문화/역사 — 세분화
  if (/사원|사찰|절|temple|shrine|신사/.test(h)) return `${city} temple shrine sacred`
  if (/성당|교회|cathedral|church/.test(h)) return `${city} cathedral architecture`
  if (/박물관|museum/.test(h)) return `${city} museum exhibit`
  if (/역사|유적|historical|heritage|ancient/.test(h)) return `${city} historical heritage architecture`
  if (/문화|culture|tradition|전통/.test(h)) return `${city} culture tradition local`
  if (/예술|갤러리|art|gallery/.test(h)) return `${city} art gallery modern`
  // 관광/명소 — 세분화
  if (/랜드마크|landmark|iconic/.test(h)) return `${city} landmark iconic building`
  if (/관광지|tourist spot|tourist attraction/.test(h)) return `${city} tourist attraction sightseeing`
  if (/명소|famous|popular place/.test(h)) return `${city} famous place popular`
  if (/볼거리|must see|必見/.test(h)) return `${city} must see places scenic`
  if (/여행지|추천|destination|best place/.test(h)) return `${city} travel destination beautiful`
  if (/관광|sightseeing/.test(h)) return `${city} sightseeing city tour`
  // 액티비티/체험
  if (/액티비티|체험|activity|experience|adventure|스포츠/.test(h)) return `${city} adventure activity outdoor`
  // 일정/코스
  if (/일정|코스|루트|itinerary|route|plan|schedule/.test(h)) return `${city} travel map scenic`
  // 소개/개요
  if (/소개|개요|overview|intro|about|기본 정보/.test(h)) return `${city} cityscape panorama aerial`
  // 팁/가이드
  if (/팁|꿀팁|tip|advice|guide|준비|여행 정보/.test(h)) return `${city} travel guide essential`

  // 영문 단어가 포함된 제목 → 직접 활용
  const englishPart = heading.match(/[A-Za-z][A-Za-z\s-]{2,}/g)?.find(w => w.trim().length > 3)
  if (englishPart) return `${city} ${englishPart.trim()}`

  return `${city} travel scenic`
}

export async function fetchSectionImages(
  sections: { heading: string; query: string }[],
): Promise<Record<string, UnsplashPhoto | null>> {
  // 고유 쿼리만 병렬로 fetch (쿼리당 20장으로 풀 확대)
  const uniqueQueries = Array.from(new Set(sections.map(s => s.query)))
  const photosByQuery = Object.fromEntries(
    await Promise.all(
      uniqueQueries.map(async q => [q, await fetchUnsplashPhotos(q, 20)]),
    ),
  ) as Record<string, UnsplashPhoto[]>

  // 사용된 URL 전역 추적 → 페이지 내 중복 방지
  const usedUrls = new Set<string>()
  const result: Record<string, UnsplashPhoto | null> = {}
  const needFallback: { heading: string; query: string }[] = []

  for (const { heading, query } of sections) {
    const photos = photosByQuery[query] ?? []
    const photo = photos.find(p => !usedUrls.has(p.url)) ?? null
    if (photo) {
      usedUrls.add(photo.url)
      result[heading] = photo
    } else {
      // 풀 소진 → fallback 필요
      needFallback.push({ heading, query })
      result[heading] = null
    }
  }

  // 풀이 소진된 섹션: 쿼리에 "scenic photography" 추가해 다른 결과 fetch
  if (needFallback.length > 0) {
    await Promise.all(
      needFallback.map(async ({ heading, query }) => {
        const fallbackQuery = `${query} scenic photography`
        const fallbackPhotos = await fetchUnsplashPhotos(fallbackQuery, 10)
        const photo = fallbackPhotos.find(p => !usedUrls.has(p.url)) ?? null
        if (photo) {
          usedUrls.add(photo.url)
          result[heading] = photo
        }
      }),
    )
  }

  return result
}

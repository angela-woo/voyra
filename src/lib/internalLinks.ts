import { CITY_SLUG_MAP, COUNTRY_SLUG_MAP } from '@/lib/location'

/**
 * Maps Korean city names to their destination URLs.
 * Built from the existing CITY_SLUG_MAP and COUNTRY_SLUG_MAP.
 */
const CITY_COUNTRY_MAP: Record<string, string> = {
  '도쿄': '일본',
  '오사카': '일본',
  '교토': '일본',
  '나라': '일본',
  '후쿠오카': '일본',
  '오키나와': '일본',
  '삿포로': '일본',
  '나고야': '일본',
  '파리': '프랑스',
  '방콕': '태국',
  '치앙마이': '태국',
  '발리': '인도네시아',
  '싱가포르': '싱가포르',
  '런던': '영국',
  '바르셀로나': '스페인',
  '마드리드': '스페인',
  '로마': '이탈리아',
  '피렌체': '이탈리아',
  '밀라노': '이탈리아',
  '베네치아': '이탈리아',
  '베를린': '독일',
  '뮌헨': '독일',
  '뉴욕': '미국',
  '로스앤젤레스': '미국',
  '라스베이거스': '미국',
  '밴쿠버': '캐나다',
  '토론토': '캐나다',
  '시드니': '호주',
  '멜버른': '호주',
  '하노이': '베트남',
  '호치민': '베트남',
  '다낭': '베트남',
  '나트랑': '베트남',
  '타이베이': '대만',
  '타이중': '대만',
  '홍콩': '홍콩',
  '리스본': '포르투갈',
  '암스테르담': '네덜란드',
  '프라하': '체코',
  '비엔나': '오스트리아',
  '취리히': '스위스',
  '코펜하겐': '덴마크',
  '헬싱키': '핀란드',
  '스톡홀름': '스웨덴',
  '오슬로': '노르웨이',
  '브뤼셀': '벨기에',
  '부다페스트': '헝가리',
  '바르샤바': '폴란드',
  '아테네': '그리스',
  '이스탄불': '터키',
  '두바이': 'UAE',
  '뭄바이': '인도',
  '델리': '인도',
  '상하이': '중국',
  '베이징': '중국',
  '쿠알라룸푸르': '말레이시아',
  '멕시코시티': '멕시코',
  '세부': '필리핀',
  '보라카이': '필리핀',
  '마닐라': '필리핀',
  '괌': '괌',
  '사이판': '사이판',
}

/**
 * Build the destination listing URL for a city.
 * e.g. 도쿄 → /destinations/japan/tokyo
 */
export function toCityListingUrl(city: string): string | null {
  const country = CITY_COUNTRY_MAP[city]
  if (!country) return null
  const countrySlug = COUNTRY_SLUG_MAP[country]
  const citySlug = CITY_SLUG_MAP[city]
  if (!countrySlug || !citySlug) return null
  return `/destinations/${countrySlug}/${citySlug}`
}

/**
 * CITY_LINKS maps Korean city names to their destination listing URLs.
 */
export const CITY_LINKS: Record<string, string> = Object.fromEntries(
  Object.keys(CITY_COUNTRY_MAP)
    .map((city) => [city, toCityListingUrl(city)])
    .filter((entry): entry is [string, string] => entry[1] !== null)
)

/**
 * Wraps first occurrences of city names in the content with markdown links.
 *
 * Rules:
 * - Skips the current city (avoids self-linking)
 * - Links each city only once (first occurrence)
 * - Does not wrap city names that are already inside a markdown link [...](...) or HTML <a>
 *
 * @param content - Markdown content string
 * @param currentCity - The city the article is about (will be skipped)
 * @returns Content with city names wrapped in markdown links
 */
export function addInternalLinks(content: string, currentCity?: string | null): string {
  const linked = new Set<string>()

  // Sort cities by length descending to match longer names first (e.g. 로스앤젤레스 before 로스)
  const cities = Object.keys(CITY_LINKS).sort((a, b) => b.length - a.length)

  let result = content

  for (const city of cities) {
    // Skip the current article's city
    if (currentCity && city === currentCity) continue
    // Skip if already linked in this pass
    if (linked.has(city)) continue

    const url = CITY_LINKS[city]

    // We process the string by splitting on existing markdown links and HTML anchors
    // to avoid nesting links inside links.
    // Strategy: replace only the FIRST occurrence of the city name that is NOT inside
    // an existing [...](...) or <a ...>...</a> block.

    // Build a regex that matches either:
    //   1. An existing markdown link: \[([^\]]*)\]\([^)]*\)
    //   2. An existing HTML anchor: <a[^>]*>.*?</a>
    //   3. The target city name
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const combinedRegex = new RegExp(
      `(\\[([^\\]]*)\\]\\([^)]*\\)|<a[^>]*>[\\s\\S]*?<\\/a>|${escapedCity})`,
      'g'
    )

    let replaced = false
    result = result.replace(combinedRegex, (match) => {
      // If the match is the city name itself (not a link wrapper) and not yet replaced
      if (match === city && !replaced) {
        replaced = true
        return `[${city}](${url})`
      }
      return match
    })

    if (replaced) {
      linked.add(city)
    }
  }

  return result
}

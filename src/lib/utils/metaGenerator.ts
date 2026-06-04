// 마크다운 → 플레인 텍스트 변환
function stripMarkdown(content: string): string {
  return content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
}

// 첫 번째 의미있는 문장 추출 (20자 이상)
function extractFirstSentence(text: string): string {
  const sentences = text.split(/[.!?。]/)
  return sentences.find(s => s.trim().length > 20)?.trim() ?? ''
}

// 결정론적 인덱스 선택 (같은 slug는 항상 같은 템플릿)
function pickIndex(seed: string, max: number): number {
  return seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % max
}

/**
 * 본문에서 핵심 내용 추출해서 70~160자 meta description 자동 생성
 */
export function generateMetaDescription(
  content: string,
  city: string,
  country: string,
  slug: string = '',
  locale: 'ko' | 'en' = 'ko',
): string {
  const plain = stripMarkdown(content)
  const first = extractFirstSentence(plain)

  if (locale === 'ko') {
    const templates = [
      `${city} 여행의 모든 것! ${first.slice(0, 40)}... ${city} 여행 가이드와 추천 코스를 확인하세요.`,
      `${city}(${country}) 완벽 여행 가이드. ${first.slice(0, 35)}... 맛집, 관광지, 교통 정보 총정리.`,
      `${city} 여행 준비 중이라면? ${first.slice(0, 35)}... 현지인이 추천하는 ${city} 핵심 정보.`,
    ]
    return templates[pickIndex(slug, templates.length)].slice(0, 160)
  } else {
    const templates = [
      `Complete ${city} travel guide! ${first.slice(0, 40)}... Tips on attractions, food & transportation.`,
      `Planning a trip to ${city}, ${country}? ${first.slice(0, 35)}... Essential travel tips and recommendations.`,
      `Discover the best of ${city}! ${first.slice(0, 40)}... Top attractions, restaurants & travel tips.`,
    ]
    return templates[pickIndex(slug, templates.length)].slice(0, 160)
  }
}

/**
 * 여행 일정 meta description 생성
 */
export function generatePlanMetaDescription(
  plan: {
    city: string
    country: string
    days: number
    travel_type: string
    slug?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    days_data: any
  },
  locale: 'ko' | 'en' = 'ko',
): string {
  const travelTypeKo: Record<string, string> = {
    couple: '커플', family: '가족', friends: '친구', solo: '혼자', honeymoon: '신혼여행',
  }
  const travelTypeEn: Record<string, string> = {
    couple: 'couples', family: 'families', friends: 'friends', solo: 'solo travelers', honeymoon: 'honeymooners',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topPlaces = plan.days_data?.[0]?.places?.slice(0, 3)?.map((p: any) => p.name)?.join(', ') ?? ''

  if (locale === 'ko') {
    const typeKo = travelTypeKo[plan.travel_type] ?? plan.travel_type
    return `${plan.city} ${typeKo} ${plan.days}일 여행 코스 완벽 가이드! ${topPlaces ? topPlaces + ' 등 ' : ''}${plan.days}일간의 알찬 여행 일정을 확인하세요. Kiravoy 추천 ${plan.city} 여행 코스.`.slice(0, 160)
  } else {
    const typeEn = travelTypeEn[plan.travel_type] ?? plan.travel_type
    return `Perfect ${plan.days}-day ${plan.city} itinerary for ${typeEn}! ${topPlaces ? 'Featuring ' + topPlaces + ' and more. ' : ''}Complete day-by-day travel guide for ${plan.city}, ${plan.country}.`.slice(0, 160)
  }
}

/**
 * OG 이미지 URL 결정 (Unsplash URL이면 1200×630 리사이즈 파라미터 추가)
 */
export function getOgImageUrl(
  coverImageUrl?: string | null,
  fallback = 'https://kiravoy.com/og-image.jpg',
): string {
  if (!coverImageUrl || !coverImageUrl.startsWith('https://')) return fallback
  // Unsplash URL이면 w=1200&h=630&fit=crop 추가
  if (coverImageUrl.includes('unsplash.com')) {
    const url = new URL(coverImageUrl)
    url.searchParams.set('w', '1200')
    url.searchParams.set('h', '630')
    url.searchParams.set('fit', 'crop')
    return url.toString()
  }
  return coverImageUrl
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COUNTRY_SLUG: Record<string, string> = {
  '일본': 'japan', '프랑스': 'france', '태국': 'thailand', '인도네시아': 'indonesia',
  '싱가포르': 'singapore', '영국': 'uk', '스페인': 'spain', '이탈리아': 'italy',
  '독일': 'germany', '미국': 'usa', '캐나다': 'canada', '호주': 'australia',
  '베트남': 'vietnam', '대만': 'taiwan', '홍콩': 'hong-kong', '포르투갈': 'portugal',
  '네덜란드': 'netherlands', '체코': 'czech', '오스트리아': 'austria', '스위스': 'switzerland',
  '덴마크': 'denmark', '핀란드': 'finland', '스웨덴': 'sweden', '노르웨이': 'norway',
  '벨기에': 'belgium', '헝가리': 'hungary', '폴란드': 'poland', '그리스': 'greece',
  '터키': 'turkey', '인도': 'india', '중국': 'china', '말레이시아': 'malaysia',
}

const CITY_SLUG: Record<string, string> = {
  '도쿄': 'tokyo', '오사카': 'osaka', '교토': 'kyoto', '나라': 'nara',
  '파리': 'paris', '방콕': 'bangkok', '치앙마이': 'chiangmai', '발리': 'bali',
  '싱가포르': 'singapore', '런던': 'london', '바르셀로나': 'barcelona', '마드리드': 'madrid',
  '로마': 'rome', '피렌체': 'florence', '밀라노': 'milan', '베를린': 'berlin',
  '뮌헨': 'munich', '뉴욕': 'new-york', '로스앤젤레스': 'los-angeles', '라스베이거스': 'las-vegas',
  '밴쿠버': 'vancouver', '토론토': 'toronto', '시드니': 'sydney', '멜버른': 'melbourne',
  '하노이': 'hanoi', '호치민': 'ho-chi-minh', '타이베이': 'taipei', '홍콩': 'hong-kong',
  '리스본': 'lisbon', '암스테르담': 'amsterdam', '프라하': 'prague', '비엔나': 'vienna',
  '취리히': 'zurich', '코펜하겐': 'copenhagen', '헬싱키': 'helsinki', '스톡홀름': 'stockholm',
  '오슬로': 'oslo', '브뤼셀': 'brussels', '부다페스트': 'budapest', '바르샤바': 'warsaw',
  '아테네': 'athens', '이스탄불': 'istanbul', '두바이': 'dubai', '뭄바이': 'mumbai',
  '델리': 'delhi', '상하이': 'shanghai', '베이징': 'beijing', '쿠알라룸푸르': 'kuala-lumpur',
}

function hasKorean(s: string): boolean {
  return /[가-힣]/.test(s)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/destinations/')) return NextResponse.next()

  const parts = pathname.split('/')
  // ['', 'destinations', country, city?, slug?]
  const rawCountry = parts[2] ? decodeURIComponent(parts[2]) : ''
  const rawCity = parts[3] ? decodeURIComponent(parts[3]) : ''

  if (!hasKorean(rawCountry) && !hasKorean(rawCity)) return NextResponse.next()

  const newCountry = COUNTRY_SLUG[rawCountry] ?? rawCountry.toLowerCase()
  const newCity = rawCity ? (CITY_SLUG[rawCity] ?? rawCity.toLowerCase()) : ''

  parts[2] = newCountry
  if (rawCity) parts[3] = newCity

  const newPath = parts.join('/')
  const url = req.nextUrl.clone()
  url.pathname = newPath
  return NextResponse.redirect(url, 301)
}

export const config = {
  matcher: ['/destinations/:path+'],
}

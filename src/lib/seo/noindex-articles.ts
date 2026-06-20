// Tier2 도시에서 동일 city+lang에 일반가이드(travel-guide / complete-guide)가 중복 존재하는 경우
// 더 나중에 생성된 complete-guide를 noindex 처리
// 업데이트: 2026-06-20
export const NOINDEX_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  // Amsterdam EN (travel-guide-en 유지)
  'amsterdam-complete-guide-en',
  // Los Angeles EN (travel-guide-en 유지)
  'los-angeles-complete-guide-en',
  // Rome EN (travel-guide-en 유지)
  'rome-complete-guide-en',
  // Sydney EN (travel-guide-en 유지)
  'sydney-complete-guide-en',
  // 후쿠오카 KO (fukuoka-travel-guide-for-korean-travelers-2024 유지)
  'fukuoka-complete-guide-ko',
  // 세부 KO (cebu-philippines-travel-guide-for-koreans-2024 유지)
  'cebu-complete-guide-ko',
  // 하노이 KO (hanoi-vietnam-travel-guide 유지)
  'hanoi-complete-guide-ko',
  // 호치민 KO (ho-chi-minh-city-complete-travel-guide 유지)
  'ho-chi-minh-complete-guide-ko',
])

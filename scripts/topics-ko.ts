export interface TopicKo {
  city: string
  country: string
  type: string   // hyphenated slug suffix
  keyword: string
  citySlug: string  // English URL slug for city
}

export const topicsKo: TopicKo[] = [
  // 일본 — 도쿄 세부 지역/테마
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'shinjuku-guide', keyword: '도쿄 신주쿠 여행' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'shibuya-guide', keyword: '도쿄 시부야 여행' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'asakusa-guide', keyword: '도쿄 아사쿠사 여행' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'harajuku-guide', keyword: '도쿄 하라주쿠' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'ginza-shopping', keyword: '도쿄 긴자 쇼핑' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'best-restaurants', keyword: '도쿄 맛집 추천' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'cherry-blossom', keyword: '도쿄 벚꽃 명소' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'day-trip', keyword: '도쿄 당일치기' },
  { city: '도쿄', country: '일본', citySlug: 'tokyo', type: 'shopping-guide', keyword: '도쿄 쇼핑 추천' },
  // 일본 — 오사카
  { city: '오사카', country: '일본', citySlug: 'osaka', type: 'dotonbori-guide', keyword: '오사카 도톤보리' },
  { city: '오사카', country: '일본', citySlug: 'osaka', type: 'best-restaurants', keyword: '오사카 맛집' },
  { city: '오사카', country: '일본', citySlug: 'osaka', type: 'shopping-guide', keyword: '오사카 쇼핑' },
  { city: '오사카', country: '일본', citySlug: 'osaka', type: 'usj-guide', keyword: '오사카 USJ 유니버셜' },
  { city: '오사카', country: '일본', citySlug: 'osaka', type: 'kyoto-day-trip', keyword: '오사카 교토 당일치기' },
  // 일본 — 후쿠오카
  { city: '후쿠오카', country: '일본', citySlug: 'fukuoka', type: 'complete-guide', keyword: '후쿠오카 여행' },
  { city: '후쿠오카', country: '일본', citySlug: 'fukuoka', type: 'best-restaurants', keyword: '후쿠오카 맛집' },
  { city: '후쿠오카', country: '일본', citySlug: 'fukuoka', type: 'shopping-guide', keyword: '후쿠오카 쇼핑' },
  { city: '후쿠오카', country: '일본', citySlug: 'fukuoka', type: 'day-trip', keyword: '후쿠오카 당일치기' },
  // 일본 — 교토
  { city: '교토', country: '일본', citySlug: 'kyoto', type: 'temples-guide', keyword: '교토 사원 추천' },
  { city: '교토', country: '일본', citySlug: 'kyoto', type: 'kimono-experience', keyword: '교토 기모노 체험' },
  { city: '교토', country: '일본', citySlug: 'kyoto', type: 'best-restaurants', keyword: '교토 맛집' },
  // 일본 — 삿포로
  { city: '삿포로', country: '일본', citySlug: 'sapporo', type: 'snow-festival', keyword: '삿포로 눈축제' },
  { city: '삿포로', country: '일본', citySlug: 'sapporo', type: 'winter-guide', keyword: '삿포로 겨울여행' },
  // 베트남
  { city: '다낭', country: '베트남', citySlug: 'da-nang', type: 'beach-guide', keyword: '다낭 해변 추천' },
  { city: '다낭', country: '베트남', citySlug: 'da-nang', type: 'best-restaurants', keyword: '다낭 맛집' },
  { city: '다낭', country: '베트남', citySlug: 'da-nang', type: 'hoi-an-day-trip', keyword: '다낭 호이안 당일치기' },
  { city: '다낭', country: '베트남', citySlug: 'da-nang', type: 'golf-guide', keyword: '다낭 골프' },
  { city: '하노이', country: '베트남', citySlug: 'hanoi', type: 'complete-guide', keyword: '하노이 여행' },
  { city: '하노이', country: '베트남', citySlug: 'hanoi', type: 'best-restaurants', keyword: '하노이 맛집' },
  { city: '호치민', country: '베트남', citySlug: 'ho-chi-minh', type: 'complete-guide', keyword: '호치민 여행' },
  { city: '나트랑', country: '베트남', citySlug: 'nha-trang', type: 'resort-guide', keyword: '나트랑 리조트' },
  // 태국
  { city: '방콕', country: '태국', citySlug: 'bangkok', type: 'temples-guide', keyword: '방콕 왕궁 사원' },
  { city: '방콕', country: '태국', citySlug: 'bangkok', type: 'shopping-guide', keyword: '방콕 쇼핑' },
  { city: '방콕', country: '태국', citySlug: 'bangkok', type: 'street-food', keyword: '방콕 맛집 길거리' },
  { city: '방콕', country: '태국', citySlug: 'bangkok', type: 'massage-spa', keyword: '방콕 마사지' },
  { city: '치앙마이', country: '태국', citySlug: 'chiang-mai', type: 'temples-guide', keyword: '치앙마이 사원' },
  { city: '치앙마이', country: '태국', citySlug: 'chiang-mai', type: 'elephant-experience', keyword: '치앙마이 코끼리' },
  // 필리핀
  { city: '세부', country: '필리핀', citySlug: 'cebu', type: 'complete-guide', keyword: '세부 여행' },
  { city: '세부', country: '필리핀', citySlug: 'cebu', type: 'diving-snorkeling', keyword: '세부 다이빙 스노클링' },
  { city: '보라카이', country: '필리핀', citySlug: 'boracay', type: 'beach-guide', keyword: '보라카이 해변' },
  { city: '보라카이', country: '필리핀', citySlug: 'boracay', type: 'resort-guide', keyword: '보라카이 리조트' },
  // 발리
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'ubud-guide', keyword: '발리 우붓' },
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'seminyak-guide', keyword: '발리 스미냑' },
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'kuta-guide', keyword: '발리 꾸따' },
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'temples-guide', keyword: '발리 사원' },
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'cafe-guide', keyword: '발리 카페' },
  { city: '발리', country: '인도네시아', citySlug: 'bali', type: 'surfing-guide', keyword: '발리 서핑' },
  // 싱가포르
  { city: '싱가포르', country: '싱가포르', citySlug: 'singapore', type: 'marina-bay-guide', keyword: '싱가포르 마리나베이' },
  { city: '싱가포르', country: '싱가포르', citySlug: 'singapore', type: 'uss-guide', keyword: '싱가포르 USS 유니버셜' },
  { city: '싱가포르', country: '싱가포르', citySlug: 'singapore', type: 'hawker-food-guide', keyword: '싱가포르 맛집 호커' },
  { city: '싱가포르', country: '싱가포르', citySlug: 'singapore', type: 'shopping-guide', keyword: '싱가포르 쇼핑' },
  // 대만
  { city: '타이베이', country: '대만', citySlug: 'taipei', type: 'night-market-guide', keyword: '타이베이 야시장' },
  { city: '타이베이', country: '대만', citySlug: 'taipei', type: 'best-restaurants', keyword: '타이베이 맛집' },
  { city: '타이베이', country: '대만', citySlug: 'taipei', type: 'shopping-guide', keyword: '타이베이 쇼핑' },
  // 유럽
  { city: '파리', country: '프랑스', citySlug: 'paris', type: 'eiffel-tower-guide', keyword: '파리 에펠탑' },
  { city: '파리', country: '프랑스', citySlug: 'paris', type: 'louvre-guide', keyword: '파리 루브르 박물관' },
  { city: '파리', country: '프랑스', citySlug: 'paris', type: 'cafe-restaurant-guide', keyword: '파리 맛집 카페' },
  { city: '바르셀로나', country: '스페인', citySlug: 'barcelona', type: 'sagrada-familia-guide', keyword: '바르셀로나 사그라다파밀리아' },
  { city: '바르셀로나', country: '스페인', citySlug: 'barcelona', type: 'beach-food-guide', keyword: '바르셀로나 해변 맛집' },
  { city: '로마', country: '이탈리아', citySlug: 'rome', type: 'colosseum-guide', keyword: '로마 콜로세움' },
  { city: '로마', country: '이탈리아', citySlug: 'rome', type: 'best-restaurants', keyword: '로마 맛집' },
  // 한국 국내
  { city: '서울', country: '한국', citySlug: 'seoul', type: 'hongdae-guide', keyword: '서울 홍대 여행' },
  { city: '서울', country: '한국', citySlug: 'seoul', type: 'insadong-guide', keyword: '서울 인사동' },
  { city: '서울', country: '한국', citySlug: 'seoul', type: 'myeongdong-shopping', keyword: '서울 명동 쇼핑' },
  { city: '부산', country: '한국', citySlug: 'busan', type: 'haeundae-guide', keyword: '부산 해운대' },
  { city: '제주', country: '한국', citySlug: 'jeju', type: 'hiking-guide', keyword: '제주 한라산 등산' },
]

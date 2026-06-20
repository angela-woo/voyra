// 노출 제외 아티클 목록
// 사유 A: Tier2 도시 중복 일반가이드 (travel-guide + complete-guide 공존)
// 사유 B: 콘텐츠 분량 부족 (3,000자 미만)
// 업데이트: 2026-06-20
export const NOINDEX_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  // ── 사유 A: 중복 일반가이드 (8개) ──────────────────────────────
  'amsterdam-complete-guide-en',
  'los-angeles-complete-guide-en',
  'rome-complete-guide-en',
  'sydney-complete-guide-en',
  'fukuoka-complete-guide-ko',   // ※ 사유 B 중복 포함
  'cebu-complete-guide-ko',      // ※ 사유 B 중복 포함
  'hanoi-complete-guide-ko',
  'ho-chi-minh-complete-guide-ko',

  // ── 사유 B: 콘텐츠 분량 부족 3,000자 미만 (48개 신규) ──────────
  'sapporo-snow-festival-ko',            // 2,272자
  'bangkok-massage-spa-ko',             // 2,317자
  'bali-seminyak-guide-ko',             // 2,412자
  'rome-colosseum-guide-ko',            // 2,433자
  'da-nang-golf-guide-ko',              // 2,457자
  'sapporo-winter-guide-ko',            // 2,472자
  'tokyo-cherry-blossom-ko',            // 2,473자
  'bangkok-street-food-ko',             // 2,484자
  'osaka-dotonbori-guide-ko',           // 2,492자
  'barcelona-beach-food-guide-ko',      // 2,499자
  'seoul-hongdae-guide-ko',             // 2,514자
  'fukuoka-day-trip-ko',                // 2,541자
  'osaka-best-restaurants-ko',          // 2,570자
  'seoul-myeongdong-shopping-ko',       // 2,609자
  'athens-greece-travel-guide',         // 2,617자
  'tokyo-shibuya-guide-ko',             // 2,623자
  'tokyo-harajuku-guide-ko',            // 2,642자
  'bangkok-temples-guide-ko',           // 2,644자
  'brussels-belgium-travel-guide',      // 2,675자
  'nha-trang-resort-guide-ko',          // 2,679자
  'tokyo-travel-guide-like-a-local',    // 2,693자
  'osaka-usj-guide-ko',                 // 2,704자
  'bangkok-shopping-guide-ko',          // 2,727자
  'tokyo-shinjuku-guide-ko',            // 2,729자
  'helsinki-finland-travel-guide',      // 2,732자
  'munich-germany-travel-guide',        // 2,751자
  'barcelona-sagrada-familia-guide-ko', // 2,776자
  'chiang-mai-elephant-experience-ko',  // 2,792자
  'jeju-hiking-guide-ko',               // 2,803자
  'da-nang-best-restaurants-ko',        // 2,804자
  'bali-kuta-guide-ko',                 // 2,809자
  'bali-ubud-guide-ko',                 // 2,828자
  'kyoto-kimono-experience-ko',         // 2,866자
  'da-nang-hoi-an-day-trip-ko',         // 2,870자
  'tokyo-best-restaurants-ko',          // 2,872자
  'busan-haeundae-guide-ko',            // 2,879자
  'kyoto-japan-travel-guide-complete',  // 2,879자
  'taipei-taiwan-complete-travel-guide',// 2,908자
  'da-nang-beach-guide-ko',             // 2,916자
  'boracay-resort-guide-ko',            // 2,918자
  'kyoto-best-restaurants-ko',          // 2,922자
  'osaka-japan-complete-travel-guide',  // 2,938자
  'singapore-travel-guide-culture-food-attractions', // 2,947자
  'lisbon-portugal-travel-guide',       // 2,948자
  'singapore-complete-travel-guide',    // 2,977자
  'warsaw-poland-travel-guide',         // 2,978자
  'singapore-marina-bay-guide-ko',      // 2,983자
  'zurich-switzerland-travel-guide',    // 2,992자
])

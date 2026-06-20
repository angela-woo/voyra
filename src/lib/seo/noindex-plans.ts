// 도시별 views_count 하위 travel_type 페이지 — 도시당 top 2만 인덱스 유지
// 기준: DB views_count 기준 정렬, 3위 이하 noindex
// 업데이트: 2026-06-20
export const NOINDEX_PLAN_SLUGS: ReadonlySet<string> = new Set([
  // 파리 (solo:112✓, friends:96✓, noindex: family:92, couple:52)
  'paris-family-4days',
  'paris-couple-3days',
  // 오사카 (couple:90✓, family:39✓, noindex: friends:28, solo:28)
  'osaka-friends-3days',
  'osaka-solo-3days',
  // 도쿄 (solo:88✓, couple:80✓, noindex: friends:44, family:32)
  'tokyo-friends-3days',
  'tokyo-family-4days',
  // 발리 (solo:35✓, family:32✓, noindex: friends:32, couple:29)
  'bali-friends-3days',
  'bali-couple-3days',
  // 런던 (solo:33✓, couple:31✓, noindex: friends:28, family:25)
  'london-friends-3days',
  'london-family-4days',
  // 방콕 (solo:30✓, couple:27✓, noindex: family:27, friends:26)
  'bangkok-family-4days',
  'bangkok-friends-3days',
  // 교토 (solo:30✓, family:29✓, noindex: friends:27, couple:26)
  'kyoto-friends-3days',
  'kyoto-couple-3days',
  // 싱가포르 (solo:26✓, couple:19✓, noindex: friends:17, family:16)
  'singapore-friends-3days',
  'singapore-family-4days',
  // 바르셀로나 (solo:25✓, friends:23✓, noindex: family:22, couple:20)
  'barcelona-family-4days',
  'barcelona-couple-3days',
  // 치앙마이 (couple:23✓, friends:23✓, noindex: family:21, solo:19)
  'chiang-mai-family-4days',
  'chiang-mai-solo-3days',
  // 다낭 (friends:25✓, solo:24✓, noindex: couple:20)
  'da-nang-couple-3days',
  // 삿포로 (solo:23✓, friends:19✓, noindex: couple:17)
  'sapporo-couple-3days',
  // 후쿠오카 (friends:23✓, solo:22✓, noindex: couple:18)
  'fukuoka-couple-3days',
  // 세부 (friends:26✓, couple:22✓, noindex: solo:20)
  'cebu-solo-2days',
  // 타이베이 (friends:25✓, solo:22✓, noindex: couple:17)
  'taipei-couple-3days',
  // 나트랑 (friends:21✓, solo:17✓, noindex: couple:16)
  'nha-trang-couple-3days',
  // 사이판 (solo:17✓, friends:16✓, noindex: couple:15)
  'saipan-couple-3days',
  // 오키나와 (couple:17✓, friends:13✓, noindex: solo:12)
  'okinawa-solo-2days',
  // 나고야 (solo:18✓, couple:14✓, noindex: friends:14)
  'nagoya-friends-3days',
  // 하노이 (friends:18✓, couple:16✓, noindex: solo:15)
  'hanoi-solo-2days',
  // 호치민 (couple:15✓, friends:13✓, noindex: solo:12)
  'ho-chi-minh-solo-2days',
  // 마닐라 (couple:16✓, friends:16✓, noindex: solo:15)
  'manila-solo-2days',
  // 멜버른 (friends:17✓, couple:15✓, noindex: solo:15)
  'melbourne-solo-3days',
  // 타이중 (solo:15✓, couple:14✓, noindex: friends:13)
  'taichung-friends-3days',
  // 시드니 (solo:17✓, friends:15✓, noindex: couple:14)
  'sydney-couple-4days',
  // 보라카이 (solo:19✓, friends:16✓, noindex: couple:13)
  'boracay-couple-3days',
  // 괌 (couple:13✓, friends:12✓, noindex: solo:11)
  'guam-solo-2days',
])

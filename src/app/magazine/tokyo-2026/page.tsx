import type { Metadata } from 'next'
import Image from 'next/image'
import { Playfair_Display } from 'next/font/google'
import TOC from './TOC'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '2026 도쿄 여행 완벽 가이드 | Kiravoy 여행 매거진',
  description: '한국인 20·30대가 가장 사랑하는 도쿄의 모든 것. 인기 지역 TOP 10, 한국인 맛집, 쇼핑 리스트 TOP 30, 4박5일 일정까지.',
  alternates: {
    canonical: 'https://kiravoy.com/magazine/tokyo-2026',
  },
  openGraph: {
    title: '2026 도쿄 여행 완벽 가이드 | Kiravoy 여행 매거진',
    description: '한국인 20·30대가 가장 사랑하는 도쿄의 모든 것. 인기 지역 TOP 10, 한국인 맛집, 쇼핑 리스트 TOP 30, 4박5일 일정까지.',
    url: 'https://kiravoy.com/magazine/tokyo-2026',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
        width: 1200,
        height: 630,
        alt: '2026 도쿄 여행 완벽 가이드',
      },
    ],
  },
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TOC_SECTIONS = [
  { id: 'section-1', label: '도쿄 인기 지역 TOP 10', number: '01' },
  { id: 'section-2', label: '한국인 인기 맛집', number: '02' },
  { id: 'section-3', label: '쇼핑 리스트 TOP 30', number: '03' },
  { id: 'section-4', label: '4박 5일 추천 일정', number: '04' },
  { id: 'section-5', label: 'SNS 트렌드 TOP 20', number: '05' },
]

const LOCATIONS = [
  {
    number: '01',
    name: '시부야',
    japanese: '渋谷',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
    tag: '쇼핑·나이트라이프',
    recommendTime: '3-4시간',
    instagramSpot: '시부야 스크램블 교차로',
    nearby: '하라주쿠, 다이칸야마',
    desc: '세계에서 가장 유명한 스크램블 교차로와 다양한 쇼핑몰이 밀집된 도쿄의 심장부.',
  },
  {
    number: '02',
    name: '하라주쿠',
    japanese: '原宿',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    tag: '패션·카페',
    recommendTime: '2-3시간',
    instagramSpot: '다케시타 거리',
    nearby: '오모테산도, 요요기 공원',
    desc: '독특한 일본 팝 컬처와 패션 문화의 발원지. 타케시타 거리의 크레이프와 패션 아이템이 유명.',
  },
  {
    number: '03',
    name: '아사쿠사',
    japanese: '浅草',
    image: 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=800',
    tag: '전통·문화',
    recommendTime: '3-4시간',
    instagramSpot: '센소지 뇨닌도',
    nearby: '우에노, 아키하바라',
    desc: '도쿄에서 가장 오래된 사원인 센소지와 나카미세 쇼핑 거리로 전통 일본의 정취가 물씬.',
  },
  {
    number: '04',
    name: '신주쿠',
    japanese: '新宿',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    tag: '먹방·엔터테인먼트',
    recommendTime: '4-5시간',
    instagramSpot: '신주쿠 고엔 / 골든가이',
    nearby: '시부야, 하라주쿠',
    desc: '낮에는 도쿄 도청 전망대, 밤에는 가부키초와 골든가이의 이자카야. 하루 종일 즐길 거리가 가득.',
  },
  {
    number: '05',
    name: '나카메구로',
    japanese: '中目黒',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
    tag: '힙·카페',
    recommendTime: '2-3시간',
    instagramSpot: '메구로 강변 산책로',
    nearby: '다이칸야마, 지유가오카',
    desc: '메구로 강변 카페와 독립 서점, 빈티지 숍이 즐비한 도쿄 감성의 끝판왕 동네.',
  },
  {
    number: '06',
    name: '시모키타자와',
    japanese: '下北沢',
    image: 'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800',
    tag: '빈티지·라이브뮤직',
    recommendTime: '2-3시간',
    instagramSpot: '시모키타자와 역 광장',
    nearby: '기치조지, 고엔지',
    desc: '도쿄 서브컬처의 성지. 라이브 음악 클럽과 빈티지 옷가게, 독특한 카페가 가득한 힙스터 동네.',
  },
  {
    number: '07',
    name: '긴자',
    japanese: '銀座',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
    tag: '명품·파인다이닝',
    recommendTime: '2-3시간',
    instagramSpot: '긴자 식스 루프탑',
    nearby: '츠키지, 하마리큐',
    desc: '도쿄 최고급 쇼핑가. 루이비통, 샤넬 등 명품 플래그십과 미슐랭 레스토랑이 집중된 지역.',
  },
  {
    number: '08',
    name: '오모테산도',
    japanese: '表参道',
    image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800',
    tag: '갤러리·디자인',
    recommendTime: '2-3시간',
    instagramSpot: '오모테산도 힐즈',
    nearby: '하라주쿠, 아오야마',
    desc: '유럽 분위기의 가로수길. 세계적인 건축가들이 설계한 명품 매장과 독특한 카페가 줄지어 있음.',
  },
  {
    number: '09',
    name: '이케부쿠로',
    japanese: '池袋',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    tag: '애니·서브컬처',
    recommendTime: '3-4시간',
    instagramSpot: '선샤인 시티 전망대',
    nearby: '메지로, 오오츠카',
    desc: '애니메이션·만화 팬의 성지. 선샤인 시티와 다양한 오타쿠 문화 상점, 맛집이 가득한 서민적 지역.',
  },
  {
    number: '10',
    name: '팀랩 플래닛',
    japanese: 'teamLab Planets',
    image: 'https://images.unsplash.com/photo-1633113093730-47449a1a9c6e?w=800',
    tag: '아트·체험',
    recommendTime: '1.5-2시간',
    instagramSpot: '몰입형 디지털 아트 공간',
    nearby: '도요스, 오다이바',
    desc: '세계 최고 수준의 몰입형 디지털 아트 뮤지엄. 사전 예약 필수, 인스타 감성 사진 명소.',
  },
]

const RESTAURANTS = [
  {
    category: '🍣 스시',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600',
    items: [
      {
        name: '히나스시',
        menu: '오마카세 스시 코스',
        price: '₩15,000~25,000',
        waiting: '예약 필수',
        location: '신주쿠',
        reason: '합리적인 가격의 신선한 오마카세 스시. 한국어 메뉴 있음',
      },
      {
        name: '츠지한',
        menu: '카이센동 (시로)',
        price: '₩18,000~30,000',
        waiting: '현장 대기 1-2시간',
        location: '니혼바시',
        reason: '줄 서서 먹는 가치 있는 카이센동. SNS 필수 방문 맛집',
      },
    ],
  },
  {
    category: '🍜 라멘',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
    items: [
      {
        name: '이치란',
        menu: '돈코츠 라멘',
        price: '₩10,000~15,000',
        waiting: '10-30분',
        location: '시부야, 신주쿠 등 다수',
        reason: '1인 칸막이 좌석의 집중 라멘 체험. 입문용 도쿄 라멘',
      },
      {
        name: '후운지',
        menu: '츠케멘',
        price: '₩12,000~18,000',
        waiting: '30-60분',
        location: '신주쿠',
        reason: '도쿄 최고의 츠케멘. 진한 어패류 육수와 두꺼운 면이 절묘',
      },
      {
        name: '멘쇼 도쿄',
        menu: '포기드 포크 라멘',
        price: '₩13,000~20,000',
        waiting: '30-45분',
        location: '분쿄',
        reason: '혁신적인 파인 다이닝 라멘. 미슐랭 레스토랑 출신 셰프 운영',
      },
    ],
  },
  {
    category: '🥩 돈카츠',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600',
    items: [
      {
        name: '카츠젠',
        menu: '히레카츠 정식',
        price: '₩15,000~22,000',
        waiting: '예약 권장',
        location: '신주쿠',
        reason: '부드러운 안심 돈카츠 전문. 정통 일본식 돈카츠의 진수',
      },
    ],
  },
  {
    category: '🥩 규카츠/소고기',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    items: [
      {
        name: '규카츠 모토무라',
        menu: '규카츠 정식',
        price: '₩18,000~28,000',
        waiting: '30-60분',
        location: '시부야, 신주쿠 등',
        reason: '레어로 구워 먹는 소고기 커틀릿. 한국인 최애 도쿄 음식',
      },
      {
        name: '레드락',
        menu: '로스트비프 동',
        price: '₩12,000~18,000',
        waiting: '오픈 런 필수',
        location: '신주쿠',
        reason: '두툼한 로스트비프 덮밥. 가성비 최고의 도쿄 소고기 맛집',
      },
    ],
  },
  {
    category: '🍡 디저트',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    items: [
      {
        name: '나카무라토우카시텐',
        menu: '화과자 세트',
        price: '₩8,000~15,000',
        waiting: '예약 필수',
        location: '기치조지',
        reason: '100년 전통 화과자 명장. 계절 한정 화과자가 예술 작품 수준',
      },
    ],
  },
]

const SHOPPING_GROUPS = [
  {
    emoji: '💊',
    label: '드럭스토어',
    items: [
      { num: 1, name: '마츠모토 키요시 스킨케어 세트', price: '¥2,000~5,000' },
      { num: 2, name: '코세 클레어 비탈리 파운데이션', price: '¥1,500~3,000' },
      { num: 3, name: '카네보 수분 크림 (하다비세이)', price: '¥1,800~4,000' },
      { num: 4, name: '멘소레담 립크림', price: '¥500~800' },
      { num: 5, name: '로토 쿨40 안약', price: '¥800~1,200' },
      { num: 6, name: '오타이산 소화제', price: '¥1,000~1,500' },
      { num: 7, name: '반도에이드 패치 (방수형)', price: '¥600~1,000' },
      { num: 8, name: '비오레 선스틱 SPF50+', price: '¥900~1,400' },
      { num: 9, name: '아네사 썬크림 (금병)', price: '¥1,200~2,000' },
      { num: 10, name: 'DHC 딥 클렌징 오일', price: '¥1,000~1,800' },
    ],
  },
  {
    emoji: '🛒',
    label: '돈키호테',
    items: [
      { num: 11, name: '기린 알코올 젤리 (하이볼)', price: '¥500~700' },
      { num: 12, name: '칼피스 과자 세트', price: '¥800~1,200' },
      { num: 13, name: '가나 초콜릿 대용량', price: '¥400~700' },
      { num: 14, name: '산리오 한정 굿즈', price: '¥1,000~3,000' },
      { num: 15, name: '마쓰야 황금 카레 루', price: '¥400~600' },
    ],
  },
  {
    emoji: '🪴',
    label: '무인양품 (MUJI)',
    items: [
      { num: 16, name: '무인양품 아로마 디퓨저', price: '¥3,000~5,000' },
      { num: 17, name: '무인양품 여권 케이스', price: '¥1,500~2,500' },
      { num: 18, name: '무인양품 습식 티슈 (대형)', price: '¥300~500' },
    ],
  },
  {
    emoji: '👕',
    label: '유니클로',
    items: [
      { num: 19, name: '유니클로 × 한정 콜라보 T셔츠', price: '¥1,500~2,000' },
      { num: 20, name: '에어리즘 쿨넥 (일본 한정 색상)', price: '¥1,200~1,500' },
      { num: 21, name: '히트텍 극한 (일본 전용 라인업)', price: '¥1,500~2,000' },
    ],
  },
  {
    emoji: '🎮',
    label: '캐릭터/전자',
    items: [
      { num: 22, name: '닌텐도 스위치 한정판 게임', price: '¥5,000~7,000' },
      { num: 23, name: '포켓몬 센터 한정 인형', price: '¥2,000~5,000' },
      { num: 24, name: '가챠 기계 캐릭터', price: '¥200~500/회' },
      { num: 25, name: 'AirPods 케이스 (일본 한정)', price: '¥3,000~6,000' },
      { num: 26, name: '헬로키티 오리지널 굿즈', price: '¥1,000~4,000' },
      { num: 27, name: '세가 크레인 게임 인형', price: '¥200~500/회' },
    ],
  },
  {
    emoji: '🏪',
    label: '로프트',
    items: [
      { num: 28, name: '로프트 디자인 문구 세트', price: '¥500~2,000' },
      { num: 29, name: '마스킹 테이프 (mt 한정)', price: '¥300~800' },
      { num: 30, name: '일본 인테리어 소품 잡화', price: '¥500~3,000' },
    ],
  },
]

const ITINERARY_YOUNG = [
  {
    day: 1,
    title: '도착 & 시부야·하라주쿠',
    items: [
      { time: '12:00', activity: '하네다/나리타 도착, 호텔 체크인' },
      { time: '14:00', activity: '하라주쿠 다케시타 거리 탐방' },
      { time: '15:30', activity: '오모테산도 카페 투어' },
      { time: '17:30', activity: '시부야 스크램블 교차로 & 쇼핑' },
      { time: '20:00', activity: '이치란 라멘 저녁 식사' },
    ],
  },
  {
    day: 2,
    title: '아사쿠사·우에노·나카메구로',
    items: [
      { time: '09:00', activity: '아사쿠사 센소지 & 나카미세 쇼핑' },
      { time: '12:00', activity: '우에노 공원 점심 피크닉' },
      { time: '14:00', activity: '아메요코 쇼핑 거리' },
      { time: '16:00', activity: '나카메구로 메구로 강변 카페' },
      { time: '19:00', activity: '규카츠 모토무라 저녁' },
    ],
  },
  {
    day: 3,
    title: '신주쿠·시모키타자와',
    items: [
      { time: '09:30', activity: '신주쿠 고엔 산책' },
      { time: '12:00', activity: '카츠젠 돈카츠 런치' },
      { time: '14:00', activity: '신주쿠 쇼핑 (이세탄, 타카시마야)' },
      { time: '17:00', activity: '시모키타자와 빈티지 숍 탐방' },
      { time: '20:00', activity: '시모키타자와 라이브 공연 관람' },
    ],
  },
  {
    day: 4,
    title: '팀랩·오다이바·이케부쿠로',
    items: [
      { time: '10:00', activity: '팀랩 플래닛 (예약 필수)' },
      { time: '13:00', activity: '오다이바 다이버시티 점심 & 쇼핑' },
      { time: '16:00', activity: '이케부쿠로 선샤인 시티' },
      { time: '18:30', activity: '이케부쿠로 야키토리 골목' },
      { time: '21:00', activity: '신주쿠 골든가이 바 호핑' },
    ],
  },
  {
    day: 5,
    title: '긴자·쇼핑·귀국',
    items: [
      { time: '09:00', activity: '긴자 모닝 커피 & 산책' },
      { time: '10:00', activity: '긴자 식스 & 마지막 쇼핑' },
      { time: '12:30', activity: '츠지한 카이센동 런치' },
      { time: '14:30', activity: '돈키호테 마지막 쇼핑' },
      { time: '17:00', activity: '공항 이동 및 귀국' },
    ],
  },
]

const ITINERARY_COUPLE = [
  {
    day: 1,
    title: '로맨틱 아사쿠사·나카메구로',
    items: [
      { time: '11:00', activity: '나리타/하네다 도착, 호텔 체크인' },
      { time: '14:00', activity: '아사쿠사 센소지 커플 소원 빌기' },
      { time: '16:00', activity: '나카미세 화과자 쇼핑' },
      { time: '18:00', activity: '나카메구로 강변 석양 산책' },
      { time: '20:00', activity: '나카메구로 분위기 좋은 이탈리안' },
    ],
  },
  {
    day: 2,
    title: '오모테산도·신주쿠 야경',
    items: [
      { time: '10:00', activity: '오모테산도 갤러리 & 브런치 카페' },
      { time: '13:00', activity: '히나스시 스시 런치' },
      { time: '15:00', activity: '요요기 공원 피크닉' },
      { time: '17:30', activity: '시부야 스카이 야경 (예약 필수)' },
      { time: '20:30', activity: '신주쿠 분위기 레스토랑 디너' },
    ],
  },
  {
    day: 3,
    title: '팀랩·오다이바 데이트',
    items: [
      { time: '10:00', activity: '팀랩 플래닛 몰입형 아트 체험' },
      { time: '13:00', activity: '오다이바 레인보우 브릿지 뷰' },
      { time: '15:00', activity: '오다이바 쇼핑 & 온천 체험' },
      { time: '19:00', activity: '베이뷰 레스토랑 석식' },
      { time: '21:00', activity: '오다이바 야경 산책' },
    ],
  },
  {
    day: 4,
    title: '하코네 당일치기 (선택)',
    items: [
      { time: '08:00', activity: '신주쿠역에서 로망스카 탑승' },
      { time: '10:30', activity: '하코네 오픈에어 뮤지엄' },
      { time: '13:00', activity: '하코네 온천 료칸 점심' },
      { time: '15:00', activity: '아시노코 호수 유람선' },
      { time: '18:00', activity: '도쿄 복귀, 긴자 저녁' },
    ],
  },
  {
    day: 5,
    title: '긴자·쇼핑·귀국',
    items: [
      { time: '09:30', activity: '긴자 모닝 세트 카페' },
      { time: '11:00', activity: '커플 기념품 쇼핑 (긴자식스)' },
      { time: '13:00', activity: '로스트비프 레드락 런치' },
      { time: '15:00', activity: '돈키호테 마지막 쇼핑' },
      { time: '17:00', activity: '공항 이동 및 귀국' },
    ],
  },
]

const SNS_TRENDS = [
  { rank: 1, text: '시부야 스카이 야경샷 (시부야 스크램블 교차로 뷰)', hot: true },
  { rank: 2, text: '팀랩 플래닛 몰입형 반영 샷', hot: true },
  { rank: 3, text: '메구로 강변 벚꽃/단풍 산책 릴스', hot: true },
  { rank: 4, text: '아사쿠사 센소지 인력거 체험', hot: false },
  { rank: 5, text: '나카미세 닝교야키 먹방', hot: true },
  { rank: 6, text: '오모테산도 힐즈 나선형 계단', hot: false },
  { rank: 7, text: '세계 최대 스타벅스 리저브 (나카메구로)', hot: true },
  { rank: 8, text: '다케시타 거리 카와이이 패션 룩북', hot: false },
  { rank: 9, text: '츠지한 카이센동 언박싱 먹방', hot: false },
  { rank: 10, text: '신주쿠 골든가이 네온사인 야간 산책', hot: true },
  { rank: 11, text: '하라주쿠 마리온 크레이프 리뷰', hot: false },
  { rank: 12, text: '도쿄 스카이트리 야경', hot: false },
  { rank: 13, text: '팀랩 보더리스 리오픈 첫 방문 리뷰', hot: true },
  { rank: 14, text: '규카츠 모토무라 먹방', hot: false },
  { rank: 15, text: '포켓몬 카페 한정 메뉴 공략', hot: true },
  { rank: 16, text: '이케부쿠로 선샤인 수족관 셀카', hot: false },
  { rank: 17, text: '도쿄 마트 쇼핑 하울 (드럭스토어 TOP 10)', hot: true },
  { rank: 18, text: '아메요코 길거리 음식 투어', hot: false },
  { rank: 19, text: '하코네 료칸 프라이빗 온천 브이로그', hot: false },
  { rank: 20, text: '도쿄 벚꽃/단풍 시즌 최적 스팟 정리', hot: true },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeading({ number, title, id }: { number: string; title: string; id: string }) {
  return (
    <div id={id} className="relative mb-12 pt-4 scroll-mt-24">
      <span
        className="absolute -top-4 left-0 text-8xl font-black leading-none select-none pointer-events-none"
        style={{ color: '#1A1A2E', opacity: 0.07 }}
      >
        {number}
      </span>
      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#E8B86D' }}>
          Section {number}
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          {title}
        </h2>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TokyoMagazinePage() {
  return (
    <div className={`${playfair.variable}`} style={{ backgroundColor: '#FAFAF8', color: '#2D2D2D' }}>
      {/* ── Hero ── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600"
          alt="도쿄 야경"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.4) 60%, transparent 100%)' }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-12 md:pb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#E8B86D' }}>
                일본 · 도쿄
              </span>
              <span className="text-white/60 text-sm">2026 최신판</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              2026 도쿄 여행
              <br />
              <span style={{ color: '#E8B86D' }}>완벽 가이드</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              인기 지역 TOP 10 · 한국인 맛집 · 쇼핑 리스트 TOP 30 · 4박5일 일정
            </p>
          </div>
        </div>
      </section>

      {/* ── Layout wrapper ── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex gap-12">
          {/* Sidebar TOC */}
          <aside className="w-56 shrink-0">
            <TOC sections={TOC_SECTIONS} />
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0 space-y-24">

            {/* ────────────── SECTION 1: 인기 지역 TOP 10 ────────────── */}
            <section>
              <SectionHeading id="section-1" number="01" title="도쿄 인기 지역 TOP 10" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOCATIONS.map((loc) => (
                  <div
                    key={loc.number}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative h-[200px]">
                      <Image
                        src={loc.image}
                        alt={`${loc.name} ${loc.japanese}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Number badge */}
                      <div
                        className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg"
                        style={{ backgroundColor: '#E8B86D' }}
                      >
                        {loc.number}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>
                          {loc.name}
                        </h3>
                        <span className="text-xs text-gray-400">{loc.japanese}</span>
                      </div>
                      <span
                        className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full text-white mb-3"
                        style={{ backgroundColor: '#FF5722' }}
                      >
                        {loc.tag}
                      </span>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{loc.desc}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-20 shrink-0">추천 시간</span>
                          <span>{loc.recommendTime}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-20 shrink-0">인스타 명소</span>
                          <span>{loc.instagramSpot}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-20 shrink-0">주변</span>
                          <span>{loc.nearby}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ────────────── SECTION 2: 맛집 ────────────── */}
            <section>
              <SectionHeading id="section-2" number="02" title="한국인 인기 맛집" />
              <div className="space-y-10">
                {RESTAURANTS.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-4 mb-5">
                      <h3 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>{group.category}</h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((r) => (
                        <div key={r.name} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex">
                          <div className="relative w-28 shrink-0">
                            <Image
                              src={group.image}
                              alt={r.name}
                              fill
                              className="object-cover"
                              sizes="112px"
                            />
                          </div>
                          <div className="p-4 flex-1">
                            <p className="font-bold text-base mb-1" style={{ color: '#1A1A2E' }}>{r.name}</p>
                            <p className="text-sm text-gray-500 mb-2">{r.menu}</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500">
                              <span><span className="text-gray-700 font-medium">가격</span> {r.price}</span>
                              <span><span className="text-gray-700 font-medium">위치</span> {r.location}</span>
                              <span className="col-span-2"><span className="text-gray-700 font-medium">웨이팅</span> {r.waiting}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{r.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ────────────── SECTION 3: 쇼핑 TOP 30 ────────────── */}
            <section>
              <SectionHeading id="section-3" number="03" title="쇼핑 리스트 TOP 30" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SHOPPING_GROUPS.map((group) => (
                  <div key={group.label} className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
                      <span className="text-2xl">{group.emoji}</span>
                      {group.label}
                    </h3>
                    <ul className="space-y-2.5">
                      {group.items.map((item) => (
                        <li key={item.num} className="flex items-start gap-3">
                          <span
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                            style={{ backgroundColor: '#E8B86D' }}
                          >
                            {item.num}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                            <span className="ml-2 text-xs text-gray-400">{item.price}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ────────────── SECTION 4: 일정 ────────────── */}
            <section>
              <SectionHeading id="section-4" number="04" title="4박 5일 추천 일정" />
              <div className="space-y-12">
                {/* 20대 여성 */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>👩 20대 여성 여행객</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ITINERARY_YOUNG.map((day) => (
                      <div key={day.day} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ backgroundColor: '#1A1A2E' }}
                          >
                            D{day.day}
                          </span>
                          <p className="font-semibold text-sm text-gray-800 leading-snug">{day.title}</p>
                        </div>
                        <ul className="space-y-2.5">
                          {day.items.map((item) => (
                            <li key={item.time} className="flex gap-3 text-sm">
                              <span className="shrink-0 font-mono text-xs pt-0.5" style={{ color: '#E8B86D' }}>{item.time}</span>
                              <span className="text-gray-600 leading-snug">{item.activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 커플 */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>💑 커플 여행객</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ITINERARY_COUPLE.map((day) => (
                      <div key={day.day} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ backgroundColor: '#E8B86D' }}
                          >
                            D{day.day}
                          </span>
                          <p className="font-semibold text-sm text-gray-800 leading-snug">{day.title}</p>
                        </div>
                        <ul className="space-y-2.5">
                          {day.items.map((item) => (
                            <li key={item.time} className="flex gap-3 text-sm">
                              <span className="shrink-0 font-mono text-xs pt-0.5" style={{ color: '#E8B86D' }}>{item.time}</span>
                              <span className="text-gray-600 leading-snug">{item.activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ────────────── SECTION 5: SNS 트렌드 ────────────── */}
            <section>
              <SectionHeading id="section-5" number="05" title="SNS 트렌드 TOP 20" />
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SNS_TRENDS.map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center gap-4 py-3 px-4 rounded-xl transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                          style={{
                            backgroundColor: item.rank <= 3 ? '#1A1A2E' : '#F5F5F0',
                            color: item.rank <= 3 ? '#E8B86D' : '#6B7280',
                          }}
                        >
                          {item.rank}
                        </span>
                        {item.hot && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                            🔥
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Bottom CTA ── */}
            <div
              className="rounded-2xl p-8 md:p-12 text-center"
              style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)' }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: '#E8B86D' }}>더 많은 도쿄 정보</p>
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                도쿄 여행 일정을 직접 만들어보세요
              </h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Kiravoy의 AI 여행 플래너로 나만의 도쿄 여행 일정을 무료로 생성해보세요.
              </p>
              <a
                href="/destinations"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#E8B86D' }}
              >
                여행 일정 만들기
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

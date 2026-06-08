import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display, Cormorant_Garamond, Inter } from 'next/font/google'
import type { Metadata } from 'next'
import ScrollAnimator from './ScrollAnimator'
import TOC from './TOC'

export const revalidate = 86400

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '도쿄 2026 — Voyra 매거진',
  description: '2026년 도쿄를 가장 완벽하게 즐기는 법. 시부야부터 아사쿠사까지, 진짜 도쿄를 만나다.',
  openGraph: {
    title: '도쿄 2026 — Voyra 매거진',
    description: '2026년 도쿄를 가장 완벽하게 즐기는 법.',
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=90'],
  },
}

const TOC_SECTIONS = [
  { id: 'ch1', label: 'Tokyo Now', number: '01' },
  { id: 'ch2', label: 'The Districts', number: '02' },
  { id: 'ch3', label: 'Taste of Tokyo', number: '03' },
  { id: 'ch4', label: 'Shopping Edit', number: '04' },
  { id: 'ch5', label: '4 Days in Tokyo', number: '05' },
  { id: 'ch6', label: 'Social Trend', number: '06' },
]

const DISTRICTS = [
  {
    name: '시부야',
    nameEn: 'SHIBUYA',
    tagline: '세계에서 가장 바쁜 교차로',
    description: '하루 250만 명이 오가는 시부야 스크램블 교차로. 그 혼돈 속에 도쿄의 에너지가 있다. 2023년 개장한 시부야 스크램블 스퀘어 2기는 이 구역의 새로운 랜드마크.',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1400&q=90',
    layout: 'fullscreen',
  },
  {
    name: '하라주쿠',
    nameEn: 'HARAJUKU',
    tagline: '서브컬처의 진원지',
    description: '다케시타 도리의 크레이프와 캐릭터 숍, 오모테산도의 플래그십 부티크. 하라주쿠는 도쿄의 두 얼굴을 동시에 보여준다.',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=90',
    layout: 'split',
  },
  {
    name: '나카메구로',
    nameEn: 'NAKAMEGURO',
    tagline: '목구로 강변의 낭만',
    description: '메구로 강변을 따라 늘어선 카페와 빈티지 숍. 벚꽃 시즌의 나카메구로는 도쿄에서 가장 아름다운 풍경을 만들어낸다.',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=90',
    layout: 'centered',
  },
  {
    name: '아사쿠사',
    nameEn: 'ASAKUSA',
    tagline: '에도의 숨결이 남은 곳',
    description: '센소지 절의 카미나리몬에서 시작되는 나카미세 상점가. 700년 역사의 절과 현대 도쿄가 공존하는 유일한 동네.',
    image: 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=1200&q=90',
    layout: 'split',
  },
  {
    name: '시모키타자와',
    nameEn: 'SHIMOKITAZAWA',
    tagline: '빈티지와 인디의 메카',
    description: '도쿄의 가장 보헤미안한 동네. 골목마다 숨어있는 라이브 하우스, 고서점, 빈티지 의류점이 예술가들을 불러모은다.',
    image: 'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=1200&q=90',
    layout: 'fullscreen',
  },
]

const RESTAURANTS = [
  {
    category: '스시',
    categoryEn: 'OMAKASE SUSHI',
    items: [
      {
        name: '하나스시',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=85',
        menu: '오마카세 스시 코스',
        price: '5,000~15,000엔',
        waiting: '예약 필수',
        location: '신주쿠',
        reason: '제철 네타만 고집하는 장인의 스시. 쿠라마에 본점 분위기를 신주쿠에서.',
      },
      {
        name: '츠지한',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=85',
        menu: '카이센동 시로',
        price: '3,000엔~',
        waiting: '웨이팅 2~3시간',
        location: '닌교초',
        reason: '두꺼운 참치와 연어, 성게가 넘치는 카이센동. 오픈 전부터 줄이 선다.',
      },
    ],
  },
  {
    category: '라멘',
    categoryEn: 'RAMEN',
    items: [
      {
        name: '이치란 라멘',
        image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=85',
        menu: '돈코츠 라멘',
        price: '980엔~',
        waiting: '15~30분',
        location: '신주쿠·시부야',
        reason: '1인 개별 칸막이석의 독특한 경험. 24시간 영업, 맛의 일관성.',
      },
      {
        name: '후운지',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=85',
        menu: '쓰케멘',
        price: '1,000~1,500엔',
        waiting: '30~60분',
        location: '신주쿠',
        reason: '일본 라멘 랭킹 최상위권의 진한 쓰케멘. 면과 수프의 농도가 예술.',
      },
    ],
  },
  {
    category: '돈카츠',
    categoryEn: 'TONKATSU',
    items: [
      {
        name: '카츠젠',
        image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=85',
        menu: '로스카츠 정식',
        price: '1,800~3,000엔',
        waiting: '20~40분',
        location: '아키하바라',
        reason: '흑돼지를 사용한 바삭한 돈카츠. 샐러드와 된장국 리필 무제한.',
      },
    ],
  },
  {
    category: '규카츠',
    categoryEn: 'GYU-KATSU',
    items: [
      {
        name: '규카츠 모토무라',
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=85',
        menu: '규카츠 정식',
        price: '1,500~2,500엔',
        waiting: '30~60분',
        location: '시부야·신주쿠',
        reason: '미디엄 레어로 튀긴 소고기 커틀릿. 돌판에 직접 굽는 재미까지.',
      },
      {
        name: '레드락',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85',
        menu: '로스트비프동',
        price: '1,100엔~',
        waiting: '1~2시간',
        location: '신주쿠',
        reason: '두툼한 로스트비프가 가득한 덮밥. SNS에서 항상 화제인 비주얼.',
      },
    ],
  },
  {
    category: '디저트',
    categoryEn: 'DESSERT',
    items: [
      {
        name: '나카무라 도킨',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
        menu: '말차 파르페',
        price: '1,200~2,000엔',
        waiting: '예약 권장',
        location: '긴자',
        reason: '100년 역사 말차 전문점의 파르페. 진한 교토 우지 말차의 풍미.',
      },
    ],
  },
]

const SHOPPING = [
  {
    label: 'ESSENTIALS',
    title: '드럭스토어 필수템',
    subtitle: '마쓰모토 키요시 & 코스모스',
    description: '멜라논CC, 히루도이드, 쓰무라 한방약. 도쿄 드럭스토어는 한국인 여행자의 성지. 오사카 기준보다 1~2천엔 저렴한 경우도 많다.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=85',
    tag: 'BEAUTY & HEALTH',
  },
  {
    label: 'LIFESTYLE',
    title: '무인양품의 철학',
    subtitle: 'MUJI — 무지 긴자 플래그십',
    description: '긴자 6층 플래그십 스토어에서만 만날 수 있는 한정 아이템들. 여행용품부터 인테리어까지, 단순함의 극치를 경험하라.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=85',
    tag: 'DESIGN & LIVING',
  },
  {
    label: 'EXPERIENCE',
    title: '돈키호테의 카오스',
    subtitle: 'Don Quijote — 24시간의 보물창고',
    description: '새벽 2시에도 열려있는 일본의 명물. 과자, 화장품, 의류, 가전이 뒤섞인 혼돈 속에서 의외의 보물을 발견하는 재미.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=85',
    tag: 'VARIETY & VALUE',
  },
]

const ITINERARY = [
  {
    day: 'DAY 1',
    theme: '시부야 & 하라주쿠',
    color: '#C9A96E',
    schedule: [
      { time: '09:00', place: '메이지 신궁', desc: '고요한 숲 속 산책으로 도쿄 여행 시작' },
      { time: '11:00', place: '다케시타 도리', desc: '하라주쿠 팝컬처 거리 탐방' },
      { time: '13:00', place: '오모테산도', desc: '플래그십 숍과 카페에서 점심' },
      { time: '16:00', place: '시부야 스크램블', desc: '스크램블 교차로의 골든아워' },
      { time: '19:00', place: '시부야 스트림', desc: '루프탑 바에서 저녁과 야경' },
    ],
  },
  {
    day: 'DAY 2',
    theme: '아사쿠사 & 도쿄 스카이트리',
    color: '#8B7355',
    schedule: [
      { time: '08:30', place: '센소지', desc: '이른 아침 카미나리몬과 나카미세 거리' },
      { time: '11:00', place: '도쿄 스카이트리', desc: '634m 전망대에서 도쿄 전경 감상' },
      { time: '14:00', place: '나카메구로', desc: '메구로 강변 카페와 빈티지 숍 탐방' },
      { time: '18:00', place: '다이칸야마', desc: '츠타야 서점과 레스토랑 거리' },
      { time: '20:00', place: '에비스', desc: '야에바루에서 오키나와 요리 디너' },
    ],
  },
  {
    day: 'DAY 3',
    theme: '팀랩 & 오다이바',
    color: '#4A6741',
    schedule: [
      { time: '10:00', place: '팀랩 플래닛', desc: '몰입형 디지털 아트 체험 (사전예약 필수)' },
      { time: '13:00', place: '오다이바', desc: '레인보우 브리지 전망과 쇼핑' },
      { time: '16:00', place: '아키하바라', desc: '전자상가와 애니메이션 성지 방문' },
      { time: '19:00', place: '우에노', desc: '아메요코 시장에서 저녁 식사' },
    ],
  },
  {
    day: 'DAY 4',
    theme: '긴자 & 시모키타자와',
    color: '#2D4A6B',
    schedule: [
      { time: '10:00', place: '긴자 식스', desc: '긴자 최고급 쇼핑몰 탐방' },
      { time: '13:00', place: '츠키지 외시장', desc: '해산물 런치와 길거리 음식' },
      { time: '15:00', place: '시모키타자와', desc: '빈티지 숍과 라이브 하우스 거리' },
      { time: '18:00', place: '시모키타자와', desc: '골목 카레 맛집에서 마지막 저녁' },
      { time: '20:00', place: '신주쿠', desc: '골든 가이 야경으로 도쿄 여행 마무리' },
    ],
  },
]

const TRENDS = [
  {
    tag: '#도쿄카페투어',
    title: '감성 카페 순례',
    desc: '나카메구로 오니버스, 시모키타자와 커피 수프림, 긴자 폴 바셋. 도쿄의 스페셜티 카페 씬은 서울보다 한발 앞서 있다.',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=85',
    height: '280px',
  },
  {
    tag: '#팀랩플래닛',
    title: '몰입형 아트 체험',
    desc: '2024 세계 3대 미술관에 선정된 팀랩 플래닛. 물 위를 걷는 미러 공간과 수천 개의 등불이 만드는 우주.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=85',
    height: '220px',
  },
  {
    tag: '#도쿄야시장',
    title: '야간 그루밍 마켓',
    desc: '히비야 파크 야외 마켓, 요요기 파크 파머스 마켓. 주말마다 열리는 로컬 마켓은 도쿄의 새로운 사교 공간.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85',
    height: '320px',
  },
  {
    tag: '#오모테산도힐즈',
    title: '아키텍처 쇼핑',
    desc: '안도 다다오 설계의 오모테산도 힐즈. 쇼핑몰이 건축 기행의 목적지가 되는 도시, 도쿄.',
    image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&q=85',
    height: '240px',
  },
  {
    tag: '#신주쿠골든가이',
    title: '골목 이자카야 문화',
    desc: '200개 남짓한 작은 바가 밀집한 골든 가이. 낯선 이와 술잔 기울이는 것이 이 골목의 예절이다.',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=85',
    height: '300px',
  },
  {
    tag: '#도쿄빈티지',
    title: '고수의 빈티지 헌팅',
    desc: '시모키타자와 빈티지 메카. 플리크 빈티지, 레트로픽, 비스. 1980~90년대 일본 데님과 아메카지를 찾아라.',
    image: 'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800&q=85',
    height: '260px',
  },
]

export default function Tokyo2026Page() {
  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}
      style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D', backgroundColor: '#FAFAF8' }}
    >
      <ScrollAnimator />

      {/* HERO — 100vh fullscreen */}
      <section className="relative h-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=90"
          alt="Tokyo skyline at night"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
        />
        {/* Issue badge */}
        <div className="absolute top-8 right-8 text-right">
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.55)', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 300 }}>
            VOYRA MAGAZINE
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.55)', fontSize: '10px', letterSpacing: '0.15em' }}>
            TOKYO ISSUE 2026
          </p>
        </div>
        {/* Hero text — bottom left */}
        <div className="absolute bottom-0 left-0 p-10 md:p-16 max-w-3xl">
          <p
            className="mb-4"
            style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '11px', letterSpacing: '0.3em', fontWeight: 400 }}
          >
            SPECIAL EDITION
          </p>
          <h1
            className="mb-6 leading-none"
            style={{
              fontFamily: 'var(--font-playfair)',
              color: '#FFFFFF',
              fontSize: 'clamp(52px, 9vw, 120px)',
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            Tokyo
            <br />
            <span style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '0.55em', letterSpacing: '0.08em' }}>2026</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            세계에서 가장 복잡하고 아름다운 도시,<br />
            그 모든 것을 담은 완벽한 가이드
          </p>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2">
          <div className="w-px h-16 bg-white opacity-40" />
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '0.25em', writingMode: 'vertical-rl' }}>
            SCROLL
          </p>
        </div>
      </section>

      {/* MAIN LAYOUT — sidebar TOC + content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex gap-12 lg:gap-20">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-48 shrink-0 pt-20">
            <TOC sections={TOC_SECTIONS} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ── CHAPTER 1: TOKYO NOW ── */}
            <section id="ch1" className="py-20 md:py-28">
              <div className="fade-up">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 01
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#1A1A2E',
                  }}
                  className="mb-8"
                >
                  Tokyo
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Now</em>
                </h2>
              </div>

              {/* 50/50 split layout */}
              <div className="grid lg:grid-cols-2 gap-0 items-stretch mt-12 fade-up">
                {/* Text side */}
                <div
                  className="p-10 md:p-14 flex flex-col justify-center"
                  style={{ backgroundColor: '#1A1A2E' }}
                >
                  <p
                    className="mb-6"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      color: '#C9A96E',
                      fontSize: 'clamp(24px, 3.5vw, 42px)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      lineHeight: 1.35,
                    }}
                  >
                    "도쿄는 끊임없이<br />자신을 재발명한다."
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.8, fontWeight: 300 }}>
                    2026년의 도쿄는 2020 올림픽 이후 더욱 세련되어졌다. 시부야 재개발 3기가 마무리되고, 팀랩 플래닛은 세계 최고 몰입형 미술관으로 자리잡았다. 도쿄의 오래된 것들은 여전히 완벽하게 작동하고, 새로운 것들은 더 대담해졌다.
                  </p>
                  <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(201,169,110,0.3)' }}>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { num: '14M', label: '연간 방문자' },
                        { num: '23区', label: '도쿄 구역' },
                        { num: '200+', label: '미슐랭 레스토랑' },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p style={{ fontFamily: 'var(--font-playfair)', color: '#C9A96E', fontSize: '28px', fontWeight: 700 }}>{stat.num}</p>
                          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.45)', fontSize: '11px', letterSpacing: '0.1em' }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Image side */}
                <div className="relative h-[440px] lg:h-auto lg:min-h-[440px]">
                  <Image
                    src="https://images.unsplash.com/photo-1533050487297-09b450131914?w=900&q=90"
                    alt="Tokyo streets"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Pull quote */}
              <div className="mt-20 fade-up text-center max-w-2xl mx-auto">
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(22px, 3.5vw, 36px)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: '#1A1A2E',
                    lineHeight: 1.55,
                  }}
                >
                  가장 오래된 전통과 가장 새로운 기술이<br />한 골목 안에 공존하는 유일한 도시.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="h-px w-12" style={{ backgroundColor: '#C9A96E' }} />
                  <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '11px', letterSpacing: '0.2em' }}>VOYRA EDITORIAL</p>
                  <div className="h-px w-12" style={{ backgroundColor: '#C9A96E' }} />
                </div>
              </div>
            </section>

            {/* ── CHAPTER 2: THE DISTRICTS ── */}
            <section id="ch2" className="py-4">
              <div className="fade-up mb-16 py-16">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 02
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#1A1A2E',
                  }}
                >
                  The
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Districts</em>
                </h2>
                <p className="mt-6 max-w-xl" style={{ fontFamily: 'var(--font-inter)', color: '#6B7280', fontSize: '15px', lineHeight: 1.8 }}>
                  도쿄의 각 동네는 마치 독립된 도시처럼 각자의 문화와 정체성을 갖는다. 5개의 핵심 구역을 소개한다.
                </p>
              </div>

              <div className="space-y-0 -mx-4 md:-mx-8 lg:-mx-12">
                {DISTRICTS.map((district, i) => {
                  if (district.layout === 'fullscreen') {
                    return (
                      <div key={district.name} className="relative h-[85vh] overflow-hidden fade-up">
                        <Image src={district.image} alt={district.name} fill className="object-cover" />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 65%, transparent 100%)' }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20 max-w-2xl">
                          <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.4em', fontWeight: 500 }} className="mb-3">
                            {String(i + 1).padStart(2, '0')} / {district.nameEn}
                          </p>
                          <h3
                            style={{
                              fontFamily: 'var(--font-playfair)',
                              color: '#FFFFFF',
                              fontSize: 'clamp(44px, 8vw, 96px)',
                              fontWeight: 700,
                              lineHeight: 1,
                            }}
                            className="mb-4"
                          >
                            {district.name}
                          </h3>
                          <p style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(255,255,255,0.75)', fontSize: '21px', fontStyle: 'italic' }} className="mb-4">
                            {district.tagline}
                          </p>
                          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.62)', fontSize: '14px', lineHeight: 1.75 }}>
                            {district.description}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  if (district.layout === 'split') {
                    const isEven = i % 2 === 0
                    const isDark = i === 3
                    return (
                      <div key={district.name} className="grid md:grid-cols-2 fade-up">
                        <div className={`relative h-[55vh] md:h-[65vh] ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                          <Image src={district.image} alt={district.name} fill className="object-cover" />
                        </div>
                        <div
                          className={`flex flex-col justify-center px-10 md:px-14 py-14 ${isEven ? 'md:order-2' : 'md:order-1'}`}
                          style={{ backgroundColor: isDark ? '#1A1A2E' : '#F5F0E8' }}
                        >
                          <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.4em', fontWeight: 500 }} className="mb-3">
                            {String(i + 1).padStart(2, '0')} / {district.nameEn}
                          </p>
                          <h3
                            style={{
                              fontFamily: 'var(--font-playfair)',
                              color: isDark ? '#FFFFFF' : '#1A1A2E',
                              fontSize: 'clamp(32px, 5vw, 64px)',
                              fontWeight: 700,
                              lineHeight: 1.05,
                            }}
                            className="mb-3"
                          >
                            {district.name}
                          </h3>
                          <p style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A96E', fontSize: '20px', fontStyle: 'italic' }} className="mb-4">
                            {district.tagline}
                          </p>
                          <p style={{ fontFamily: 'var(--font-inter)', color: isDark ? 'rgba(255,255,255,0.62)' : '#6B7280', fontSize: '14px', lineHeight: 1.78 }}>
                            {district.description}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  // centered overlay
                  return (
                    <div key={district.name} className="relative h-[72vh] overflow-hidden fade-up">
                      <Image src={district.image} alt={district.name} fill className="object-cover" />
                      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.48)' }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.4em', fontWeight: 500 }} className="mb-3">
                          {String(i + 1).padStart(2, '0')} / {district.nameEn}
                        </p>
                        <h3
                          style={{
                            fontFamily: 'var(--font-playfair)',
                            color: '#FFFFFF',
                            fontSize: 'clamp(44px, 8vw, 96px)',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                          className="mb-3"
                        >
                          {district.name}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(255,255,255,0.8)', fontSize: '22px', fontStyle: 'italic' }} className="mb-4">
                          {district.tagline}
                        </p>
                        <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.62)', fontSize: '14px', lineHeight: 1.75, maxWidth: '500px' }}>
                          {district.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── CHAPTER 3: TASTE OF TOKYO ── */}
            <section
              id="ch3"
              className="py-20 md:py-28 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12"
              style={{ backgroundColor: '#1A1A2E' }}
            >
              <div className="fade-up mb-16">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 03
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#FFFFFF',
                  }}
                >
                  Taste of
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Tokyo</em>
                </h2>
                <p className="mt-6 max-w-xl" style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.8 }}>
                  세계 최다 미슐랭 레스토랑의 도시. 한국인이 사랑하는 도쿄 맛집 정수를 모았다.
                </p>
              </div>

              <div className="space-y-16">
                {RESTAURANTS.map((cat) => (
                  <div key={cat.category} className="fade-up">
                    <div className="flex items-baseline gap-4 mb-8">
                      <h3
                        style={{
                          fontFamily: 'var(--font-playfair)',
                          color: '#C9A96E',
                          fontSize: 'clamp(20px, 3vw, 30px)',
                          fontWeight: 700,
                          fontStyle: 'italic',
                        }}
                      >
                        {cat.category}
                      </h3>
                      <span style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.2)', fontSize: '11px', letterSpacing: '0.25em' }}>
                        {cat.categoryEn}
                      </span>
                    </div>

                    <div className={`grid gap-6 ${cat.items.length === 1 ? 'md:grid-cols-1 max-w-lg' : 'md:grid-cols-2'}`}>
                      {cat.items.map((item) => (
                        <div
                          key={item.name}
                          className="overflow-hidden group"
                          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.15)' }}
                        >
                          <div className="relative h-52 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <h4 style={{ fontFamily: 'var(--font-playfair)', color: '#FFFFFF', fontSize: '20px', fontWeight: 700 }}>
                                {item.name}
                              </h4>
                              <span style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '11px', backgroundColor: 'rgba(201,169,110,0.12)', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                                {item.location}
                              </span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(255,255,255,0.55)', fontSize: '16px', fontStyle: 'italic' }} className="mb-3">
                              {item.menu}
                            </p>
                            <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.72 }} className="mb-4">
                              {item.reason}
                            </p>
                            <div className="flex gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                              <div>
                                <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.25)', fontSize: '10px', letterSpacing: '0.12em' }}>PRICE</p>
                                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '13px', fontWeight: 500 }}>{item.price}</p>
                              </div>
                              <div>
                                <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.25)', fontSize: '10px', letterSpacing: '0.12em' }}>WAIT</p>
                                <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{item.waiting}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CHAPTER 4: SHOPPING EDIT ── */}
            <section id="ch4" className="py-20 md:py-28">
              <div className="fade-up mb-16">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 04
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#1A1A2E',
                  }}
                >
                  Shopping
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Edit</em>
                </h2>
                <p className="mt-6 max-w-xl" style={{ fontFamily: 'var(--font-inter)', color: '#6B7280', fontSize: '15px', lineHeight: 1.8 }}>
                  드럭스토어부터 명품 플래그십까지. 도쿄 쇼핑의 정수 세 곳.
                </p>
              </div>

              <div className="-mx-4 md:-mx-8 lg:-mx-12 fade-up">
                {SHOPPING.map((item, i) => (
                  <div
                    key={item.title}
                    className="grid md:grid-cols-5 items-stretch"
                  >
                    <div className={`relative h-64 md:h-80 md:col-span-3 ${i % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <span
                          style={{
                            fontFamily: 'var(--font-inter)',
                            backgroundColor: '#C9A96E',
                            color: '#1A1A2E',
                            fontSize: '9px',
                            letterSpacing: '0.18em',
                            fontWeight: 700,
                            padding: '4px 10px',
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`md:col-span-2 flex flex-col justify-center px-10 md:px-12 py-12 ${i % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
                      style={{
                        backgroundColor: i === 1 ? '#1A1A2E' : i === 2 ? '#F5F0E8' : '#FAFAF8',
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.3em', fontWeight: 500 }} className="mb-3">
                        {item.label}
                      </p>
                      <h3
                        style={{
                          fontFamily: 'var(--font-playfair)',
                          color: i === 1 ? '#FFFFFF' : '#1A1A2E',
                          fontSize: 'clamp(22px, 3.5vw, 36px)',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                        className="mb-2"
                      >
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A96E', fontSize: '17px', fontStyle: 'italic' }} className="mb-4">
                        {item.subtitle}
                      </p>
                      <p style={{ fontFamily: 'var(--font-inter)', color: i === 1 ? 'rgba(255,255,255,0.58)' : '#6B7280', fontSize: '14px', lineHeight: 1.8 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CHAPTER 5: 4 DAYS IN TOKYO ── */}
            <section
              id="ch5"
              className="py-20 md:py-28 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12"
              style={{ backgroundColor: '#F5F0E8' }}
            >
              <div className="fade-up mb-16">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 05
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#1A1A2E',
                  }}
                >
                  4 Days in
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Tokyo</em>
                </h2>
                <p className="mt-6 max-w-xl" style={{ fontFamily: 'var(--font-inter)', color: '#6B7280', fontSize: '15px', lineHeight: 1.8 }}>
                  4박 5일, 도쿄의 핵심만 담은 완벽한 일정표. 이동 동선과 예약 팁까지 포함했다.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 fade-up">
                {ITINERARY.map((day) => (
                  <div key={day.day} className="p-8" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex items-baseline gap-4 mb-6 pb-5" style={{ borderBottom: `2px solid ${day.color}` }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-playfair)',
                          fontSize: '52px',
                          fontWeight: 900,
                          color: '#E8E4DE',
                          lineHeight: 1,
                        }}
                      >
                        {day.day.split(' ')[1]}
                      </span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#9CA3AF', fontSize: '10px', letterSpacing: '0.2em' }}>{day.day}</p>
                        <p style={{ fontFamily: 'var(--font-playfair)', color: '#1A1A2E', fontSize: '19px', fontWeight: 700 }}>{day.theme}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {day.schedule.map((item) => (
                        <div key={item.time + item.place} className="flex gap-4">
                          <span
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: day.color,
                              fontSize: '12px',
                              fontWeight: 600,
                              minWidth: '46px',
                              paddingTop: '2px',
                            }}
                          >
                            {item.time}
                          </span>
                          <div>
                            <p style={{ fontFamily: 'var(--font-inter)', color: '#1A1A2E', fontSize: '14px', fontWeight: 500 }}>{item.place}</p>
                            <p style={{ fontFamily: 'var(--font-inter)', color: '#9CA3AF', fontSize: '13px', lineHeight: 1.5 }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CHAPTER 6: SOCIAL TREND ── */}
            <section id="ch6" className="py-20 md:py-28">
              <div className="fade-up mb-16">
                <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 500 }} className="mb-3">
                  CHAPTER 06
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: '#1A1A2E',
                  }}
                >
                  Social
                  <br />
                  <em style={{ fontWeight: 400, color: '#C9A96E' }}>Trend</em>
                </h2>
                <p className="mt-6 max-w-xl" style={{ fontFamily: 'var(--font-inter)', color: '#6B7280', fontSize: '15px', lineHeight: 1.8 }}>
                  인스타그램과 유튜브를 뜨겁게 달구는 도쿄의 트렌드 키워드 6.
                </p>
              </div>

              {/* Pinterest masonry grid */}
              <div className="fade-up masonry-grid">
                {TRENDS.map((trend) => (
                  <div
                    key={trend.tag}
                    className="break-inside-avoid mb-4 overflow-hidden group"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div className="relative overflow-hidden" style={{ height: trend.height }}>
                      <Image
                        src={trend.image}
                        alt={trend.tag}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5" style={{ backgroundColor: '#FAFAF8' }}>
                      <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '11px', fontWeight: 500 }} className="mb-1">
                        {trend.tag}
                      </p>
                      <h4 style={{ fontFamily: 'var(--font-playfair)', color: '#1A1A2E', fontSize: '17px', fontWeight: 700 }} className="mb-2">
                        {trend.title}
                      </h4>
                      <p style={{ fontFamily: 'var(--font-inter)', color: '#6B7280', fontSize: '13px', lineHeight: 1.7 }}>
                        {trend.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ── MAGAZINE FOOTER ── */}
      <footer style={{ backgroundColor: '#1A1A2E' }}>
        {/* Full-width image strip */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=75"
            alt="Tokyo"
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2
              style={{
                fontFamily: 'var(--font-playfair)',
                color: '#FFFFFF',
                fontSize: 'clamp(28px, 5vw, 56px)',
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
              }}
            >
              Tokyo is waiting.
            </h2>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 md:px-12 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', color: '#FFFFFF', fontSize: '22px', fontWeight: 700 }} className="mb-2">
                Voyra
              </p>
              <p style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(255,255,255,0.38)', fontSize: '15px', fontStyle: 'italic' }}>
                여행의 모든 영감
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 500 }} className="mb-3">
                EXPLORE
              </p>
              <div className="space-y-2">
                {[
                  { label: '도쿄 여행 아티클', href: '/article?city=tokyo' },
                  { label: '매거진 허브', href: '/magazine' },
                  { label: '커뮤니티', href: '/community' },
                ].map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', color: '#C9A96E', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 500 }} className="mb-3">
                DISCLAIMER
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.28)', fontSize: '12px', lineHeight: 1.72 }}>
                이 페이지의 정보는 2026년 기준으로 작성되었습니다. 가격·운영시간은 현지 확인을 권장합니다.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.22)', fontSize: '12px' }}>
              © 2026 Voyra. All rights reserved.
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(255,255,255,0.18)', fontSize: '11px', letterSpacing: '0.15em' }}>
              TOKYO ISSUE — JUNE 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

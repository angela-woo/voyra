'use client'

import { usePathname } from 'next/navigation'

export type Locale = 'ko' | 'en'

const translations = {
  ko: {
    nav_home: '홈',
    nav_articles: '여행 가이드',
    nav_destinations: '여행 일정',
    nav_community: '커뮤니티',
    hero_title: '어디로 떠나고 싶으세요?',
    hero_subtitle: '엄선된 여행 가이드로 완벽한 여행을 계획하세요',
    hero_search: '도시 또는 나라를 검색하세요',
    popular_destinations: '인기 여행지',
    popular_destinations_sub: '지금 가장 많이 찾는 여행지',
    trending: '지금 뜨는 여행지',
    trending_sub: '가장 많이 조회된 여행 일정',
    latest_articles: '최신 여행 가이드',
    latest_articles_sub: '전문가가 엄선한 여행 정보',
    popular_plans: '인기 여행 일정',
    popular_plans_sub: '여행자들이 가장 많이 찾는 일정',
    top_attractions: '인기 관광 명소',
    top_attractions_sub: '여행자들이 추천하는 관광 명소 TOP 10',
    see_all: '전체 보기',
    see_more: '더보기',
    book_now: '예약하기',
    view_map: '구글맵에서 보기',
    days: '일',
    itineraries_count: '여행 일정',
    no_articles: '아직 게시된 가이드가 없습니다.',
    login: '로그인',
    signup: '회원가입',
    profile: '프로필',
    logout: '로그아웃',
  },
  en: {
    nav_home: 'Home',
    nav_articles: 'Travel Guides',
    nav_destinations: 'Itineraries',
    nav_community: 'Community',
    hero_title: 'Where do you want to go?',
    hero_subtitle: 'Discover curated travel guides for every destination',
    hero_search: 'Search cities or countries',
    popular_destinations: 'Popular Destinations',
    popular_destinations_sub: 'Most visited destinations right now',
    trending: 'Trending Now',
    trending_sub: 'Most viewed travel itineraries',
    latest_articles: 'Latest Travel Guides',
    latest_articles_sub: 'Expertly curated travel information',
    popular_plans: 'Popular Itineraries',
    popular_plans_sub: 'Top-rated itineraries from travelers',
    top_attractions: 'Top Attractions',
    top_attractions_sub: 'Traveler-recommended attractions — TOP 10',
    see_all: 'See All',
    see_more: 'See More',
    book_now: 'Book Now',
    view_map: 'View on Google Maps',
    days: ' days',
    itineraries_count: 'itineraries',
    no_articles: 'No guides published yet.',
    login: 'Log In',
    signup: 'Sign Up',
    profile: 'Profile',
    logout: 'Log Out',
  },
} as const

export type TranslationKey = keyof typeof translations.ko

export function useLocale(): Locale {
  const pathname = usePathname()
  return pathname.startsWith('/en') ? 'en' : 'ko'
}

export function useTranslation() {
  const locale = useLocale()
  const t = (key: TranslationKey) => translations[locale][key]
  return { t, locale }
}

export function getTranslations(locale: Locale) {
  return translations[locale]
}

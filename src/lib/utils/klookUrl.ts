const KLOOK_AFF_ID = '121117'

export function getKlookUrl(query: string, locale: 'ko' | 'en' = 'ko'): string {
  const base = locale === 'ko'
    ? 'https://www.klook.com/ko/search/'
    : 'https://www.klook.com/en-US/search/'
  return `${base}?query=${encodeURIComponent(query)}&aff_id=${KLOOK_AFF_ID}`
}

export function getKlookCityUrl(cityKo: string, cityEn: string, locale: 'ko' | 'en' = 'ko'): string {
  return getKlookUrl(locale === 'ko' ? cityKo : cityEn, locale)
}

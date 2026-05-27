const AWIN_AID = '2892557'

export function getBookingUrl(query: string, locale: 'ko' | 'en' = 'ko'): string {
  const lang = locale === 'ko' ? 'ko' : 'en-us'
  return `https://www.booking.com/searchresults.${lang}.html?aid=${AWIN_AID}&ss=${encodeURIComponent(query)}`
}

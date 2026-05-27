'use client'

import { Plane, ExternalLink } from 'lucide-react'

interface FlightSearchWidgetProps {
  city: string
  cityEn: string
  countryEn?: string
  locale?: 'ko' | 'en'
}

const AIRPORT_CODES: Record<string, string> = {
  // 일본
  tokyo: 'TYO', osaka: 'OSA', kyoto: 'OSA', fukuoka: 'FUK',
  sapporo: 'CTS', nagoya: 'NGO', okinawa: 'OKA',
  // 한국
  seoul: 'SEL', busan: 'PUS', jeju: 'CJU',
  // 동남아
  bangkok: 'BKK', chiangmai: 'CNX', bali: 'DPS', singapore: 'SIN',
  danang: 'DAD', hanoi: 'HAN', hochiminh: 'SGN', nhatrang: 'CXR',
  cebu: 'CEB', boracay: 'MPH', manila: 'MNL',
  // 대만 / 괌 / 사이판
  taipei: 'TPE', taichung: 'RMQ', guam: 'GUM', saipan: 'SPN',
  // 유럽
  paris: 'PAR', london: 'LON', barcelona: 'BCN', rome: 'ROM',
  amsterdam: 'AMS', berlin: 'BER', madrid: 'MAD', lisbon: 'LIS',
  vienna: 'VIE', prague: 'PRG', budapest: 'BUD', zurich: 'ZRH',
  copenhagen: 'CPH', stockholm: 'STO', helsinki: 'HEL', oslo: 'OSL',
  // 중동 / 미주 / 호주
  dubai: 'DXB', istanbul: 'IST', newyork: 'NYC', sydney: 'SYD', melbourne: 'MEL',
}

const FLIGHT_HOURS: Record<string, string> = {
  tokyo: '약 2시간 30분', osaka: '약 2시간', fukuoka: '약 1시간 30분',
  sapporo: '약 3시간', nagoya: '약 2시간 20분', okinawa: '약 2시간 30분',
  bangkok: '약 6시간', bali: '약 7시간', singapore: '약 6시간 30분',
  danang: '약 5시간', hanoi: '약 5시간', hochiminh: '약 5시간 30분',
  cebu: '약 4시간', taipei: '약 2시간 30분', guam: '약 4시간', saipan: '약 4시간 30분',
  paris: '약 12시간', london: '약 12시간', barcelona: '약 13시간',
  rome: '약 12시간', dubai: '약 9시간', istanbul: '약 11시간',
}

export default function FlightSearchWidget({
  city,
  cityEn,
  countryEn = '',
  locale = 'ko',
}: FlightSearchWidgetProps) {
  if (!city && !cityEn) return null

  const isEn = locale === 'en'
  const cityKey = cityEn.toLowerCase().replace(/[\s-]+/g, '')
  const airportCode = AIRPORT_CODES[cityKey] ?? cityEn.toUpperCase().slice(0, 3)
  const flightTime = FLIGHT_HOURS[cityKey]
  const cityDisplay = cityEn.charAt(0).toUpperCase() + cityEn.slice(1)

  const skyscannerUrl = isEn
    ? `https://www.skyscanner.net/flights/anywhere/${airportCode.toLowerCase()}/`
    : `https://www.skyscanner.co.kr/flights/icn/${airportCode.toLowerCase()}/`

  const roundTripUrl = `${skyscannerUrl}?adults=1`

  return (
    <div
      className="my-8 overflow-hidden border border-gray-100"
      style={{ borderRadius: 'var(--radius)' }}
    >
      {/* 헤더 */}
      <div
        className="p-4 text-white"
        style={{ background: 'linear-gradient(135deg, #0770E3 0%, #05C3DE 100%)' }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Plane className="w-5 h-5" />
          <span className="font-bold text-lg">
            {isEn ? `Flights to ${cityDisplay}` : `${city} 항공권 검색`}
          </span>
        </div>
        {!isEn && flightTime && (
          <p className="text-white/80 text-sm">인천 출발 {flightTime} 소요</p>
        )}
        {isEn && (
          <p className="text-white/80 text-sm">Compare all airlines · Best prices</p>
        )}
      </div>

      {/* 카드 영역 */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={skyscannerUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-100 text-center transition-all hover:border-blue-400 hover:bg-blue-50"
          >
            <Plane className="w-6 h-6 text-blue-500 mb-1" />
            <span className="font-semibold text-sm">
              {isEn ? 'Cheapest Flights' : '최저가 항공권'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {isEn ? 'Compare all airlines' : '전 항공사 비교'}
            </span>
          </a>

          <a
            href={roundTripUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-100 text-center transition-all hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="text-2xl mb-1">✈️</span>
            <span className="font-semibold text-sm">
              {isEn ? 'Round Trip' : '왕복 항공권'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {isEn ? 'Best deals' : '최적 가격'}
            </span>
          </a>
        </div>

        <a
          href={skyscannerUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#0770E3' }}
        >
          <ExternalLink className="w-4 h-4" />
          {isEn
            ? `Search ${cityDisplay} Flights on Skyscanner`
            : `Skyscanner에서 ${city} 항공권 검색하기`}
        </a>

        <p className="text-xs text-gray-400 text-center mt-2">
          {isEn ? 'Powered by Skyscanner' : 'Skyscanner 제공 · 파트너 링크'}
        </p>
      </div>
    </div>
  )
}

import { Wifi, ExternalLink } from 'lucide-react'

interface ESimBannerProps {
  locale?: 'ko' | 'en'
  city?: string | null
}

export default function ESimBanner({ locale = 'ko', city }: ESimBannerProps) {
  const isEn = locale === 'en'

  const content = {
    ko: {
      title: '여행 전 eSIM 미리 준비하세요!',
      desc: city
        ? `${city} 여행, 현지 유심 없이 즉시 연결. 한국에서 미리 구매하고 떠나세요.`
        : '현지 유심 없이 즉시 연결. 한국에서 미리 구매하고 떠나세요.',
      btn: 'Klook에서 eSIM 구매하기',
      url: 'https://www.klook.com/ko/esim/?aff_id=121117',
    },
    en: {
      title: 'Stay Connected with eSIM!',
      desc: city
        ? `Traveling to ${city}? Skip the local SIM hassle. Get your eSIM before you travel.`
        : 'Skip the local SIM hassle. Get your eSIM before you travel.',
      btn: 'Get eSIM on Klook',
      url: 'https://www.klook.com/en-US/esim/?aff_id=121117',
    },
  }

  const c = isEn ? content.en : content.ko

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block w-full rounded-xl p-4 my-6 transition-transform hover:scale-[1.01]"
      style={{ background: 'linear-gradient(135deg, #FF5722, #FF8A65)' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/20 rounded-lg p-2 shrink-0">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm md:text-base">
              📶 {c.title}
            </div>
            <div className="text-white/90 text-xs md:text-sm mt-0.5 line-clamp-2">
              {c.desc}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white text-orange-600 font-bold text-xs md:text-sm px-3 py-2 rounded-lg whitespace-nowrap shrink-0">
          {c.btn}
          <ExternalLink className="w-3 h-3 ml-1" />
        </div>
      </div>
    </a>
  )
}

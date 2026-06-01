import Link from 'next/link'

export default function Footer({ siteName }: { siteName: string }) {
  return (
    <footer style={{ backgroundColor: '#1a1a1a' }} className="text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {siteName}
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              엄선한 여행 가이드로 세계를 탐험하세요.<br />
              숨겨진 명소부터 현지 맛집까지 모두 담았습니다.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">메뉴</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">홈</Link></li>
              <li><Link href="/articles" className="hover:text-white transition-colors">여행 가이드</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">여행 일정</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">커뮤니티</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">안내</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">서비스 소개</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
            </ul>
          </div>
        </div>

        {/* 인기 여행지 & 테마 */}
        <div className="border-t border-white/10 mt-10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">인기 여행지</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {[
                { name: '도쿄', href: '/destinations/japan/tokyo' },
                { name: '오사카', href: '/destinations/japan/osaka' },
                { name: '파리', href: '/destinations/france/paris' },
                { name: '발리', href: '/destinations/indonesia/bali' },
                { name: '방콕', href: '/destinations/thailand/bangkok' },
                { name: '다낭', href: '/destinations/vietnam/da-nang' },
                { name: '싱가포르', href: '/destinations/singapore/singapore' },
                { name: '서울', href: '/destinations/korea/seoul' },
              ].map(c => (
                <Link key={c.name} href={c.href} className="hover:text-white transition-colors">{c.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">인기 여행 테마</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {[
                { name: '커플여행', href: '/destinations?type=couple' },
                { name: '가족여행', href: '/destinations?type=family' },
                { name: '혼자여행', href: '/destinations?type=solo' },
                { name: '친구여행', href: '/destinations?type=friends' },
                { name: '허니문', href: '/destinations?type=couple' },
              ].map(t => (
                <Link key={t.name} href={t.href} className="hover:text-white transition-colors">{t.name}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-gray-600 space-y-2">
          <p>본 사이트는 Google AdSense 광고를 사용합니다. 일부 링크는 제휴 링크로, 구매 시 소정의 수수료를 받을 수 있습니다.</p>
          <p>© 2026 {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

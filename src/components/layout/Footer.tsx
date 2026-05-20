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
              AI가 큐레이션한 여행 가이드로 세계를 탐험하세요.<br />
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
              <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-600">
          © 2025 {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { Globe } from 'lucide-react'

export default function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="border-t border-gray-200 bg-[var(--bg-secondary)] mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[var(--primary)] mb-3">
              <Globe className="w-5 h-5" />
              <span style={{ fontFamily: 'var(--font-heading)' }}>{siteName}</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI 기반 여행 가이드로 세계를 탐험하세요.<br />
              믿을 수 있는 여행 정보와 생생한 현지 경험을 제공합니다.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">탐색</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-[var(--primary)]">홈</Link></li>
              <li><Link href="/community" className="hover:text-[var(--primary)]">커뮤니티</Link></li>
              <li><Link href="/about" className="hover:text-[var(--primary)]">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">법적 고지</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-[var(--primary)]">개인정보처리방침</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--primary)]">문의하기</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

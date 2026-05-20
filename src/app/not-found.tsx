import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <MapPin className="w-12 h-12 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--primary-hover)] transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-gray-500 mb-6">일시적인 오류입니다. 다시 시도해주세요.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--primary-hover)] transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}

'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="ko">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-2">심각한 오류가 발생했습니다</h2>
          <p className="text-sm text-gray-500 mb-6">페이지를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => reset()}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}

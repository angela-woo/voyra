'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string | null
  locale?: 'ko' | 'en'
}

const OG_IMAGE = 'https://kiravoy.com/og-image.jpg'

export default function ShareButtons({ url, title, description, locale = 'ko' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [kakaoReady, setKakaoReady] = useState(false)

  useEffect(() => {
    const check = setInterval(() => {
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY!)
        }
        setKakaoReady(true)
        clearInterval(check)
      }
    }, 100)
    return () => clearInterval(check)
  }, [])

  const shareKakao = useCallback(() => {
    if (!kakaoReady || !window.Kakao) {
      window.open(
        `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
        '_blank',
        'width=500,height=600',
      )
      return
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description: description ?? '',
        imageUrl: OG_IMAGE,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        {
          title: locale === 'ko' ? '자세히 보기' : 'View more',
          link: { mobileWebUrl: url, webUrl: url },
        },
      ],
    })
  }, [kakaoReady, url, title, description, locale])

  const shareX = () => {
    const text = encodeURIComponent(`${title}\n${url}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener',
    )
  }

  const shareLine = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener',
    )
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-sm text-gray-500 font-medium mr-1">
        {locale === 'ko' ? '공유' : 'Share'}
      </span>

      {/* KakaoTalk */}
      <button
        onClick={shareKakao}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
        style={{ backgroundColor: '#FEE500' }}
        aria-label="KakaoTalk"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
          <path d="M12 3C6.477 3 2 6.477 2 10.917c0 2.827 1.708 5.325 4.32 6.849l-.95 3.564c-.085.316.298.568.57.38L10.013 19.5c.647.09 1.31.14 1.987.14 5.523 0 10-3.477 10-7.723C22 6.477 17.523 3 12 3z" />
        </svg>
      </button>

      {/* X (Twitter) */}
      <button
        onClick={shareX}
        className="w-9 h-9 rounded-full bg-black flex items-center justify-center transition-opacity hover:opacity-75"
        aria-label="X (Twitter)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={shareFacebook}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
        style={{ backgroundColor: '#1877F2' }}
        aria-label="Facebook"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      </button>

      {/* LINE */}
      <button
        onClick={shareLine}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
        style={{ backgroundColor: '#00B900' }}
        aria-label="LINE"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.619.619 0 01-.686-.215l-2.202-2.983v2.602c0 .346-.283.629-.629.629-.345 0-.629-.283-.629-.629V8.108c0-.27.174-.51.432-.596a.625.625 0 01.685.215l2.202 2.98V8.108c0-.345.282-.63.63-.63.344 0 .629.285.629.63v4.771zm-5.741 0c0 .346-.285.629-.63.629-.345 0-.627-.283-.627-.629V8.108c0-.345.282-.63.63-.63.344 0 .627.285.627.63v4.771zm-2.466.629H4.917c-.345 0-.63-.283-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .346-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center transition-opacity hover:opacity-75"
        aria-label={locale === 'ko' ? '링크 복사' : 'Copy link'}
      >
        {copied
          ? <Check className="w-4 h-4 text-green-600" />
          : <Link2 className="w-4 h-4 text-gray-600" />}
      </button>
    </div>
  )
}

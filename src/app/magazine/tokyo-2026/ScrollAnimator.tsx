'use client'

import { useEffect } from 'react'

export default function ScrollAnimator() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fade-up')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.06 },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}

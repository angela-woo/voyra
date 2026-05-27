import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  includeJsonLd?: boolean
}

export default function Breadcrumb({ items, includeJsonLd = true }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://kiravoy.com${item.href}` } : {}),
    })),
  }

  return (
    <>
      {includeJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <nav className="max-w-6xl mx-auto px-4 pt-4 pb-2" aria-label="breadcrumb">
        <ol className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
              {item.href && i < items.length - 1 ? (
                <Link href={item.href} className="hover:text-[#FF5722] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={i === items.length - 1 ? 'text-gray-800 font-medium line-clamp-1' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

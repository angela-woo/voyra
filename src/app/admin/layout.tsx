import Link from 'next/link'
import { LayoutDashboard, Palette, FileText, Star, Settings } from 'lucide-react'

const adminNav = [
  { href: '/admin/articles', label: '아티클 관리', icon: <FileText className="w-4 h-4" /> },
  { href: '/admin/reviews', label: '리뷰 관리', icon: <Star className="w-4 h-4" /> },
  { href: '/admin/design', label: '디자인 설정', icon: <Palette className="w-4 h-4" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm text-gray-300 hover:text-white">
            <LayoutDashboard className="w-4 h-4" />
            Voyra Admin
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}

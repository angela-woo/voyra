import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const STATUS_CONFIG = {
  unread:  { label: '미확인', className: 'bg-red-50 text-red-600' },
  read:    { label: '확인됨', className: 'bg-yellow-50 text-yellow-600' },
  replied: { label: '답변완료', className: 'bg-green-50 text-green-600' },
} as const

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const { status } = await searchParams

  let query = adminSupabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: messages } = await query

  const tabs = [
    { value: 'all', label: '전체' },
    { value: 'unread', label: '미확인' },
    { value: 'read', label: '확인됨' },
    { value: 'replied', label: '답변완료' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">문의 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {messages?.length ?? 0}건</p>
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-2 mb-5">
        {tabs.map(tab => {
          const active = (!status || status === 'all') ? tab.value === 'all' : status === tab.value
          return (
            <Link
              key={tab.value}
              href={tab.value === 'all' ? '/admin/inquiries' : `/admin/inquiries?status=${tab.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">이름</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">이메일</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">제목</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">접수일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(messages ?? []).map(msg => {
              const cfg = STATUS_CONFIG[msg.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.unread
              return (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{msg.name}</td>
                  <td className="px-4 py-3 text-gray-600">{msg.email}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquiries/${msg.id}`} className="text-gray-800 hover:text-blue-600 hover:underline font-medium">
                      {msg.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ko })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!messages || messages.length === 0) && (
          <div className="text-center py-12 text-gray-400">문의가 없습니다.</div>
        )}
      </div>
    </div>
  )
}

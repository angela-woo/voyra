'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Check, Mail, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'unread', label: '미확인', className: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'read', label: '확인됨', className: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { value: 'replied', label: '답변완료', className: 'bg-green-50 text-green-600 border-green-200' },
]

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [msg, setMsg] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    supabase.from('contact_messages').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (!data) { router.push('/admin/inquiries'); return }
        setMsg(data)
      })
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdating(false)
    if (!res.ok) { toast.error('상태 변경에 실패했습니다.'); return }
    setMsg((prev: typeof msg) => ({ ...prev, status }))
    toast.success('상태가 변경되었습니다.')
  }

  if (!msg) return (
    <div className="p-8 text-gray-400">불러오는 중...</div>
  )

  const currentStatus = STATUS_OPTIONS.find(s => s.value === msg.status) ?? STATUS_OPTIONS[0]

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/inquiries" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{msg.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {msg.name} ({msg.email})</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(msg.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
              </span>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* 본문 */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {msg.message}
        </div>
      </div>

      {/* 상태 변경 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">상태 변경</p>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              disabled={updating || msg.status === opt.value}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 ${
                msg.status === opt.value
                  ? opt.className + ' cursor-default'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {msg.status === opt.value && <Check className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

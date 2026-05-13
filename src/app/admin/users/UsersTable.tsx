'use client'

import { useState } from 'react'
import { Shield, ShieldOff, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface User {
  id: string
  email: string
  username: string | null
  display_name: string | null
  is_admin: boolean
  created_at: string
}

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)

  const toggleAdmin = async (user: User) => {
    setLoading(user.id)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: !user.is_admin }),
    })
    setLoading(null)
    if (!res.ok) { alert('권한 변경에 실패했습니다.'); return }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_admin: !u.is_admin } : u))
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`${user.email} 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    setLoading(user.id)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    setLoading(null)
    if (!res.ok) { alert('삭제에 실패했습니다.'); return }
    setUsers(prev => prev.filter(u => u.id !== user.id))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">이메일</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">닉네임</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">권한</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">가입일</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{user.email}</td>
              <td className="px-4 py-3 text-gray-600">{user.username ?? '-'}</td>
              <td className="px-4 py-3">
                {user.is_admin
                  ? <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> 어드민</span>
                  : <span className="text-xs text-gray-400">일반</span>
                }
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ko })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => toggleAdmin(user)}
                    disabled={loading === user.id}
                    title={user.is_admin ? '어드민 해제' : '어드민 지정'}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                  >
                    {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    disabled={loading === user.id}
                    title="계정 삭제"
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400">회원이 없습니다.</div>
      )}
    </div>
  )
}

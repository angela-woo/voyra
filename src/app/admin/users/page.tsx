import { createClient as createServiceClient } from '@supabase/supabase-js'
import UsersTable from './UsersTable'

export const dynamic = 'force-dynamic'

const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminUsersPage() {
  const [{ data: { users: authUsers } }, { data: profiles }] = await Promise.all([
    adminSupabase.auth.admin.listUsers({ perPage: 200 }),
    adminSupabase.from('user_profiles').select('id, username, display_name, is_admin'),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const users = (authUsers ?? []).map(u => ({
    id: u.id,
    email: u.email ?? '',
    username: profileMap[u.id]?.username ?? null,
    display_name: profileMap[u.id]?.display_name ?? null,
    is_admin: profileMap[u.id]?.is_admin ?? false,
    created_at: u.created_at,
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {users.length}명</p>
        </div>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  )
}

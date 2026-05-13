import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { email, password, username } = await req.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
  }

  // 1. Supabase Auth 계정 생성
  const { data, error: signUpError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 이메일 확인 없이 즉시 활성화
    user_metadata: { username },
  })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  // 2. user_profiles 생성 (service role → RLS 우회)
  if (data.user) {
    await adminSupabase.from('user_profiles').upsert({
      id: data.user.id,
      username,
    })
  }

  return NextResponse.json({ ok: true })
}

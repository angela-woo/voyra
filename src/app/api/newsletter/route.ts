import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })

  const { error } = await adminSupabase
    .from('subscribers')
    .upsert({ email }, { onConflict: 'email' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json()
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
  }
  const { error } = await adminSupabase
    .from('contact_messages')
    .insert({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

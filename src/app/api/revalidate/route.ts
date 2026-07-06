import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { secret } = await req.json()
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  revalidatePath('/')
  revalidatePath('/articles')
  revalidatePath('/en/articles')
  return NextResponse.json({ revalidated: true, ts: Date.now() })
}

#!/usr/bin/env npx tsx
/**
 * Fix ~~ range expressions in article content that get rendered as strikethrough.
 * Replaces all ~~ with ~ in the content field of the articles table.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, content')

  if (error) { console.error('Fetch error:', error); process.exit(1) }
  if (!articles || articles.length === 0) { console.log('No articles found.'); return }

  let fixed = 0
  for (const article of articles) {
    if (!article.content || !article.content.includes('~~')) continue

    const newContent = article.content.replace(/~~/g, '~')
    const { error: updateError } = await supabase
      .from('articles')
      .update({ content: newContent })
      .eq('id', article.id)

    if (updateError) {
      console.error(`Error updating ${article.slug}:`, updateError)
    } else {
      console.log(`Fixed: ${article.slug}`)
      fixed++
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\nDone. Fixed ${fixed} / ${articles.length} articles.`)
}

main()

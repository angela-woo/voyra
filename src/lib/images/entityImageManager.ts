import { createClient } from '@supabase/supabase-js'
import { extractEntitiesFromArticle, type ExtractedEntities, type Entity } from './entityExtractor'
import { calculateQualityScore, type ImageCandidate } from './qualityScorer'
import { searchUnsplash, searchPexels } from './imageSources'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getEntityImageFromDB(entityName: string): Promise<string | null> {
  const { data } = await supabase
    .from('entity_images')
    .select('image_url, quality_score')
    .eq('entity_name', entityName.toLowerCase())
    .order('quality_score', { ascending: false })
    .limit(1)
    .single()
  return data?.image_url || null
}

async function saveEntityImage(
  entityName: string,
  candidate: ImageCandidate,
  qualityScore: number,
  isPrimary: boolean = false,
): Promise<void> {
  let { data: entity } = await supabase
    .from('destination_entities')
    .select('id')
    .ilike('name', entityName)
    .single()

  if (!entity) {
    const { data: newEntity } = await supabase
      .from('destination_entities')
      .insert({ name: entityName, type: 'other' })
      .select('id')
      .single()
    entity = newEntity
  }

  await supabase
    .from('entity_images')
    .upsert({
      entity_id: entity?.id,
      entity_name: entityName.toLowerCase(),
      image_url: candidate.url,
      thumb_url: candidate.thumbUrl,
      source: candidate.source,
      source_id: candidate.sourceId,
      width: candidate.width,
      height: candidate.height,
      quality_score: qualityScore,
      alt_text: candidate.altText,
      photographer: candidate.photographer,
      photographer_url: candidate.photographerUrl,
      is_primary: isPrimary,
    }, { onConflict: 'entity_name,image_url' })
}

async function findBestImageForEntity(entity: Entity): Promise<string | null> {
  const cached = await getEntityImageFromDB(entity.name)
  if (cached) {
    console.log(`✅ Cache hit: ${entity.name}`)
    return cached
  }

  console.log(`🔍 Searching image for entity: ${entity.name}`)

  const allCandidates: { candidate: ImageCandidate; score: number }[] = []

  for (const query of entity.searchQueries.slice(0, 3)) {
    const [unsplashResults, pexelsResults] = await Promise.all([
      searchUnsplash(query, 5),
      searchPexels(query, 3),
    ])

    for (const candidate of [...unsplashResults, ...pexelsResults]) {
      const score = calculateQualityScore(candidate, entity.name, query)
      allCandidates.push({ candidate, score })
    }

    await new Promise(r => setTimeout(r, 300))
  }

  if (allCandidates.length === 0) return null

  allCandidates.sort((a, b) => b.score - a.score)

  for (let i = 0; i < Math.min(3, allCandidates.length); i++) {
    const { candidate, score } = allCandidates[i]
    await saveEntityImage(entity.name, candidate, score, i === 0)
  }

  return allCandidates[0].candidate.url
}

export async function getEntityBasedImages(
  articleSlug: string,
  title: string,
  content: string,
  city: string,
  country: string,
): Promise<{
  coverImage: string | null
  sectionImages: Record<string, string>
  entities: ExtractedEntities
}> {
  const extracted = await extractEntitiesFromArticle(title, content, city, country)

  const coverImage = await findBestImageForEntity(extracted.mainEntity)

  const sectionImages: Record<string, string> = {}
  const topEntities = extracted.entities
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)

  for (const entity of topEntities) {
    const imageUrl = await findBestImageForEntity(entity)
    if (imageUrl) {
      sectionImages[entity.nameKo || entity.name] = imageUrl
    }
    await new Promise(r => setTimeout(r, 500))
  }

  const entityMappings = extracted.entities.map(e => ({
    article_slug: articleSlug,
    entity_name: e.name.toLowerCase(),
    importance: e.importance,
  }))

  await supabase
    .from('article_entities')
    .upsert(entityMappings, { onConflict: 'article_slug,entity_name' })

  if (coverImage) {
    await supabase
      .from('articles')
      .update({ cover_image_url: coverImage })
      .eq('slug', articleSlug)
  }

  return { coverImage, sectionImages, entities: extracted }
}

export async function getPlanEntityImages(
  _planSlug: string,
  _title: string,
  city: string,
  country: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  daysData: any[],
): Promise<{
  coverImage: string | null
  dayImages: Record<number, string>
  placeImages: Record<string, string>
}> {
  const cityEntity: Entity = {
    name: `${city} famous landmark`,
    nameKo: city,
    type: 'area',
    importance: 100,
    searchQueries: [
      `${city} famous landmark tourism`,
      `${city} travel destination`,
      `${city} ${country} scenic`,
    ],
  }

  const coverImage = await findBestImageForEntity(cityEntity)

  const dayImages: Record<number, string> = {}
  for (const day of daysData) {
    const firstPlace = day.places?.[0]
    if (firstPlace) {
      const entity: Entity = {
        name: firstPlace.name,
        nameKo: firstPlace.name,
        type: 'attraction',
        importance: 80,
        searchQueries: [firstPlace.name + ' ' + city],
      }
      const img = await findBestImageForEntity(entity)
      if (img) dayImages[day.day] = img
      await new Promise(r => setTimeout(r, 300))
    }
  }

  const allPlaces: Entity[] = daysData.flatMap((day) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (day.places ?? []).map((place: any) => ({
      name: place.name,
      nameKo: place.name,
      type: 'attraction' as const,
      importance: 70,
      searchQueries: [
        place.name + ' ' + city,
        place.name + ' ' + country,
        place.name + ' tourism',
      ],
    })),
  )

  const placeImages: Record<string, string> = {}
  for (const place of allPlaces.slice(0, 10)) {
    const img = await findBestImageForEntity(place)
    if (img) placeImages[place.name] = img
    await new Promise(r => setTimeout(r, 300))
  }

  return { coverImage, dayImages, placeImages }
}

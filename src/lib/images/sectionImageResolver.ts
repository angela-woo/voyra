import { createClient } from '@supabase/supabase-js'
import { searchUnsplash, searchPexels } from './imageSources'
import { calculateQualityScore } from './qualityScorer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function extractEntityFromSectionTitle(
  sectionTitle: string,
  cityEn: string,
): { entityName: string; queries: string[] } {
  const titleLower = sectionTitle.toLowerCase()

  // 주요 장소 패턴 → 특화 쿼리
  const knownPlaces: Record<string, string[]> = {
    'senso': ['Senso-ji Temple Asakusa Tokyo lantern', 'Senso-ji shrine red paper lantern'],
    'shibuya': ['Shibuya crossing Tokyo pedestrian crowd', 'Shibuya scramble intersection aerial'],
    'shinjuku': ['Shinjuku Tokyo neon entertainment district', 'Shinjuku golden gai night alley'],
    'harajuku': ['Harajuku Takeshita street fashion colorful', 'Harajuku youth culture Japan'],
    'ginza': ['Ginza Tokyo luxury shopping district', 'Ginza upscale boutique street'],
    'asakusa': ['Asakusa Tokyo traditional temple gate', 'Asakusa rickshaw traditional craft'],
    'akihabara': ['Akihabara Tokyo electronics anime district', 'Akihabara neon signs night'],
    'roppongi': ['Roppongi Tokyo nightlife art district', 'Roppongi Hills Mori tower'],
    'eiffel': ['Eiffel Tower Paris night illuminated', 'Eiffel Tower Seine river reflection'],
    'louvre': ['Louvre Museum Paris glass pyramid', 'Louvre art gallery interior grand'],
    'montmartre': ['Montmartre Sacre-Coeur Paris hill', 'Montmartre artist street cobblestone'],
    'dotonbori': ['Dotonbori Osaka canal neon Glico sign', 'Dotonbori night reflection water'],
    'namba': ['Namba Osaka entertainment district', 'Namba Osaka shopping street'],
    'fushimi': ['Fushimi Inari torii gates kyoto orange', 'Fushimi Inari shrine path forest'],
    'arashiyama': ['Arashiyama bamboo grove Kyoto green', 'Arashiyama river Kyoto mountain'],
    'kinkaku': ['Kinkaku-ji Golden Pavilion Kyoto pond', 'Kinkakuji temple reflection water'],
    'gion': ['Gion district Kyoto geisha lantern', 'Gion Shijo traditional wooden townhouse'],
    'disneyland': ['Tokyo Disneyland castle parade', 'Tokyo Disney resort fantasy night'],
    'universalstudio': ['Universal Studios Japan Osaka', 'USJ theme park attraction'],
    'marinas': ['Marina Bay Sands Singapore skyline', 'Marina Bay Sands infinity pool night'],
    'gardens': ['Gardens by the Bay Singapore Supertree', 'Singapore Supertree grove night lights'],
    'sentosa': ['Sentosa Island Singapore resort beach', 'Sentosa cable car panorama'],
    'ubud': ['Ubud Bali rice terrace green', 'Ubud Bali monkey forest temple'],
    'tanah': ['Tanah Lot temple Bali ocean sunset', 'Tanah Lot Bali waves cliff'],
    'seminyak': ['Seminyak Bali beach sunset villas', 'Seminyak Bali surf sunset'],
    'gyeongbok': ['Gyeongbokgung Palace Seoul traditional', 'Gyeongbokgung guard ceremony Seoul'],
    'namsan': ['Namsan Tower Seoul city view night', 'N Seoul Tower Seoul panorama'],
    'bukchon': ['Bukchon Hanok Village Seoul rooftop', 'Bukchon traditional Korean house tile'],
    'hongdae': ['Hongdae Seoul youth culture street', 'Hongdae Seoul indie music street art'],
    'myeongdong': ['Myeongdong Seoul shopping street beauty', 'Myeongdong cosmetics night market'],
    'petronas': ['Petronas Twin Towers Kuala Lumpur night', 'Petronas Towers KL skyline reflection'],
    'batu': ['Batu Caves Kuala Lumpur hindu temple stairs', 'Batu Caves golden statue Malaysia'],
    'burj': ['Burj Khalifa Dubai skyline sunset', 'Burj Khalifa fountain show night'],
    'hagia': ['Hagia Sophia Istanbul Byzantine dome', 'Hagia Sophia Istanbul mosque interior'],
    'sagrada': ['Sagrada Familia Barcelona Gaudi architecture', 'Sagrada Familia interior light stained glass'],
    'colosseum': ['Colosseum Rome ancient arena sunset', 'Roman Colosseum interior ancient'],
    'trevi': ['Trevi Fountain Rome baroque water', 'Trevi Fountain Rome night illuminated'],
    'big ben': ['Big Ben London Westminster bridge', 'Big Ben Parliament Houses London night'],
    'tower bridge': ['Tower Bridge London Thames river', 'Tower Bridge London blue hour reflection'],
  }

  for (const [key, queries] of Object.entries(knownPlaces)) {
    if (titleLower.includes(key)) {
      return { entityName: queries[0].split(' ').slice(0, 4).join(' '), queries }
    }
  }

  // 카테고리 키워드 → 도시 특화 쿼리
  const categoryMap: Record<string, string[]> = {
    '맛집': [`${cityEn} best restaurant local food dining`, `${cityEn} food market street cuisine`],
    '음식': [`${cityEn} street food local cuisine`, `${cityEn} traditional food culture`],
    '쇼핑': [`${cityEn} shopping district street market`, `${cityEn} local market retail`],
    '교통': [`${cityEn} metro subway station`, `${cityEn} public transport city`],
    '관광': [`${cityEn} famous tourist attraction landmark`, `${cityEn} sightseeing popular spot`],
    '숙소': [`${cityEn} hotel luxury accommodation`, `${cityEn} hotel lobby elegant`],
    '비자': [`passport visa travel document international`, `airport immigration arrival terminal`],
    '날씨': [`${cityEn} landscape weather scenic sky`, `${cityEn} seasonal nature view`],
    '해변': [`${cityEn} beach ocean tropical waves`, `${cityEn} coastline sunset golden`],
    '사원': [`${cityEn} temple shrine traditional architecture`, `${cityEn} religious cultural site`],
    '카페': [`${cityEn} cafe coffee shop cozy interior`, `${cityEn} coffee culture trendy`],
    '야경': [`${cityEn} night city lights skyline`, `${cityEn} illuminated night view`],
    '자연': [`${cityEn} nature park green landscape`, `${cityEn} outdoor scenic beauty`],
    'food': [`${cityEn} local cuisine restaurant`, `${cityEn} food culture dining`],
    'shopping': [`${cityEn} shopping street market`, `${cityEn} retail district`],
    'attraction': [`${cityEn} tourist landmark famous`, `${cityEn} sightseeing popular`],
    'transport': [`${cityEn} metro station train`, `${cityEn} public transport`],
    'hotel': [`${cityEn} hotel luxury room`, `${cityEn} accommodation resort`],
    'beach': [`${cityEn} beach ocean sunset tropical`, `${cityEn} coast waves`],
    'temple': [`${cityEn} temple shrine ancient`, `${cityEn} religious architecture`],
    'night': [`${cityEn} night city lights skyline`, `${cityEn} illuminated evening`],
    'cafe': [`${cityEn} cafe coffee interior cozy`, `${cityEn} coffee shop culture`],
    'museum': [`${cityEn} museum art gallery interior`, `${cityEn} cultural exhibition`],
    'hike': [`${cityEn} hiking trail mountain nature`, `${cityEn} outdoor trek landscape`],
    'park': [`${cityEn} park garden green nature`, `${cityEn} botanical garden flowers`],
  }

  for (const [keyword, queries] of Object.entries(categoryMap)) {
    if (titleLower.includes(keyword)) {
      return { entityName: `${cityEn} ${keyword}`, queries }
    }
  }

  // 영어 부분 추출 후 fallback
  const englishOnly = sectionTitle.replace(/[가-힣]/g, '').trim()
  return {
    entityName: `${cityEn} ${englishOnly || 'travel'}`.trim(),
    queries: [
      `${cityEn} ${englishOnly} tourism landmark`,
      `${cityEn} travel scenic landscape`,
    ],
  }
}

export async function getSectionImage(
  sectionTitle: string,
  cityEn: string,
  usedUrls: Set<string>,
): Promise<{ url: string; authorName: string; authorUrl: string; sourceName: string } | null> {
  const { entityName, queries } = extractEntityFromSectionTitle(sectionTitle, cityEn)

  // DB 캐시 확인
  const { data: cached } = await supabase
    .from('entity_images')
    .select('image_url, photographer, photographer_url')
    .eq('entity_name', entityName.toLowerCase())
    .order('quality_score', { ascending: false })
    .limit(10)

  if (cached) {
    const unused = cached.find(r => !usedUrls.has(r.image_url))
    if (unused) {
      usedUrls.add(unused.image_url)
      const isPexels = unused.image_url.includes('pexels.com')
      return {
        url: unused.image_url,
        authorName: unused.photographer || (isPexels ? 'Pexels' : 'Unsplash'),
        authorUrl: unused.photographer_url || (isPexels ? 'https://pexels.com' : 'https://unsplash.com'),
        sourceName: isPexels ? 'Pexels' : 'Unsplash',
      }
    }
  }

  // 새 검색
  for (const query of queries) {
    const [unsplashResults, pexelsResults] = await Promise.all([
      searchUnsplash(query, 8),
      searchPexels(query, 4),
    ])

    const scored = [...unsplashResults, ...pexelsResults]
      .map(c => ({ c, score: calculateQualityScore(c, entityName, query) }))
      .sort((a, b) => b.score - a.score)
      .filter(({ c }) => !usedUrls.has(c.url))

    if (scored.length > 0) {
      const best = scored[0]
      usedUrls.add(best.c.url)

      // DB 비동기 저장 (응답 지연 방지)
      supabase.from('entity_images').upsert({
        entity_name: entityName.toLowerCase(),
        image_url: best.c.url,
        thumb_url: best.c.thumbUrl,
        source: best.c.source,
        source_id: best.c.sourceId,
        width: best.c.width,
        height: best.c.height,
        quality_score: best.score,
        alt_text: best.c.altText,
        photographer: best.c.photographer,
        photographer_url: best.c.photographerUrl,
      }, { onConflict: 'entity_name,image_url' }).then(() => {})

      return {
        url: best.c.url,
        authorName: best.c.photographer || (best.c.source === 'pexels' ? 'Pexels' : 'Unsplash'),
        authorUrl: best.c.photographerUrl || (best.c.source === 'pexels' ? 'https://pexels.com' : 'https://unsplash.com'),
        sourceName: best.c.source === 'pexels' ? 'Pexels' : 'Unsplash',
      }
    }

    await new Promise(r => setTimeout(r, 200))
  }

  return null
}

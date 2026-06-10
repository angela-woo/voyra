import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? ''

// 배치 생성 세션용 전역 중복 추적
export const sessionUsedUrls = new Set<string>()

// ─────────────────────────────────────────────────
// Unsplash 검색 (중복 없는 이미지 반환)
// ─────────────────────────────────────────────────
export async function fetchUniqueUnsplashImage(
  queries: string[],
  usedUrls: Set<string> = sessionUsedUrls,
  maxPagesPerQuery = 8,
): Promise<string | null> {
  if (!UNSPLASH_KEY) return null

  for (const query of queries) {
    for (let page = 1; page <= maxPagesPerQuery; page++) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&page=${page}&orientation=landscape&order_by=relevant`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
        )
        if (!res.ok) {
          if (res.status === 429) {
            console.log('⏳ Unsplash rate limit — 10초 대기')
            await new Promise(r => setTimeout(r, 10000))
            continue
          }
          break
        }
        const data = await res.json()
        const photos: Array<{ urls: { regular: string }; width: number; height: number; likes: number; downloads?: number }> = data.results ?? []

        const candidates = photos
          .filter(p => {
            const url = p.urls?.regular
            return url && !usedUrls.has(url) && p.width >= 800 && p.height >= 500
          })
          .sort((a, b) => {
            const scoreA = (a.likes ?? 0) + (a.downloads ?? 0) * 0.1
            const scoreB = (b.likes ?? 0) + (b.downloads ?? 0) * 0.1
            return scoreB - scoreA
          })

        if (candidates.length > 0) {
          const url = candidates[0].urls.regular
          usedUrls.add(url)
          return url
        }
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.error(`Unsplash fetch error (${query}, page ${page}):`, err)
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  console.warn(`⚠️ 이미지 없음: ${queries[0]}`)
  return null
}

// ─────────────────────────────────────────────────
// slug 기반 커버 이미지 키워드 (구체적 장소/테마)
// ─────────────────────────────────────────────────
export function getKeywordsFromSlug(slug: string, cityEn: string): string[] {
  const s = slug.toLowerCase()
  const city = cityEn.toLowerCase()

  const slugKeywords: Record<string, string[]> = {
    shinjuku: ['shinjuku tokyo neon night street', 'shinjuku golden gai bar alley'],
    shibuya: ['shibuya crossing tokyo pedestrian', 'shibuya scramble intersection crowd'],
    asakusa: ['asakusa senso-ji temple tokyo lantern gate', 'asakusa traditional rickshaw japan'],
    harajuku: ['harajuku takeshita street fashion colorful', 'harajuku youth culture japan'],
    ginza: ['ginza tokyo luxury shopping avenue night', 'ginza boutique upscale district'],
    nakameguro: ['nakameguro meguro river canal cafe', 'nakameguro cherry blossom waterway'],
    akihabara: ['akihabara electronics anime neon tokyo', 'akihabara night signs district'],
    roppongi: ['roppongi hills tokyo art night', 'roppongi midtown city view'],
    odaiba: ['odaiba tokyo bay rainbow bridge waterfront', 'odaiba futuristic modern island'],
    shimokitazawa: ['shimokitazawa vintage indie tokyo', 'shimokitazawa local cafe street'],
    ueno: ['ueno park tokyo museum landmark', 'ueno cherry blossom japan'],
    ikebukuro: ['ikebukuro sunshine city tokyo', 'ikebukuro shopping district'],
    disneyland: ['tokyo disneyland castle parade night', 'tokyo disney resort magic'],
    teamlab: ['teamlab planets digital art light immersive', 'teamlab art installation walk'],
    skytree: ['tokyo skytree tower observation deck', 'skytree illumination night city view'],
    ramen: ['ramen noodle soup japanese restaurant bowl', 'tonkotsu ramen rich broth chopsticks'],
    sushi: ['sushi japanese fresh seafood chef counter', 'nigiri sushi omakase plate'],
    donkatsu: ['tonkatsu pork cutlet japanese crispy breaded', 'katsu set meal sauce'],
    gyukatsu: ['gyukatsu beef cutlet rare pink japanese', 'beef katsu hot stone'],
    yakiniku: ['yakiniku wagyu beef grill smoke japanese bbq', 'wagyu beef charcoal grill'],
    tempura: ['tempura japanese shrimp golden crispy', 'tempura set meal restaurant'],
    kaisendon: ['kaisen don seafood rice bowl sashimi fresh', 'colorful bowl japanese market'],
    matcha: ['matcha green tea dessert japan parfait', 'matcha sweets traditional tea'],
    cafe: ['japanese cafe interior cozy specialty coffee', 'tokyo cafe design aesthetic'],
    izakaya: ['izakaya japanese pub night food yakitori', 'japanese bar grill lantern'],
    'street-food': ['japanese street food market stall', 'osaka street snack dotonbori'],
    shopping: [`${city} shopping street market boutique`, `${city} retail district local`],
    drugstore: ['japanese drugstore cosmetics beauty shelf', 'japan pharmacy matsukiyo interior'],
    kimono: ['kimono traditional japanese woman temple', 'kimono asakusa rental dress'],
    onsen: ['onsen hot spring japan traditional bath', 'ryokan steam relax japanese'],
    'cherry-blossom': ['cherry blossom sakura japan pink hanami', 'sakura picnic park spring'],
    sakura: ['sakura cherry blossom pink japan spring', 'hanami park picnic bloom'],
    autumn: ['autumn koyo red maple japan foliage', 'fall leaves temple garden japan'],
    'night-view': [`${city} night skyline city lights panorama`, `${city} illumination rooftop view`],
    night: [`${city} night city lights skyline`, `${city} illumination dusk beautiful`],
    budget: ['budget travel japan affordable tips', 'backpacker hostel japan explore'],
    solo: ['solo travel japan adventure explore', 'solo journey backpacker'],
    couple: ['romantic couple travel japan sunset', 'couple japanese garden walk'],
    family: ['family vacation japan children', 'family travel theme park fun'],
    beach: [`${city} beach tropical ocean clear`, `${city} coast waves scenic`],
    'snow-festival': ['snow festival hokkaido winter', 'sapporo snow sculpture lights'],
    winter: [`${city} winter snow landscape cold`, `${city} seasonal winter scenery`],
    hiking: [`${city} hiking trail mountain nature`, `${city} outdoor trekking landscape`],
    museum: [`${city} museum art gallery interior`, `${city} cultural exhibition space`],
    temple: [`${city} temple shrine ancient architecture`, `${city} religious cultural heritage`],
    // 서울 세부 명소
    ssamsiegil: ['ssamsiegil insadong courtyard mall seoul', 'insadong ssamsiegil spiral shopping'],
    insadong: ['insadong seoul traditional culture street', 'insadong korea craft gallery alley'],
    hongdae: ['hongdae seoul indie music street art', 'hongdae young culture cafe korea'],
    hongik: ['hongdae university street seoul art', 'hongik indie culture music korea'],
    bukchon: ['bukchon hanok village seoul traditional roof', 'bukchon korea traditional house hill'],
    myeongdong: ['myeongdong seoul shopping street cosmetics', 'myeongdong street food night korea'],
    gangnam: ['gangnam seoul modern district skyscraper', 'gangnam luxury shopping korea'],
    itaewon: ['itaewon seoul multicultural district food', 'itaewon international street korea'],
    namsan: ['namsan tower seoul city view night', 'n seoul tower cable car mountain'],
    dongdaemun: ['dongdaemun design plaza ddp seoul', 'dongdaemun shopping fashion night'],
    jeonju: ['jeonju hanok village korea traditional', 'jeonju bibimbap food culture'],
    busan: ['busan gamcheon culture village colorful', 'busan haeundae beach korea'],
    jeju: ['jeju island korea volcanic landscape', 'jeju hallasan mountain natural'],
    gyeongju: ['gyeongju historic site korea ancient', 'gyeongju bulguksa temple heritage'],
    // 도쿄 세부 명소 (추가)
    kabukicho: ['kabukicho shinjuku entertainment night neon', 'kabukicho tower tokyo red light'],
    koenji: ['koenji vintage shop tokyo indie', 'koenji retro fashion alley'],
    yanaka: ['yanaka old town tokyo traditional', 'yanaka cemetery shopping street'],
    kagurazaka: ['kagurazaka french japanese tokyo alley', 'kagurazaka cobblestone narrow street'],
    // 오사카 세부
    dotonbori: ['dotonbori osaka canal neon glico sign', 'dotonbori night reflection river'],
    shinsekai: ['shinsekai retro osaka tower tsutenkaku', 'shinsekai old town osaka street'],
    kuromon: ['kuromon market osaka fresh seafood', 'kuromon ichiba market fish stall'],
    namba: ['namba osaka shopping street busy', 'namba parks shopping center osaka'],
    // 베트남
    hoian: ['hoi an ancient town lantern night', 'hoi an yellow buildings canal boat'],
    banhmi: ['banh mi vietnam sandwich street food', 'vietnamese sandwich baguette fresh'],
    pho: ['pho vietnam noodle soup bowl herbs', 'vietnamese noodle pho restaurant'],
    // 태국 세부
    watpho: ['wat pho reclining buddha temple bangkok', 'bangkok grand palace temple gold'],
    khaosan: ['khao san road bangkok backpacker night', 'khaosan road street food bar'],
    chatuchak: ['chatuchak weekend market bangkok', 'chatuchak market stalls shopping'],
    // 발리 세부
    ubud: ['ubud bali rice terrace green landscape', 'ubud monkey forest temple bali'],
    seminyak: ['seminyak bali beach club sunset', 'seminyak luxury villa pool bali'],
    uluwatu: ['uluwatu cliff temple bali ocean sunset', 'uluwatu kecak fire dance ceremony'],
    kuta: ['kuta beach bali surfer sunset orange', 'kuta bali busy beach wave'],
    // 도시 전반
    tokyo: ['tokyo japan modern skyline landmark', 'tokyo contrast traditional modern'],
    osaka: ['osaka dotonbori canal neon glico', 'osaka street food market night'],
    kyoto: ['kyoto temple fushimi inari torii gates', 'kyoto geisha gion district lantern'],
    fukuoka: ['fukuoka yatai food stalls hakata', 'fukuoka canal city japan'],
    sapporo: ['sapporo snow festival hokkaido winter', 'sapporo odori park hokkaido'],
    okinawa: ['okinawa tropical beach clear ocean', 'okinawa coral reef water'],
    nagoya: ['nagoya castle japan historic landmark', 'nagoya cityscape japan'],
    bali: ['bali temple rice terrace indonesia', 'bali tropical beach sunset'],
    paris: ['paris eiffel tower romantic night', 'paris louvre museum art seine'],
    bangkok: ['bangkok temple golden thailand', 'bangkok street food night market'],
    danang: ['da nang beach vietnam blue sky', 'da nang golden bridge bana hills'],
    seoul: ['seoul gyeongbokgung palace traditional', 'seoul myeongdong night shopping'],
    singapore: ['singapore marina bay sands skyline night', 'singapore gardens by the bay'],
  }

  const queries: string[] = []
  for (const [key, kqs] of Object.entries(slugKeywords)) {
    if (s.includes(key)) queries.push(...kqs)
  }

  if (queries.length === 0) {
    const stopWords = new Set(['the', 'for', 'and', 'guide', 'travel', 'korean', 'travelers', 'ko', 'en', '2024', '2025', '2026'])
    const words = s.split('-').filter(w => w.length > 2 && !stopWords.has(w))
    if (words.length >= 2) {
      queries.push(`${words.slice(0, 3).join(' ')} korea travel`)
      queries.push(`${words[0]} ${words[1]} tourism photo`)
    }
    // 도시 기반 고유 페이지 폴백 (slug 해시로 페이지 분산)
    const page = (Math.abs(s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 50) + 1
    queries.push(`${city} travel attraction landmark page${page}`)
    queries.push(`${city} tourism scenic beautiful`)
  }

  const seen = new Set<string>()
  return queries.filter(q => seen.has(q) ? false : (seen.add(q), true)).slice(0, 6)
}

// ─────────────────────────────────────────────────
// 섹션 타이틀 + 본문 기반 키워드 (페이지 렌더링용)
// ─────────────────────────────────────────────────
export function getSectionImageKeywords(
  sectionTitle: string,
  sectionContent: string,
  cityEn: string,
): string[] {
  const title = sectionTitle.toLowerCase()
  const content = (sectionContent ?? '').toLowerCase().slice(0, 500)
  const city = cityEn.toLowerCase()

  const placePatterns: Record<string, string[]> = {
    '센소지|senso-ji|senso ji': ['senso-ji temple asakusa red lantern gate tokyo', 'asakusa kaminarimon gate japan'],
    '시부야 스카이|shibuya sky': ['shibuya sky observation deck city view', 'shibuya scramble aerial crossing'],
    '시부야|shibuya': ['shibuya scramble crossing pedestrian', 'shibuya intersection busy tokyo'],
    '신주쿠 골든가이|golden gai': ['golden gai shinjuku narrow alley bar', 'shinjuku golden gai night drinks'],
    '신주쿠|shinjuku': ['shinjuku tokyo neon entertainment district', 'shinjuku night street alley'],
    '도쿄 스카이트리|skytree': ['tokyo skytree tower illumination night', 'skytree observation deck panorama'],
    '팀랩|teamlab': ['teamlab planets immersive digital art light', 'teamlab installation interactive'],
    '메구로강|meguro': ['meguro river nakameguro canal cafe', 'nakameguro cherry blossom waterway'],
    '스타벅스 리저브|starbucks reserve': ['starbucks reserve roastery specialty coffee interior', 'premium coffee roastery'],
    '도쿄돔|tokyo dome': ['tokyo dome baseball stadium japan', 'tokyo dome city attraction'],
    '긴자|ginza': ['ginza six luxury shopping mall interior', 'ginza upscale boutique street night'],
    '메이지신궁|meiji': ['meiji shrine tokyo forest torii gate', 'meiji jingu approach green path'],
    '하라주쿠|harajuku': ['harajuku takeshita street fashion colorful', 'harajuku youth culture japan'],
    '아키하바라|akihabara': ['akihabara electronics anime neon tokyo', 'akihabara night signs district'],
    '우에노|ueno': ['ueno park tokyo museum cherry blossom', 'ueno zoo sakura japan'],
    '아사쿠사|asakusa': ['asakusa traditional district tokyo', 'asakusa rickshaw senso-ji'],
    '라멘|ramen': ['ramen noodle bowl japanese soup rich', 'tonkotsu ramen broth chopsticks'],
    '스시|sushi': ['sushi fresh seafood japanese counter chef', 'nigiri sushi omakase plate'],
    '돈카츠|katsu': ['tonkatsu pork cutlet crispy japanese', 'katsu curry set meal'],
    '규카츠|gyukatsu': ['gyukatsu beef cutlet rare pink stone', 'beef katsu japanese rare'],
    '야키니쿠|yakiniku': ['wagyu beef yakiniku grill smoke', 'japanese bbq charcoal meat grill'],
    '이치란|ichiran': ['ichiran ramen solo booth tonkotsu', 'ramen booth individual japan'],
    '텐동|tendon|천동': ['tendon tempura rice bowl shrimp golden', 'tempura set donburi japanese'],
    '카이센동|해산물': ['kaisen don seafood bowl sashimi fresh', 'sashimi colorful bowl market'],
    '타코야키|takoyaki': ['takoyaki octopus ball street food osaka', 'dotonbori street food stall'],
    '드럭스토어|drugstore|약국': ['japanese drugstore cosmetics beauty shelf', 'matsukiyo japan pharmacy beauty'],
    '돈키호테|donki': ['don quijote japan colourful discount store', 'donki japan night store sign'],
    '포켓몬|pokemon': ['pokemon center official japan pikachu merchandise', 'pokemon store colorful'],
    '산리오|sanrio': ['sanrio hello kitty japan shop goods', 'japanese character cute store'],
    '맛집|음식|food|cuisine|restaurant|dining': [`${city} best restaurant local cuisine dining`, `${city} food market street gourmet`],
    '쇼핑|shopping|retail|market': [`${city} shopping district street boutique`, `${city} local market retail`],
    '교통|metro|지하철|기차|train|transport': [`${city} subway metro station`, `${city} public transport train`],
    '신칸센|shinkansen': ['shinkansen bullet train japan platform', 'shinkansen speed station japan'],
    '관광|sightseeing|attraction|landmark': [`${city} famous tourist attraction landmark`, `${city} popular sightseeing spot`],
    '숙소|hotel|호텔|accommodation|resort': [`${city} hotel luxury lobby interior`, `${city} hotel room view elegant`],
    '료칸|ryokan': ['ryokan traditional japanese inn tatami', 'ryokan onsen bath room japan'],
    '비자|visa|입국|immigration|passport': ['passport visa travel document airport', 'airport immigration customs arrival'],
    '날씨|기후|weather|climate': [`${city} landscape weather seasonal sky`, `${city} nature outdoor scenic season`],
    '환전|화폐|currency|money|환율': ['japanese yen currency exchange money', 'currency wallet travel japan'],
    '유심|sim|esim|데이터': ['sim card japan phone internet travel', 'mobile data connectivity tourist'],
    '예산|budget|비용|cost|가격': ['travel budget planning japan expense', 'cost saving travel tips'],
    '짐|packing|준비|준비물': ['travel packing luggage suitcase essentials', 'backpack travel organize prepare'],
    '안전|safety|주의사항': ['travel safety guide tips awareness', 'tourist safety sign advice'],
    '기모노|kimono': ['kimono traditional japanese woman temple', 'kimono asakusa rental walk'],
    '벚꽃|sakura|cherry|봄': ['cherry blossom sakura pink japan spring', 'sakura hanami park picnic bloom'],
    '단풍|koyo|가을|autumn|fall': ['autumn koyo maple red japan foliage', 'fall leaves temple garden kyoto'],
    '눈|snow|winter|겨울': [`${city} snow winter landscape cold`, 'hokkaido snow festival winter'],
    '축제|festival|matsuri|행사': ['japanese matsuri festival lantern', 'summer festival yukata fireworks japan'],
    '야경|night view|야간': [`${city} night skyline city lights beautiful`, `${city} illumination night panorama`],
    '전망대|observatory|view|뷰': [`${city} observation deck panorama rooftop`, `${city} city view skyline height`],
    '일몰|sunset|황혼': [`${city} sunset golden sky dusk beautiful`, `${city} evening glow scenic`],
    '해변|beach|바다|ocean': [`${city} beach tropical ocean clear waves`, `${city} coast sea scenic`],
    '자연|nature|공원|park|garden': [`${city} nature park green landscape`, `${city} botanical garden flowers outdoor`],
    '온천|onsen|hot spring': ['onsen hot spring japan steam relax', 'ryokan bath traditional japanese'],
    '카페|cafe|coffee|커피': [`${city} cafe coffee shop cozy interior`, `${city} specialty coffee culture trendy`],
    '박물관|museum|미술관|gallery': [`${city} museum art gallery interior`, `${city} cultural exhibition collection`],
    '등산|hiking|trail|trekking': [`${city} hiking trail mountain nature`, `${city} outdoor trekking landscape`],
  }

  const queries: string[] = []
  for (const [pattern, qs] of Object.entries(placePatterns)) {
    const regex = new RegExp(pattern, 'i')
    if (regex.test(title)) {
      queries.push(...qs)
    } else if (regex.test(content)) {
      queries.push(qs[0])
    }
  }

  if (queries.length === 0) {
    queries.push(
      `${city} travel attraction landmark scenic`,
      `${city} tourism popular destination`,
      `${city} local culture experience`,
    )
  }

  const seen = new Set<string>()
  return queries.filter(q => seen.has(q) ? false : (seen.add(q), true)).slice(0, 4)
}

// ─────────────────────────────────────────────────
// DB 캐시 (아티클 슬러그 포함 키로 중복 방지)
// ─────────────────────────────────────────────────
export async function getCachedSectionImage(
  cacheKey: string,
  usedUrls: Set<string>,
): Promise<string | null> {
  try {
    const usedList = Array.from(usedUrls)
    const notIn = usedList.length > 0
      ? `(${usedList.map(u => `'${u.replace(/'/g, "''")}'`).join(',')})`
      : `('__placeholder__')`

    const { data } = await supabase
      .from('entity_images')
      .select('image_url')
      .eq('entity_name', cacheKey)
      .not('image_url', 'in', notIn)
      .order('quality_score', { ascending: false })
      .limit(1)
      .single()

    return data?.image_url ?? null
  } catch {
    return null
  }
}

export async function cacheSectionImage(
  cacheKey: string,
  imageUrl: string,
  qualityScore = 70,
): Promise<void> {
  try {
    await supabase
      .from('entity_images')
      .upsert(
        {
          entity_name: cacheKey,
          image_url: imageUrl,
          source: 'unsplash',
          quality_score: qualityScore,
          is_primary: true,
        },
        { onConflict: 'entity_name,image_url' },
      )
  } catch (err) {
    console.error('Cache save error:', err)
  }
}
